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
    public static async getDumpedPostes(): Promise<string[]> {
        const listePostes = [] as string[];
        const JsonListe = await Poste.getAll(
            undefined,
            {'columns': 'meteor', 'where': 'load_type & ' + Load_Type.LOAD_FROM_DUMP + ' > 0'} as DBOptions
        );
        console.dir(JsonListe);

        return listePostes;
    }   
}
