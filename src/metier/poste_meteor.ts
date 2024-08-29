import 'reflect-metadata';
import { Service } from 'typedi';
import { Poste } from '../repository/poste';
import { PosteMeteor_INT, PosteData } from './poste_meteor_interface'
import { DBOptions } from '../tools/db';
import { Load_Type } from '../tools/enums';

@Service({ transient: true })
export class PosteMeteor extends Poste implements PosteMeteor_INT {
    constructor(data: PosteData) {
        super(data);
    }
    public static async getDumpedPostes(): Promise<string> {
        var listePostes = '' as string;
        const JsonListe = await Poste.liste(
            undefined,
            {'columns': 'meteor',
             'where': '(load_type & ' + Load_Type.LOAD_FROM_DUMP + ') > 0',
             'order': 'meteor'} as DBOptions
        );
        for (const a_posteJ of JsonListe) {
            listePostes += '\n' + (a_posteJ as any)['meteor'];
        }
        return listePostes.substring(1);
    }   
}
