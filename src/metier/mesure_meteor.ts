import 'reflect-metadata';
import { Service } from 'typedi';
import {Mesure} from '../repository/mesure';
import {MesureMeteor_INT, MesureData, Aggreg_Type} from './mesure_meteor_interface'

@Service({ transient: true })
export class MesureMeteor extends Mesure implements MesureMeteor_INT {
    constructor(data: MesureData) {
        super(data);
    }
}
