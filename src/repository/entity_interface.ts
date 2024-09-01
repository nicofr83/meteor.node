import { DBOptions } from '../tools/db.js'
import pg from 'pg'

export interface EntityData{
    [key: string]: any;
    id: bigint|undefined;
}

export interface Entity_INT{
    getData(): EntityData;
    setData(newData: EntityData): void;
    getIsDirty(): boolean;
    setDirtyCols(newDirtyFlag: boolean): void;
    getTableName(): string;
    setTableName(newTableName: string): void;
    getColumnsNames(curData: any, colSpec: string|string[]|undefined): string ;
    buildSelectRequest(dbOptions: DBOptions): string;
    getOneDBData(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<EntityData>;
    getDBData(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<EntityData[]>;
    updateAll(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<any[]>;
    deleteAll(pgconn: pg.Client|undefined, dbOptions?: DBOptions): Promise<any[]>;
    insertMe(pgconn: pg.Client|undefined): Promise<void>;
}
export interface Entity_Herited_INT extends Entity_INT {
    // getIsDirty(): boolean;
    // setIsDirty(newDirtyFlag: boolean): void;
    // getDirtyCols(): string[];
    // setDirtyCols(newDirtyFlag: boolean): void;
    // getTableName(): string;
    // setTableName(newTableName: string): void;
    // getColumnsNames(curData: any, colSpec: string|string[]|undefined): string ;
    // buildSelectRequest(dbOptions: DBOptions): string;
    updateMe(pgconn: pg.Client|undefined): Promise<number|undefined>;
    deleteMe(pgconn: pg.Client|undefined): Promise<number|undefined>;

    // static methods:
    // getById(pgconn: pg.Client|undefined, id: number, dbOptions?: DBOptions): Promise<Entity_Herited_INT;
    // getOne(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Poste>
    // getAll(pgconn: pg.Client|undefined, id: number, dbOptions?: DBOptions): Promise<Entity_Herited_INT[]>;
    // liste(pgconn: pg.Client|undefined, id: number, dbOptions?: DBOptions): Promise<PosteData[]>; 
}
