import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { dateLimits, Dump_INT } from './dump_interface.js'
import { DBOptions } from '../tools/db_interface.js';
import { meteorDate } from '../tools/meteor_date.js';
import { Log } from '../tools/log.js';
import { DB_MYSQL } from '../tools/db_mysql.js';
import { MesureMeteor } from './mesure_meteor.js';
import { MesureItem } from './mesure_meteor_interface.js';
import { PosteMeteor } from './poste_meteor.js';
import { AnyARecord } from 'node:dns';

@Service({ transient: true })
export class DumpMeteor implements Dump_INT {
    private meteor: string| undefined;
    private curPoste: PosteMeteor | undefined;
    private deltaTimezone: number = 0;
    private last_obs_date_utc: Date | undefined;
    private dbMysql = Container.get(DB_MYSQL);
    private myLog = Container.get(Log);
    private myMesure = Container.get(MesureMeteor);

    constructor() {
        this.curPoste = undefined;
        this.meteor = undefined;

        if (meteorDate != true) {
            throw new Error('meteorDate is not true');
        }
    }

    public async setStationName(meteor: string): Promise<PosteMeteor> {
        this.meteor = meteor;
        this.curPoste = await PosteMeteor.getOne(undefined, {'where': `meteor = \'${meteor}\'`} as DBOptions);
        if (this.curPoste === undefined) {
            throw new Error('Station ' + meteor + ' non trouvée');
        }
        this.deltaTimezone = this.curPoste.getData().delta_timezone;

        // last_obs_date_utc est la last_obs_date_local en UTC
        this.last_obs_date_utc = this.curPoste.getData().last_obs_date_local;
        if ( this.last_obs_date_utc != undefined) {
            this.last_obs_date_utc = this.last_obs_date_utc.LocalToUtcDate(this.deltaTimezone);
        }
        return this.curPoste;
    }

    public async archiveDateLimits(): Promise<dateLimits>{
        if (this.curPoste === undefined) {
            throw new Error('Station name is undefined');
        }
        var myConn: any = undefined;
        var ret = [] as dateLimits[];

        try {
            myConn = await this.dbMysql.connect(this.meteor);
            ret = await this.dbMysql.executeSQL(
                myConn,
                'select ' +
                'true as first_pass, ' +
                'false as stop, ' +

                'min(datetime) as min, ' +
                'min(datetime) as arch_min, ' +
                'min(from_unixtime(datetime)) as min_dt, ' +
                'min(from_unixtime(datetime)) as arch_min_dt, ' +

                'max(datetime) as max, ' +
                'max(datetime) as arch_max, ' +
                'max(from_unixtime(datetime)) as max_dt, ' +
                'max(from_unixtime(datetime)) as arch_max_dt ' +
                'from archive',
                []
            ) as dateLimits[];
        } finally {
            if (myConn != undefined) {
                this.dbMysql.disconnect(myConn);
                myConn = undefined;
            }
        }
        this.myLog.debug('archiveDateLimits', `global limits: from: ${ret[0].min_dt} to: ${ret[0].max_dt}`);
        return ret[0] as dateLimits;
    }

    public async getFromDump(limits: dateLimits): Promise<{archive: any[], records:any[]}> {
        var ret = {archive: [] as any[], records: [] as any[]};

        const mAll = await this.myMesure.getListe();
        // calling process should do:
        // var dateLimits = await this.archiveDateLimits();
        // if (dateLimits.min_dt < curPoste.getData().last_obs_date_local) {
        //     dateLimits.min_dt = curPoste.getData().last_obs_date_local;
        //     dateLimits.min = Math.floor(new Date('2012.08.10').getTime() / 1000);
        // }
        // save max/max_dt
        // dateLimits = this.getNextSlot(dateLimits, true);


        ret.archive = await this.loadArchiveData(mAll, limits);
        ret.records = await this.loadRecordsData(mAll, limits);

        return ret;
    }

