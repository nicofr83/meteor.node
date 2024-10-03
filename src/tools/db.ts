import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { DB_INT, DBConn } from './db_interface'
import {Log} from "./log.js";

@Service()
export abstract class DB implements DB_INT {
    private instance_count = 0
    public myLog: Log;

    constructor() {
        this.myLog = Container.get(Log);
        this.instance_count++;
    }

    getInstanceCount(): number {
        return this.instance_count;
    }

    abstract connect(dbName?: string|undefined): Promise<DBConn>;
    abstract disconnect(myConn: DBConn): Promise<void>;
    abstract executeSQL(myConn: DBConn, sql: string, values?: any): Promise<any[]>;

    async beginTransaction(appDbConn: DBConn|undefined = undefined): Promise<DBConn> {
        var myConn: DBConn;

        if (appDbConn == undefined) {
            myConn = await this.connect();
        } else {
            myConn = appDbConn;
        }
        await this.executeSQL(myConn, 'BEGIN');
        return myConn;
    }

    async commitTransaction(myConn: DBConn): Promise<void> {
        if (myConn == undefined) {
            throw new Error('No connection to database');
        }
        await this.executeSQL(myConn, 'COMMIT');
    }

    async rollbackTransaction(myConn: DBConn): Promise<void> {
        if (myConn == undefined) {
            throw new Error('No connection to database');
        }
        await this.executeSQL(myConn, 'ROLLBACK');
   }

    async query(appDbConn: DBConn | undefined, sql: string, values: any = []): Promise<any[]> {
        let myconn: DBConn|undefined = undefined;
        let res: any[] | undefined;

        try {
            if (appDbConn == undefined){
                myconn = await this.connect();
                this.beginTransaction(myconn);
            }
            else
                myconn = appDbConn;

            this.myLog.debug('query', sql, values);

            const res = await this.executeSQL(myconn, sql, values);

            if (appDbConn == undefined) {
                this.commitTransaction(myconn);
                this.disconnect(myconn);
            }

            return res as any[];

        } catch (err) {
            console.error(err);
            if (myconn != undefined){
                this.rollbackTransaction(myconn);
            }
            if (appDbConn == undefined && myconn != undefined){
                this.disconnect(myconn);
            }
            throw err;
        }
    }

    async execute(myConn: DBConn | undefined, sql: string, values: any = []): Promise<any> {
        const rows = await this.query(myConn, sql, values);
        return rows[0];
    }
}
