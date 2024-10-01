import { Entity_INT, EntityData } from './entity_interface.js';
import { DBConn } from '../tools/db_interface.js';

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

export interface X_Max_INT extends Entity_INT {
    updateMe(pgconn: DBConn|undefined): Promise<number|undefined>;
    deleteMe(pgconn: DBConn|undefined): Promise<number|undefined>;
}
