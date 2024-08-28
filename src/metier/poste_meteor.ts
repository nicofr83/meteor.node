import 'reflect-metadata';
import { Service } from 'typedi';
import {Poste} from '../repository/poste';
import {PosteMeteor_INT, PosteData, Data_Source, Load_Type} from './poste_meteor_interface'

@Service({ transient: true })
export class PosteMeteor extends Poste implements PosteMeteor_INT {
    constructor(data: PosteData) {
        super(data);
    }
}
