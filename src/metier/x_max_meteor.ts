import 'reflect-metadata';
import { Service } from 'typedi';
import {X_Max} from '../repository/x_max';
import {X_MaxMeteor_INT, X_MaxData} from './x_max_meteor_interface'

@Service({ transient: true })
export class X_MaxMeteor extends X_Max implements X_MaxMeteor_INT {
    constructor(data: X_MaxData) {
        super(data);
    }
}
