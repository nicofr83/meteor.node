import { DBOptions } from '../tools/db'
import pg from 'pg'

export interface Entity_INT<T> {
    getData(): T;
    setData(newData: T): void;
    getIsDirty(): boolean;
    setDirtyCols(newDirtyFlag: boolean): void;
    getTableName(): string;
    setTableName(newTableName: string): void;
    getColumnsNames(curData: any, colSpec: string|string[]|undefined): string ;
    buildSelectRequest(dbOptions: DBOptions): string;
    getOneDBData(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<T>;
    getDBData(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<T[]>;
    update(pgconn: pg.Client|undefined): Promise<void>;
    delete(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<number[]>;
}
