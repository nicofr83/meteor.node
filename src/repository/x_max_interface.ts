import { Entity_Herited_INT, EntityData } from './entity_interface';
export type Entity_Child_INT = Entity_Herited_INT;


export interface X_MaxData extends EntityData{
    obs_id: number|undefined;
    date_local: Date|undefined;
    poste: number|undefined;
    mesure: number|undefined;
    max: number|undefined;
    max_time: number|undefined;
    max_dir: Date|undefined;
    qa_max: number|undefined;
}

export interface X_Max_INT extends Entity_Child_INT {

}
