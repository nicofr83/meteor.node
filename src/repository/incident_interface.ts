import { Entity_INT, EntityData } from './entity_interface.js';
import { DBConn } from '../tools/db_interface.js';

export interface IncidentData extends EntityData{
    date_utc: Date|undefined;
    source: string|undefined;
    level: string|undefined;
    reason: string|undefined;
    details: string|undefined;
    active: boolean|undefined;
}

export interface Incident_INT extends Entity_INT {
    updateMe(pgconn: DBConn|undefined): Promise<number|undefined>;
    deleteMe(pgconn: DBConn|undefined): Promise<number|undefined>;
}
