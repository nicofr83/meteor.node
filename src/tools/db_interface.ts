import pg from 'pg'
import { DBOptions } from './db'

export interface DB_INT {
    getInstanceCount(): number;
    connect(): Promise<pg.Client>;
    beginTransaction(pgconn?: pg.Client): Promise<pg.Client>;
    commitTransaction(pgconn: pg.Client): Promise<void>;
    rollbackTransaction(pgconn: pg.Client): Promise<void>;
    query(pgconn: pg.Client | undefined, sql: string, values?: any): Promise<any[]> ;
    execute(pgconn: pg.Client | undefined, sql: string, values?: any): Promise<any>;
    disconnect(pgconn: pg.Client): void;
}
