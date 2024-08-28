import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB, DBOptions} from "../tools/db";
import pg from 'pg'
import {Entity} from "./entity";
import {Entity_Child_INT, X_MinData} from './x_min_interface';

@Service({ transient: true })
export class X_Min extends Entity implements Entity_Child_INT{

    constructor(myData:X_MinData = {} as X_MinData ) {
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
                    min: undefined,
                    min_time: undefined,
                    qa_min: undefined,
                } as X_MinData);
            }
            this.setTableName('x_min');
        }
        public static async getOne(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_Min> {
            var my_X_Min = new X_Min()
            const X_MinData = (await my_X_Min.getOneDBData(pgconn, dbOptions)) as X_MinData;
            my_X_Min = new X_Min(X_MinData);
            return my_X_Min;
        }

        public static async getAll(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_Min[]> {
            const all_X_Mins: X_Min[] = [];
            var my_X_Min = new X_Min()
            const allData = await my_X_Min.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_X_Min = new X_Min(a_data as X_MinData)
                all_X_Mins.push(my_X_Min);
            }
            return all_X_Mins;
        }

        public static async liste(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_MinData[]> {
            const all_X_Mins: X_Min[] = [];
            const my_X_Min = new X_Min();
            var sqlRequest = my_X_Min.buildSelectRequest(dbOptions);

            const instance = Container.get(DB);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: pg.Client|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('X_Min not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: pg.Client|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('X_Min not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
}
