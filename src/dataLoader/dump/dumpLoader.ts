import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { dateLimits, DumpLoader_INT } from './dumpLoader_interface.js'
import { meteorDate } from '../../tools/meteor_date.js';
import { Log } from '../../tools/log.js';
import { DB_MYSQL } from '../../tools/db_mysql.js';
import { MesureMeteor } from '../../metier/mesure_meteor.js';
import { MesureItem} from '../../metier/mesure_meteor_interface.js';
import { DataLoader } from '../dataLoader.js';
import { DumpArchive, DumpArchiveIdx, DumpArray} from '../dataLoader_interface.js';
import { PosteMeteor } from '../../metier/poste_meteor.js';

@Service({ transient: true })
export class DumpLoader extends DataLoader implements DumpLoader_INT {
    private meteor: string| undefined;
    private curPoste: PosteMeteor | undefined;
    private deltaTimezone: number = 0;
    private last_obs_date_utc: Date | undefined;
    private dbMysql = Container.get(DB_MYSQL);
    private myMesure = Container.get(MesureMeteor);
    // private mAll: MesureItem[] = [];

    constructor() {
        super();
        this.curPoste = undefined;
        this.meteor = undefined;

        if (meteorDate != true) {
            throw new Error('meteorDate is not loaded');
        }    
    }
    
