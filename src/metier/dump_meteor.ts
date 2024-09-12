import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { dateLimits, Dump_INT } from './dump_interface.js'
import { DBOptions } from '../tools/db_interface.js';
import { Log } from '../tools/log.js';
import { DB_MYSQL } from '../tools/db_mysql.js';
import { MesureMeteor } from './mesure_meteor.js';
import { MesureItem } from './mesure_meteor_interface.js';
import { PosteMeteor } from './poste_meteor.js';

@Service({ transient: true })
export class DumpMeteor implements Dump_INT {
    private meteor: string| undefined;
    private curPoste: PosteMeteor | undefined;
    private dbMysql = Container.get(DB_MYSQL);
    private myLog = Container.get(Log);
    private myMesure = Container.get(MesureMeteor);

    constructor() {
        this.curPoste = undefined;
    }

    public async setStationName(meteor: string): Promise<PosteMeteor> {
        this.meteor = meteor;
        this.curPoste = await PosteMeteor.getOne(undefined, {'where': `meteor = \'${meteor}\'`} as DBOptions);
        return this.curPoste;
    }

    public async archiveDateLimits(): Promise<dateLimits>{
        if (this.curPoste === undefined) {
            throw new Error('Station name is undefined');
        }
        const myConn = await this.dbMysql.connect(this.meteor);
        const ret = await this.dbMysql.executeSQL(
            myConn,
            'select min(datetime) as min, min(from_unixtime(datetime)) as min_dt, max(datetime) as max, max(from_unixtime(datetime)) as max_dt from archive',
            []
        );
        this.myLog.debug('archiveDateLimits', `global limits: from: ${ret[0].min_dt} to: ${ret[0].max_dt}`);
        return ret[0] as dateLimits;
    }

    public async getFromDump(curPoste: PosteMeteor, limits: dateLimits): Promise<{archive: any[], records:any[]}> {
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
        if (!prevLimits.first_pass) {
            prevLimits.first_pass = true;
            prevLimits.min = prevLimits.max;
            prevLimits.min_dt = prevLimits.max_dt;
            if (this.curPoste?.getData().last_obs_date_local != undefined) {
                if (this.curPoste.getData().last_obs_date_local > prevLimits.min_dt) {
                    prevLimits.min_dt = this.curPoste.getData().last_obs_date_local;
                    prevLimits.min = Math.floor(prevLimits.min_dt.getTime() / 1000);
                }
            }
        }
        if (prevLimits.min_dt.getDay() < 15) {
            prevLimits.min_dt.setDate(1);
            if (prevLimits.min_dt.getMonth() > 12) {
                prevLimits.min_dt.setMonth(1);
                prevLimits.min_dt.setFullYear(prevLimits.min_dt.getFullYear() + 1);
            } else {
                prevLimits.min_dt.setMonth(prevLimits.min_dt.getMonth() + 1);
            }
        } else {
            prevLimits.min_dt.setDate(15);
        }
        if (prevLimits.max_dt.toJSON().indexOf('T00:00:00.000Z') != -1){
            prevLimits.max_dt = new Date(prevLimits.max_dt.getFullYear(), prevLimits.max_dt.getMonth(), prevLimits.max_dt.getDay(), 0,0,0);   
            
            var dt = new Date();
            new Date(dt.getFullYear(), dt.getMonth(), dt.getDay(), 0,0,0);
            // dt.get
        } 
        prevLimits.max = prevLimits.max_dt.getTime() / 1000;

        this.myLog.debug('getNextSlot', `from: ${prevLimits.min_dt} to: ${prevLimits.max_dt}`);
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
        const sql_minmax = this.loadRecordSQL(mAll, limits);


        return recData;
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
        sql += `where datetime >= ${limits.min} and datetime < ${limits.max} order by datetime`;

        return sql;
    }

    public loadRecordSQL(mAll: MesureItem[], limits: dateLimits): string[] {
        const sql_records = [] as string[];

        for (const m of mAll as MesureItem[]) {
            if (m.archive_table == undefined) {
                continue;
            }
            if (m.is_wind == false) {
                sql_records.push(
                    `select min, mintime, max, maxtime, null as max_dir, ${m.id} as mid, dateTime ` +
                    `from archive_day_${m.archive_table} ` +
                    `where dateTime >= ${limits.min} and dateTime < ${limits.max} order by dateTime`
                );
            } else {
                sql_records.push(
                    `select min, mintime, max, maxtime, max_dir, ${m.id} as mid, dateTime ` +
                    `from archive_day_${m.archive_table} ` +
                    `where dateTime >= ${limits.min} and dateTime < ${limits.max} order by dateTime`
                );
            }
        }
        return sql_records;
    }
}
