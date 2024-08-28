import 'reflect-metadata';
import { Service } from 'typedi';
import {Obs} from '../repository/obs';
import {ObsMeteor_INT, ObsData} from './obs_meteor_interface'
import { Code_QA } from '../tools/enums';

@Service({ transient: true })
export class ObsMeteor extends Obs implements ObsMeteor_INT {
    constructor(data: ObsData) {
        super(data);
    }
}
