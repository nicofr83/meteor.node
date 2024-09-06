import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB_PG } from "../tools/db_pg.js";
import { DBOptions, dbConn } from "../tools/db_interface.js";
import pg from 'pg'
import {Entity} from "./entity.js";
import {Mesure_INT, MesureData} from './mesure_interface.js';

@Service({ transient: true })
export class Mesure extends Entity implements Mesure_INT{

    constructor(myData:MesureData = {} as MesureData ) {
        if (JSON.stringify(myData) != '{}') {
            super(myData);
        } else {
            super(
                {
                    id: undefined,
                    name: undefined,
                    json_input: undefined,
                    json_input_bis: undefined,
                    archive_col: undefined,
                    archive_table: undefined,
                    field_dir: undefined,
                    max: undefined,
                    min: undefined,
                    agreg_type: undefined,
                    is_wind: undefined,
                    allow_zero: undefined,
                    convert: undefined,
                    j: undefined,
                } as MesureData);
            }
            this.setTableName('mesures');
        }
        public static async getOne(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Mesure> {
            var my_Mesure = new Mesure()
            const MesureData = (await my_Mesure.getOneDBData(pgconn, dbOptions)) as MesureData;
            my_Mesure = new Mesure(MesureData);
            return my_Mesure;
        }

        public static async getAll(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Mesure[]> {
            const all_Mesures: Mesure[] = [];
            var my_Mesure = new Mesure()
            const allData = await my_Mesure.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_Mesure = new Mesure(a_data as MesureData)
                all_Mesures.push(my_Mesure);
            }
            return all_Mesures;
        }

        public static async liste(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<MesureData[]> {
            const all_Mesures: Mesure[] = [];
            const my_Mesure = new Mesure();
            var sqlRequest = my_Mesure.buildSelectRequest(dbOptions);

            const instance = Container.get(DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Mesure not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Mesure not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
}
