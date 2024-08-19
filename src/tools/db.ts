import 'reflect-metadata';

import { Service } from 'typedi';

import pg from 'pg'

@Service( )
export class DB {
    private instance_count = 0

    constructor() {
        this.instance_count++;
    }

    getInstanceCount(): number {
        return this.instance_count;
    }

    async connect() {

        const client = new pg.Client({
            user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : 'postgres',
            password: process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : '',
            host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : 'localhost',
            port: parseInt(process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : '5432'),
            database: process.env.POSTGRES_DB ? process.env.POSTGRES_DB : 'climato'
            // ssl?: any, // passed directly to node.TLSSocket, supports all tls.connect options
            // types?: any, // custom type parsers
            // statement_timeout?: number, // number of milliseconds before a statement in query will time out, default is no timeout
            // query_timeout?: number, // number of milliseconds before a query call will timeout, default is no timeout
            // lock_timeout?: number, // number of milliseconds a query is allowed to be en lock state before it's cancelled due to lock timeout
            // application_name?: string, // The name of the application that created this Client instance
            // connectionTimeoutMillis?: number, // number of milliseconds to wait for connection, default is no timeout
            // idle_in_transaction_session_timeout?: number // number of milliseconds before terminating any session with an open idle transaction, default is no timeout
        });
        // console.log('I am connecting!');
        await client.connect();
        return client;
    }
    async beginTransaction(pgconn: pg.Client): Promise<void> {
        if (!pgconn) {
            throw new Error('No connection to database');
        }
        await pgconn.query('BEGIN');
    }
    async commitTransaction(pgconn: pg.Client): Promise<void> {
        if (!pgconn) {
            throw new Error('No connection to database');
        }
        await pgconn.query('COMMIT');
    }
    async rollbackTransaction(pgconn: pg.Client): Promise<void> {
        if (!pgconn) {
            throw new Error('No connection to database');
        }
        await pgconn.query('ROLLBACK');
    }
    async query(pgconn: pg.Client, sql: string, values: any = []): Promise<any[]> {
        let myconn: pg.Client | undefined;
        let res: pg.QueryResult<any> | undefined;

        try {
            if (!pgconn){
                myconn = await this.connect();
                this.beginTransaction(myconn);
            }
            else
                myconn = pgconn;

            const res = await (myconn as pg.Client).query(sql, values);

            if (!pgconn)
                this.disconnect(myconn);

            return (res as pg.QueryResult<any>).rows;

        } catch (err) {
            console.error(err);
            if (myconn != undefined) {
                this.rollbackTransaction(myconn);
                this.disconnect(myconn as pg.Client);
            }
            throw err;
        }
    }
    async execute(pgconn: pg.Client, sql: string, values: any = []): Promise<any> {
        const rows = await this.query(pgconn, sql, values);
        return rows[0];
    }

    async disconnect(pgconn: pg.Client) {
        if (!pgconn) {
            throw new Error('No connection to database');
        }
        // console.log('I am disconnecting!');
        await pgconn.end();
    }
}
