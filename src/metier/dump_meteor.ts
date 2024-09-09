import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { dateLimits, Dump_INT } from './dump_interface.js'
import { DBOptions } from '../tools/db_interface.js';
import { DB_MYSQL } from '../tools/db_mysql.js';

@Service({ transient: true })
export class DumpMeteor implements Dump_INT {
    private dbName: string | undefined;
    private db_mysql = Container.get(DB_MYSQL);

    constructor() {
        this.dbName = undefined;
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
        return ret[0] as dateLimits;
    }

    public async getFromDump(archiveMin: number, archiveMax: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
