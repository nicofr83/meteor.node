import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB_PG } from "../tools/db_pg.js";
import { DBOptions, dbConn } from "../tools/db_interface.js";
import {Entity} from "./entity.js";
import {X_Max_INT, X_MaxData} from './x_max_interface.js';

@Service({ transient: true })
export class X_Max extends Entity implements X_Max_INT {

    constructor(myData:X_MaxData = {} as X_MaxData ) {
        if (JSON.stringify(myData) != '{}') {
            super(myData);
        } else {
            super(
                {
                    id: undefined,
                    obs_id: undefined,
                    date_local: undefined,
                    poste: undefined,
                    mesure: undefined,
                    max: undefined,
                    max_time: undefined,
                    max_dir: undefined,
                    qa_max: undefined,
                } as X_MaxData);
            }
            this.setTableName('x_max');
        }
        public static async getOne(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_Max> {
            var my_X_Max = new X_Max()
            const X_MaxData = (await my_X_Max.getOneDBData(pgconn, dbOptions)) as X_MaxData;
            my_X_Max = new X_Max(X_MaxData);
            return my_X_Max;
        }

        public static async getAll(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_Max[]> {
            const all_X_Maxs: X_Max[] = [];
            var my_X_Max = new X_Max()
            const allData = await my_X_Max.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_X_Max = new X_Max(a_data as X_MaxData)
                all_X_Maxs.push(my_X_Max);
            }
            return all_X_Maxs;
        }

        public static async liste(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_MaxData[]> {
            const all_X_Maxs: X_Max[] = [];
            const my_X_Max = new X_Max();
            var sqlRequest = my_X_Max.buildSelectRequest(dbOptions);

            const instance = Container.get(DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('X_Max not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('X_Max not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
}
