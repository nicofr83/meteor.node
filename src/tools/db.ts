import 'reflect-metadata';
import { Service } from 'typedi';
import { DB_INT, dbConn } from './db_interface.js'

@Service()
export abstract class DB implements DB_INT {
    private instance_count = 0

    constructor() {
        this.instance_count++;
    }

    getInstanceCount(): number {
        return this.instance_count;
    }

    abstract connect(dbName?: string|undefined): Promise<dbConn>;
    abstract disconnect(myConn: dbConn): Promise<void>;
    abstract executeSQL(myConn: dbConn, sql: string, values?: any): Promise<any[]>;

    async beginTransaction(appDbConn: dbConn|undefined = undefined): Promise<dbConn> {
        var myConn: dbConn;

        if (appDbConn == undefined) {
            myConn = await this.connect();
        } else {
            myConn = appDbConn;
        }
        await this.executeSQL(myConn, 'BEGIN');
        return myConn;
    }

    async commitTransaction(myConn: dbConn): Promise<void> {
        if (myConn == undefined) {
            throw new Error('No connection to database');
        }
        await this.executeSQL(myConn, 'BEGIN');
    }

    async rollbackTransaction(myConn: dbConn): Promise<void> {
        if (myConn == undefined) {
            throw new Error('No connection to database');
        }
        await this.executeSQL(myConn, 'ROLLBACK');
   }

    async query(appDbConn: dbConn | undefined, sql: string, values: any = []): Promise<any[]> {
        let myconn: dbConn|undefined = undefined;
        let res: any[] | undefined;

        try {
            if (appDbConn == undefined){
                myconn = await this.connect();
                this.beginTransaction(myconn);
            }
            else
                myconn = appDbConn;

            const res = await this.executeSQL(myconn, sql, values);

            if (appDbConn == undefined) {
                this.disconnect(myconn);
                this.commitTransaction(myconn);
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

    async execute(myConn: dbConn | undefined, sql: string, values: any = []): Promise<any> {
        const rows = await this.query(myConn, sql, values);
        return rows[0];
    }
}