    public getNextSlot(prevLimits: dateLimits, IsItFirstCall: boolean = false): dateLimits {
        if (prevLimits.stop) {
            return prevLimits;
        }
        if (prevLimits.first_pass == true) {
            prevLimits.first_pass = false;
            prevLimits.max = prevLimits.min;
            prevLimits.max_dt = prevLimits.min_dt;

            if (this.last_obs_date_utc != undefined) {
                if (this.last_obs_date_utc > prevLimits.min_dt) {
                    prevLimits.max_dt = this.last_obs_date_utc;
                    prevLimits.max = Math.floor(this.last_obs_date_utc.getTime() / 1000);
                }
            }
        }
        // set the min as the previous max
        prevLimits.min = prevLimits.max;
        prevLimits.min_dt = prevLimits.max_dt;

        prevLimits.max_dt = prevLimits.max_dt.getNextSlot(this.deltaTimezone, 15);
        prevLimits.max = Math.floor(prevLimits.max_dt.getTime() / 1000);

        return prevLimits;
    }

    private async loadArchiveData(mAll: MesureItem[], limits: dateLimits): Promise<any[]> {
        const sql_archive = this.loadArchiveSQL(mAll, limits);

        const myConn = await this.dbMysql.connect(this.meteor);
        const archData = await this.dbMysql.executeSQL(myConn, sql_archive, []);

        return archData;
    }

    private async loadRecordsData(mAll: MesureItem[], limits: dateLimits): Promise<any[]> {
        const recData = [] as any[];
        var myConn: any = undefined;
        try {
            myConn = await this.dbMysql.connect(this.meteor);
            for (const aMesure of mAll as MesureItem[]) {
                if (aMesure.archive_table == undefined || (aMesure.min == false && aMesure.max == false)) {
                    continue;
                }
                const sql_minmax = this.loadRecordSQL(aMesure, limits);
                const recMinMax = await this.dbMysql.executeSQL(myConn, sql_minmax, []);
                for (const rec of recMinMax) {
                    recData.push({
                        'mid': aMesure.id,
                        'dateTime': rec.dateTime,
                        'min': aMesure.min ? rec.min: undefined,
                        'mintime': aMesure.min ? rec.mintime: undefined,
                        'max': aMesure.max ? rec.max: undefined,
                        'maxtime': aMesure.max ? rec.maxtime: undefined,
                        'max_dir': rec.max_dir
                    })
                }
            }
        }
        catch (error) {
            throw new Error('loadRecordsData: ' + error);
        }
        finally {
            if (myConn != undefined) {
                this.dbMysql.disconnect(myConn);
                myConn = undefined;
            }
            return recData;
        }
    }

    public loadArchiveSQL(mAll: MesureItem[], limits: dateLimits): string {
    // date_local
    // date_utc
    // poste
    // duration
    
        var sql = 'select' +
            ' from_unixtime(datetime + 3600 * ' + (this.curPoste as PosteMeteor).getData().delta_timezone + ') as date_local,' +
            ' from_unixtime(datetime) as date_utc,'+
            ' ' + this.curPoste?.getData().id + ' as poste_id,' +
            ' `interval` as duration, ';
        for (const mItem of mAll) {
            if (mItem.archive_col != undefined) {
                sql += `${mItem.archive_col} as ${mItem.json_input}, `;
            }
        }
        sql = sql.slice(0, -2) + ` from archive `;
        sql += `where datetime > ${limits.min} and datetime <= ${limits.max} order by datetime`;

        return sql;
    }

    public loadRecordSQL(aMesure: MesureItem, limits: dateLimits): string {
        return 'select DATE_FORMAT(from_unixtime(datetime + 3600 * ' + (this.curPoste as PosteMeteor).getData().delta_timezone + '), \'%Y-%m-%d\') as date_local, ' +
        aMesure.id + ' as mid, ' +
            (aMesure.min ? 'min, ' : 'null, ') +
            (aMesure.min ? 'mintime, ' : 'null, ') +
            (aMesure.max ? 'max, ' : 'null, ') +
            (aMesure.max ? 'maxtime, ' : 'null, ') +
            (aMesure.is_wind == false ? 'null': 'max_dir') + ' as max_dir '+
            'from archive_day_' + aMesure.archive_table + ' ' +
            'where dateTime > ' + limits.min + ' and dateTime <= ' + limits.max + ' '+
            'order by date_local';
    }
}