    public setStation(meteor: string, cur_poste: PosteMeteor): void {
        this.meteor = meteor;
        this.curPoste = cur_poste;
        if (this.curPoste === undefined) {
            throw new Error('Station ' + meteor + ' non trouvée');
        }
        this.deltaTimezone = this.curPoste.getData().delta_timezone;

        // last_obs_date_utc est la last_obs_date_local en UTC
        this.last_obs_date_utc = this.curPoste.getData().last_obs_date_local;
        if ( this.last_obs_date_utc != undefined) {
            this.last_obs_date_utc = this.last_obs_date_utc.LocalToUtcDate(this.deltaTimezone);
        }
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

                'min(datetime) -1 as min, ' +
                'min(datetime) -1 as arch_min, ' +
                'min(from_unixtime(datetime - 1)) as min_dt, ' +
                'min(from_unixtime(datetime - 1)) as arch_min_dt, ' +

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

    public async getFromDump(limits: dateLimits): Promise<DumpArray> {
        var ret = {archive: [] as any[], records: [] as any[]} as DumpArray

        this.mAll = await this.myMesure.getListe();

        ret.archive = await this.loadArchiveData(this.mAll, limits);
        ret.records = await this.loadRecordsData(this.mAll, limits);
        return ret;
    }

    public async getFirstSlot(): Promise<dateLimits>{
        var dl = await this.archiveDateLimits();
        dl.first_pass == true
        return this.getNextSlot(dl);
    }

    public getNextSlot(prevLimits: dateLimits, nbDays: number = 30): dateLimits {
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

        prevLimits.max_dt = prevLimits.max_dt.getNextDate(this.deltaTimezone, nbDays);
        prevLimits.max = Math.floor(prevLimits.max_dt.getTime() / 1000);

        return prevLimits;
    }

    public async loadArchiveData(mAll: MesureItem[], limits: dateLimits): Promise<DumpArchive[]> {
        var archData = [] as DumpArchive[];
        var myConn: any = undefined;
        const sql_archive = this.loadArchiveSQL(mAll, limits);

        try {
            myConn = await this.dbMysql.connect(this.meteor);
            archData = await this.dbMysql.executeSQL(myConn, sql_archive, [], true);
        }
        finally {
            if (myConn != undefined) {
                this.dbMysql.disconnect(myConn);
                myConn = undefined;
            }
        }
        return archData;
    }

    public async loadRecordsData(mAll: MesureItem[], dateLimits: dateLimits): Promise<any[]> {
        var recData = [] as any[];
        var myConn: any = undefined;
        try {
            myConn = await this.dbMysql.connect(this.meteor);
            for (const aMesure of mAll as MesureItem[]) {
                if (aMesure.archive_table == undefined || (aMesure.min == false && aMesure.max == false)) {
                    continue;
                }
                const sql_minmax = this.loadRecordSQL(aMesure, dateLimits);
                const recMinMax = await this.dbMysql.executeSQL(myConn, sql_minmax, [], true);

                var recDataTmp = [...recData, ...recMinMax];
                recData = recDataTmp;
                recDataTmp = [];
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

    public addMesureValueToRecords(dumpData: DumpArray): void {
        const date_local_key: keyof typeof dumpData.archive = DumpArchiveIdx.date_local;
        
        for (const anArchiveData of dumpData.archive) {
            const obs_id =  anArchiveData[DumpArchiveIdx.obs_id];
            for (const aMesure of this.mAll) {
                if (aMesure.archive_table == undefined || (aMesure.min == false && aMesure.max == false)) {
                    continue;
                }
                var json_input_key: keyof typeof DumpArchiveIdx = aMesure.json_input as any;
                const obs_date = new Date(anArchiveData[date_local_key]);
                const obs_value = anArchiveData[DumpArchiveIdx[json_input_key]];
                if ((aMesure.allow_zero == false && obs_value == 0 ) || obs_value == undefined) {
                    continue;
                }
                dumpData.records.push([
                    new Date(obs_date.setHours(0,0,0,0)),
                    Number(aMesure.id),
                    this.curPoste?.getData().id,
                    obs_id,
                    0,
                    aMesure.min == true ? obs_value : undefined,
                    aMesure.min == true ? obs_date : undefined,
                    aMesure.max == true ? obs_value : undefined,
                    aMesure.max == true ? obs_date : undefined,
                    undefined,
                    // (113, 'gust dir',        'wind_gust_dir',   'windGustDir',      'skip',       null,     false,   false,    0,      false,    true,  'wind_max_dir',        '{}'),
                    // (114, 'gust',            'wind_gust',       'windGust',         'wind',       113,      false,   true,     3,       true,    true,      'wind_max',
                ]);
            }
        }
    }
    public loadArchiveSQL(mAll: MesureItem[], limits: dateLimits): string {
        // we add a column with null value to store obs_id to be used in x_min/x_max tables to link to obs table
        var sql = 'select' +
            ' from_unixtime(datetime + 3600 * ' + (this.curPoste as PosteMeteor).getData().delta_timezone + ') as date_local,' +
            ' from_unixtime(datetime) as date_utc,'+
            ' ' + this.curPoste?.getData().id + ' as poste_id,' +
            ' `interval` as duration, ';
        for (const mItem of mAll) {
            // console.log(mItem.name);
            if (mItem.archive_col != undefined) {
                sql += `${mItem.archive_col} as ${mItem.json_input}, `;
            }
        }
        sql += `null from archive `;
        sql += `where datetime > ${limits.min} and datetime <= ${limits.max} order by datetime`;

        return sql;
    }

    // select from_unixtime(datetime + 3600 * 4) as date_local, from_unixtime(datetime) as date_utc, 35 as poste_id, `interval` as duration from archive limit 10;

    public loadRecordSQL(aMesure: MesureItem, limits: dateLimits): string {
        var removeZeroValue = '';
        if (aMesure.allow_zero == false) {
            if (aMesure.min) {
                removeZeroValue = 'and min != 0 ';
            }
            if (aMesure.max) {
                removeZeroValue = 'and max != 0 ';
            }
        }
        return 'select DATE_FORMAT(from_unixtime(datetime + 3600 * ' + (this.curPoste as PosteMeteor).getData().delta_timezone + '), \'%Y-%m-%d\') as date_local, ' +
            aMesure.id + ' as mid, ' +
            this.curPoste?.getData().id + ' as pid, ' +
            'null as value, ' +
            '0, ' +  // QA.UNSET
            (aMesure.min ? 'min, ' : 'null, ') +
            (aMesure.min ? 'from_unixtime(mintime + 3600 * ' + (this.curPoste as PosteMeteor).getData().delta_timezone + '), ' : 'null, ') +
            (aMesure.max ? 'max, ' : 'null, ') +
            (aMesure.max ? 'from_unixtime(maxtime + 3600 * ' + (this.curPoste as PosteMeteor).getData().delta_timezone + '), ' : 'null, ') +
            (aMesure.is_wind == false ? 'null': 'max_dir') + ' as max_dir '+
            'from archive_day_' + aMesure.archive_col + ' ' +
            'where dateTime > ' + limits.min + ' and dateTime <= ' + limits.max + ' '+
            removeZeroValue + 
            'order by date_local';
    }
}
