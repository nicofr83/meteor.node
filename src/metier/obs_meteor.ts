import 'reflect-metadata';
import { Service } from 'typedi';
import {Obs} from '../repository/obs.js';
import {ObsMeteor_INT, ObsData} from './obs_meteor_interface.js'
import { DBOptions } from '../tools/db_interface.js';

@Service({ transient: true })
export class ObsMeteor extends Obs implements ObsMeteor_INT {
    constructor(data: ObsData) {
        super(data);
    }

    public async getFromDump(archiveMin: number, archiveMax: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
