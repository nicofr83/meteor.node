import { syncBuiltinESMExports } from 'node:module';
import {Obs_INT, ObsData as OData} from '../repository/obs_interface.js'

export interface ObsData extends OData{};

export interface dateLimits {
    min: number | undefined;
    min_dt: Date | undefined;
    max: number | undefined;
    max_dt: Date | undefined;
}

export interface ObsMeteor_INT extends Obs_INT {

}
