import 'reflect-metadata';
import { Service } from 'typedi';
import {Incident} from '../repository/incident';
import {IncidentMeteor_INT, IncidentData} from './incident_meteor_interface'

@Service({ transient: true })
export class IncidentMeteor extends Incident implements IncidentMeteor_INT {
    constructor(data: IncidentData) {
        super(data);
    }
}
