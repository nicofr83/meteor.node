import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB, DBOptions} from "../tools/db";
import pg from 'pg'
import {Entity} from "./entity";
import {Entity_Child_INT, MesureData} from './mesure_interface';

@Service({ transient: true })
export class Mesure extends Entity implements Entity_Child_INT{

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
        public static async getOne(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Mesure> {
            var my_Mesure = new Mesure()
            const MesureData = (await my_Mesure.getOneDBData(pgconn, dbOptions)) as MesureData;
            my_Mesure = new Mesure(MesureData);
            return my_Mesure;
        }

        public static async getAll(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Mesure[]> {
            const all_Mesures: Mesure[] = [];
            var my_Mesure = new Mesure()
            const allData = await my_Mesure.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_Mesure = new Mesure(a_data as MesureData)
                all_Mesures.push(my_Mesure);
            }
            return all_Mesures;
        }

        public static async liste(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<MesureData[]> {
            const all_Mesures: Mesure[] = [];
            const my_Mesure = new Mesure();
            var sqlRequest = my_Mesure.buildSelectRequest(dbOptions);

            const instance = Container.get(DB);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: pg.Client|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Mesure not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: pg.Client|undefined): Promise<number|undefined>{
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
