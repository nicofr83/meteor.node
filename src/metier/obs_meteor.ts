import 'reflect-metadata';
import { Service } from 'typedi';
import {Obs} from '../repository/obs';
import {ObsMeteor_INT, ObsData, Code_QA} from './obs_meteor_interface'

@Service({ transient: true })
export class ObsMeteor extends Obs implements ObsMeteor_INT {
    constructor(data: ObsData) {
        super(data);
    }
}
