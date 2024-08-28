import { Entity_Herited_INT, EntityData } from './entity_interface';
export type Entity_Child_INT = Entity_Herited_INT;


export interface IncidentData extends EntityData{
    date_utc: Date|undefined;
    source: string|undefined;
    level: string|undefined;
    reason: string|undefined;
    details: string|undefined;
    active: boolean|undefined;
}

export interface Incident_INT extends Entity_Child_INT {

}
