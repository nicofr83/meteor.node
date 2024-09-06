import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB_PG } from "../tools/db_pg.js";
import { dbConn, DBOptions } from '../tools/db_interface.js';
import {Entity} from "./entity.js";
import {Poste_INT, PosteData} from './poste_interface.js';

@Service({ transient: true })
export class Poste extends Entity implements Poste_INT {

    constructor(myData:PosteData = {} as PosteData ) {
        if (JSON.stringify(myData) != '{}') {
            super(myData);
        } else {
            super(
                {
                    id: undefined,
                    meteor: undefined,
                    delta_timezone: undefined,
                    data_source: undefined,
                    load_type: undefined,
                    api_key: undefined,
                    type: undefined,
                    altitude: undefined,
                    lat: undefined,
                    long: undefined,
                    info: undefined,
                    stop_date: undefined,
                    last_obs_date_local: undefined,
                    last_obs_id: undefined,
                    last_json_date_local: undefined,
                    info_sync: undefined
                } as PosteData);
            }
            this.setTableName('postes');
        }
        public static async getOne(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Poste> {
            var my_poste = new Poste()
            const posteData = (await my_poste.getOneDBData(pgconn, dbOptions)) as PosteData;
            my_poste = new Poste(posteData);
            return my_poste;
        }

        public static async getAll(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Poste[]> {
            const all_postes: Poste[] = [];
            var my_poste = new Poste()
            const allData = await my_poste.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_poste = new Poste(a_data as PosteData)
                all_postes.push(my_poste);
            }
            return all_postes;
        }

        public static async liste(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<PosteData[]> {
            const all_postes: Poste[] = [];
            const my_poste = new Poste();
            var sqlRequest = my_poste.buildSelectRequest(dbOptions);

            const instance = Container.get(DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Poste not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Poste not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
}
