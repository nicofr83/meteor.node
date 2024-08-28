import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB, DBOptions} from "../tools/db";
import pg from 'pg'
import {Entity} from "./entity";
import {Entity_Child_INT, X_MaxData} from './x_max_interface';

@Service({ transient: true })
export class X_Max extends Entity implements Entity_Child_INT{

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
        public static async getOne(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_Max> {
            var my_X_Max = new X_Max()
            const X_MaxData = (await my_X_Max.getOneDBData(pgconn, dbOptions)) as X_MaxData;
            my_X_Max = new X_Max(X_MaxData);
            return my_X_Max;
        }

        public static async getAll(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_Max[]> {
            const all_X_Maxs: X_Max[] = [];
            var my_X_Max = new X_Max()
            const allData = await my_X_Max.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_X_Max = new X_Max(a_data as X_MaxData)
                all_X_Maxs.push(my_X_Max);
            }
            return all_X_Maxs;
        }

        public static async liste(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<X_MaxData[]> {
            const all_X_Maxs: X_Max[] = [];
            const my_X_Max = new X_Max();
            var sqlRequest = my_X_Max.buildSelectRequest(dbOptions);

            const instance = Container.get(DB);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: pg.Client|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('X_Max not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: pg.Client|undefined): Promise<number|undefined>{
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
