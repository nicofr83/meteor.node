import 'reflect-metadata';
import { Service } from 'typedi';
import {Mesure} from '../repository/mesure.js';
import {MesureMeteor_INT, MesureData} from './mesure_meteor_interface.js'
import {Aggreg_Type} from '../tools/enums.js';

@Service({ transient: true })
export class MesureMeteor extends Mesure implements MesureMeteor_INT {
    constructor(data: MesureData) {
        super(data);
    }
}
