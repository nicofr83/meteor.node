import { PoolClient } from 'pg'
import mysql from 'mysql2/promise';
import pg from 'pg';
import { DBLock } from './enums.js';

export interface DBOptions {
    columns: string|string[]|undefined;
    where: string|undefined;
    order: string|undefined;
    lock: DBLock|undefined;
    limit: number|undefined;
    returning: string|undefined;
}

// export type dbConn = PoolClient | mysql.PoolConnection;
export type dbConn = any;

export interface DB_INT {
    getInstanceCount(): number;
    beginTransaction(pgconn?: dbConn): Promise<dbConn>;
    commitTransaction(pgconn: dbConn): Promise<void>;
    rollbackTransaction(pgconn: dbConn): Promise<void>;
    query(pgconn: dbConn | undefined, sql: string, values?: any): Promise<any[]> ;
    execute(pgconn: dbConn | undefined, sql: string, values?: any): Promise<any>;

    // abstract
    // connect(dbName?: string|undefined): Promise<pg.Pool>;
    // executeSQL(pgconn: pg.Pool, sql: string, values: any): Promise<any[]>;
    // disconnect(pgconn: pg.Client): Promise<void>;
}
