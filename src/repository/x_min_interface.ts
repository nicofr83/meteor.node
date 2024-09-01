
import { Entity_Herited_INT, EntityData } from './entity_interface.js';
export type Entity_Child_INT = Entity_Herited_INT;


export interface X_MinData extends EntityData{
    obs_id: number|undefined;
    date_local: Date|undefined;
    poste: number|undefined;
    mesure: number|undefined;
    min: number|undefined;
    min_time: Date|undefined;
    qa_min: number|undefined;
}

export interface X_Min_INT extends Entity_Child_INT {

}
