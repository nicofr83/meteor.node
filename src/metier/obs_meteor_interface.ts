import { syncBuiltinESMExports } from 'node:module';
import {Obs_INT, ObsData as OData} from '../repository/obs_interface.js'

export interface ObsData extends OData{};

export interface ObsMeteor_INT extends Obs_INT {

}
