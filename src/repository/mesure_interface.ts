import { Entity_Herited_INT, EntityData } from './entity_interface';
export type Entity_Child_INT = Entity_Herited_INT;

export enum Aggreg_Type{
NONE = 0,
AVG = 1,
SUM = 2,
MAX = 3,
MIN = 4
}

export interface MesureData extends EntityData{
name: string|undefined;
json_input: string|undefined;
json_input_bis: string|undefined;
archive_col: string|undefined;
archive_table: string|undefined;
field_dir: number|undefined;
max: boolean|undefined;
min: boolean|undefined;
agreg_type: Aggreg_Type|undefined;
is_wind: boolean|undefined;
allow_zero: boolean|undefined;
convert: string|undefined;
j: string|undefined;
};

export interface Mesure_INT extends Entity_Child_INT {

}
