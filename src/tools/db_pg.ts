import 'reflect-metadata';
import { Service } from 'typedi';
import { DB } from './db'
import pg from 'pg'

@Service()
export class DB_PG extends DB{
    private pool: pg.Pool;

    constructor() {
        super();
        this.pool = new pg.Pool ({
            user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : 'postgres',
            password: process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : '',
            host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : 'localhost',
            port: parseInt(process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : '5432'),
            database: process.env.POSTGRES_DB ? process.env.POSTGRES_DB : 'climato'
        });

    }

    async connect(dbName: string|undefined = undefined): Promise<pg.PoolClient> {
        if (dbName != undefined && dbName != this.pool.options.database) {
            throw new Error('Database name mismatch');
        }
        // console.log('I am connecting!');
        const client = await this.pool.connect();
        return client;
    }

    async executeSQL(pgconn: pg.PoolClient, sql: string, values: any): Promise<any[]>{
        const ret = (await pgconn.query(sql, values));
        if (ret == undefined) {
            return [];
        }
        return ret.rows;
    }

    async disconnect(pgconn: pg.PoolClient): Promise<void> {
        if (!pgconn) {
            throw new Error('No connection to database');
        }
        // console.log('I am disconnecting!');
        await pgconn.release();
    }
}
