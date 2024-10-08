import { DBOptions, DBConn } from '../tools/db_interface.js'

export interface EntityData{
    [key: string]: any;
    id: bigint|undefined;
}

export interface Entity_INT {
    getData(): EntityData;
    setData(newData: EntityData): void;
    setOnlyData(newData: EntityData): void;
    getIsDirty(): boolean;
    setDirtyCols(newDirtyFlag: boolean): void;
    getTableName(): string;
    setTableName(newTableName: string): void;
    getColumnsNames(curData: any, colSpec: string|string[]|undefined): string ;
    buildSelectRequest(dbOptions: DBOptions): string;
    getOneDBData(pgconn: DBConn|undefined, dbOptions?: DBOptions): Promise<EntityData>;
    getDBData(pgconn: DBConn|undefined, dbOptions?: DBOptions): Promise<EntityData[]>;
    count(pgconn: DBConn|undefined, dbOptions?: DBOptions): Promise<any>;
    updateAll(pgconn: DBConn|undefined, dbOptions?: DBOptions): Promise<any[]>;
    deleteAll(pgconn: DBConn|undefined, dbOptions?: DBOptions): Promise<any[]>;
    insertMe(pgconn: DBConn|undefined): Promise<void>;
}

