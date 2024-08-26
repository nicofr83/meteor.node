
import { DBOptions } from '../tools/db'
import pg from 'pg'
import { Entity } from './entity';
import { Entity_INT } from './entity_interface';

export enum Data_Source{
    NONE = 0,
    METEOR_OI = 1,
    METEO_FR = 2,
    OVPF = 3
}

export enum Load_Type{
    NONE = 0,
    LOAD_FROM_DUMP = 1,
    LOAD_FROM_JSON = 2,
    LOAD_FROM_DUMP_THEN_JSON = 3,
    LOAD_CSV_FOR_METEOFR = 4,
    LOAD_CSV_FOR_OVPF = 8
}

export interface PosteData{
    [key: string]: any;
    id: bigint|undefined;
    meteor: string|undefined;
    delta_timezone: number | undefined;
    data_source: Data_Source | undefined;
    load_type: Load_Type | undefined;
    api_key: string | undefined;
    type: string | undefined;
    altitude: number | undefined;
    lat: number | undefined;
    long: number | undefined;
    info: string | undefined;
    stop_date: Date | undefined;
    last_obs_date_local: Date | undefined;
    last_obs_id: number | undefined;
    last_json_date_local: Date | undefined;
    info_sync: number | undefined;
}
export interface Poste_INT<T> extends Entity_INT<T> {
    getTableName(): string;
    setTableName(newTableName: string): void;
    getColumnsNames(curData: any, colSpec: string|string[]|undefined): string ;
    buildSelectRequest(dbOptions: DBOptions): string;

    // getById(pgconn: pg.Client, id: number, dbOptions: DBOptions): Promise<Poste_INT>;
    // getAll(pgconn: pg.Client, id: number, dbOptions: DBOptions): Promise<Poste_INT[]>;
    // liste(pgconn: pg.Client, id: number, dbOptions: DBOptions): Promise<PosteData[]>;
// update(pgconn: pg.Client): Promise<void>;
}
