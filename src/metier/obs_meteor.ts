import 'reflect-metadata';
import { Service } from 'typedi';
import {Obs} from '../repository/obs.js';
import {ObsMeteor_INT, ObsData, dateLimits} from './obs_meteor_interface.js'
import { DBOptions } from '../tools/db_interface.js';

@Service({ transient: true })
export class ObsMeteor extends Obs implements ObsMeteor_INT {
    constructor(data: ObsData) {
        super(data);
    }
    public static async archiveDateLimits(): Promise<dateLimits>{
        const ret = await Obs.getOne(
            undefined, 
            {  'columns': 'min(datetime) as min, min(from_unixtime(datetime)) as min_dt, max(datetime) as max, max(from_unixtime(datetime)) as max_dt',
               'order': 'id'
            } as DBOptions);
            return ret as dateLimits;
    }

    public async getFromDump(archiveMin: number, archiveMax: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
