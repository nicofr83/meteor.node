import 'reflect-metadata';
import { Service, Container, Inject } from 'typedi';
import {DB, DBOptions} from "../tools/db";
import {DB_INT} from "../tools/db_interface";
import pg from 'pg'
import {Entity} from "./entity";
import {Poste_INT, PosteData} from './poste_interface';

@Service({ transient: true })
export class Poste extends Entity<PosteData> implements Poste_INT<PosteData>{

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

        public static async getOne(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Poste> {
            var my_poste = new Poste()
            const posteData = await my_poste.getOneDBData(pgconn, dbOptions);
            my_poste = new Poste(posteData);
            return my_poste;
        }

        public static async getAll(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Poste[]> {
            const all_postes: Poste[] = [];
            var my_poste = new Poste()
            const allData = await my_poste.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_poste = new Poste(a_data as PosteData)
                all_postes.push(my_poste);
            }
            return all_postes;
        }

        public static async liste(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<PosteData[]> {
            const all_postes: Poste[] = [];
            const my_poste = new Poste();
            var sqlRequest = my_poste.buildSelectRequest(dbOptions);

            const instance = Container.get(DB);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }
}
