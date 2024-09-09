import {Mesure_INT, MesureData as MData} from '../repository/mesure_interface.js'
import {Aggreg_Type} from '../tools/enums.js';

export type MesureData = MData;

export interface MesureItem extends MesureData {
    dir_idx: number|undefined;
}

export interface MesureMeteor_INT extends Mesure_INT {

}
