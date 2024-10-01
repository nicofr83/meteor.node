
import { Entity_INT, EntityData } from './entity_interface.js';
import { DBConn } from '../tools/db_interface.js';

export interface X_MinData extends EntityData{
    obs_id: number|undefined;
    date_local: Date|undefined;
    poste: number|undefined;
    mesure: number|undefined;
    min: number|undefined;
    min_time: Date|undefined;
    qa_min: number|undefined;
}

export interface X_Min_INT extends Entity_INT {
    updateMe(pgconn: DBConn|undefined): Promise<number|undefined>;
    deleteMe(pgconn: DBConn|undefined): Promise<number|undefined>;
}
