import 'reflect-metadata';
import { Service } from 'typedi';
import {Mesure} from '../repository/mesure.js';
import {MesureMeteor_INT, MesureData, MesureItem } from './mesure_meteor_interface.js'
import {Aggreg_Type} from '../tools/enums.js';
import {DBOptions} from '../tools/db_interface.js';

@Service({ transient: true })
export class MesureMeteor extends Mesure implements MesureMeteor_INT {
    constructor(data: MesureData) {
        super(data);
    }
    public static async getListe(): Promise<MesureItem[]> {
        var fixedMesures = [] as MesureItem[];
        const mesures = (await Mesure.liste(undefined, {'order': 'id'} as DBOptions)) as MesureData[];
        for (const aMesure of mesures) {
            var tmp_dir_idx = undefined as number|undefined;
            if (aMesure.field_dir != undefined) {
                for (var dir_idx = 0; dir_idx < mesures.length; dir_idx++) {
                    if (mesures[dir_idx].id == aMesure.field_dir) {
                        tmp_dir_idx = dir_idx;
                        break;
                    }
                }
            }
            fixedMesures.push({
                id: aMesure.id,
                name: aMesure.name,
                json_input: aMesure.json_input,
                json_input_bis: aMesure.json_input_bis,
                archive_col: aMesure.archive_col,
                archive_table: aMesure.archive_table,
                field_dir: aMesure.field_dir,
                max: aMesure.max,
                min: aMesure.min,
                agreg_type: aMesure.agreg_type,
                is_wind: aMesure.is_wind,
                allow_zero: aMesure.allow_zero,
                convert: aMesure.convert,
                j: aMesure.j,
                dir_idx: Number(tmp_dir_idx),
            });
        }
        return fixedMesures
    }
}
