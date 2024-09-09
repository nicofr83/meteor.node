import 'reflect-metadata';
import { Service } from 'typedi';
import { DB } from './db'
import mysql from 'mysql2/promise';

@Service()
export class DB_MYSQL extends DB{
    private pool: Array<{dbName: string, pool: mysql.Pool}>;

    constructor() {
        super();
        this.pool = new Array<{dbName: string, pool: mysql.Pool}>(5);
    }

    async connect(dbName: string|undefined = undefined): Promise<mysql.PoolConnection> {
        var tmpPool: mysql.Pool|undefined = undefined;
        try {
            if (process.env.MYSQL_DB?.indexOf('?') != -1) {
                dbName = process.env.MYSQL_DB;
            }
            const varIdx = (dbName == undefined) ? -1 : this.pool.findIndex((P => P.dbName == dbName));
            if (varIdx != -1) {
                return await this.pool[varIdx].pool.getConnection();
            }
            tmpPool = mysql.createPool({
                host: process.env.MYSQL_HOST ? process.env.MYS_HOST : 'localhost',
                user: process.env.MYSQL_USER ? process.env.MYS_USER : 'nico',
                password: process.env.MYSQL_PASSWORD ? process.env.MYS_PASSWORD : 'Funiculi',
                database: dbName ? dbName : 'BBF015',
                port: Number(process.env.MYSQL_PORT ? process.env.MYS_PORT : 3306),
                waitForConnections: true,
                connectionLimit: 10,
                maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
                idleTimeout: 100000, // idle connections timeout, in milliseconds, the default value 60000
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0,
                timezone: 'utc'
            });
            this.pool.push({dbName: dbName as string, pool: tmpPool});
        } catch (err: any) {
            this.myLog.exception('db_mysql', err);
        }
        return await (tmpPool as mysql.Pool).getConnection();
    }

    async executeSQL(myConn: mysql.PoolConnection, sql: string, values: any): Promise<any[]>{
        const [rows, fields]  = (await myConn.query(sql, values));
        if (rows == undefined) {
            return [];
        }
        return rows as any[];
    }

    async disconnect(myConn: mysql.PoolConnection): Promise<void> {
        if (!myConn) {
            throw new Error('No connection to database');
        }
        // console.log('I am disconnecting!');
        myConn.release();
    }
}
