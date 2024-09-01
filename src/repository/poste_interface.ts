import { Entity_Herited_INT, EntityData } from './entity_interface.js';
export type Entity_Child_INT = Entity_Herited_INT;
import {DataSource, LoadType} from '../tools/enums.js';

export interface PosteData extends EntityData{
    meteor: string|undefined;
    delta_timezone: number | undefined;
    data_source: DataSource | undefined;
    load_type: LoadType | undefined;
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

export interface Poste_INT extends Entity_Child_INT {

}
