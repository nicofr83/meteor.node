import 'reflect-metadata';
import { Service } from 'typedi';
import {X_Min} from '../repository/x_min.js';
import {X_MinMeteor_INT, X_MinData} from './x_min_meteor_interface.js'

@Service({ transient: true })
export class X_MinMeteor extends X_Min implements X_MinMeteor_INT {
    constructor(data: X_MinData) {
        super(data);
    }
}
