import { Entity_INT, EntityData } from './entity_interface.js';
import {Aggreg_Type} from '../tools/enums.js';
import { dbConn } from '../tools/db_interface.js';

export interface MesureData extends EntityData{
    name: string|undefined;
    json_input: string|undefined;
    json_input_bis: string|undefined;
    archive_col: string|undefined;
    archive_table: string|undefined;
    field_dir: bigint|undefined;
    max: boolean|undefined;
    min: boolean|undefined;
    agreg_type: Aggreg_Type|undefined;
    is_wind: boolean|undefined;
    allow_zero: boolean|undefined;
    convert: string|undefined;
    j: string|undefined;
};


export interface Mesure_INT extends Entity_INT {
    updateMe(pgconn: dbConn|undefined): Promise<number|undefined>;
    deleteMe(pgconn: dbConn|undefined): Promise<number|undefined>;
}