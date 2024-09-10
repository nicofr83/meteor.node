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
    private dbName: string | undefined;
    private db_mysql = Container.get(DB_MYSQL);
    private myLog = Container.get(Log);
    private myMesure = Container.get(MesureMeteor);
    private sql_archive: string;
    private sql_minmax: string [];

    constructor() {
        this.dbName = undefined;
        this.sql_archive = '';
        this.sql_minmax = [];
    }
    public setDbName(dbName: string): void {
        this.dbName = dbName;
    }
    public async archiveDateLimits(): Promise<dateLimits>{
        if (this.dbName === undefined) {
            throw new Error('dbName is undefined');
        }
        const myConn = await this.db_mysql.connect(this.dbName);
        const ret = await this.db_mysql.executeSQL(
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


        this.sql_archive = this.loadArchiveSQL(mAll, limits);
        this.sql_minmax = this.loadRecordSQL(mAll, limits);

        ret.archive = await this.loadArchiveData();
        ret.records = await this.loadRecordsData();

        return ret;
    }
    public getNextSlot(prevLimits: dateLimits, IsItFirstCall: boolean = false): dateLimits {
        if (!IsItFirstCall) {
            // min = max; min_dt = max_dt
        }
        // just set max/max_dt depending on min/min_dt



        this.myLog.debug('getNextSlot', `from: ${prevLimits.min_dt} to: ${prevLimits.max_dt}`);
        const nextLimits = {
            min: 0,
            min_dt: new Date(1990, 1, 1),
            max: Number.MAX_SAFE_INTEGER,
            max_dt: new Date(2050, 12, 31)
        } as dateLimits;

        return nextLimits;
    }
    private async loadArchiveData(): Promise<any[]> {
        const archData = [] as any[];

        return archData;
    }
    private async loadRecordsData(): Promise<any[]> {
        const recData = [] as any[];

        return recData;
    }

    public loadArchiveSQL(mAll: MesureItem[], limits: dateLimits): string {
        var sql = 'select datetime, from_unixtime(datetime) as date_utc, usUnits, `interval`, ';
        for (const m of mAll as MesureItem[]) {
            sql += `${m.archive_col}, `;
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
