import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { DB_PG } from "../tools/db_pg.js";
import { DBOptions, DBConn } from "../tools/db_interface.js";
import { Entity } from "./entity.js";
import { Obs_INT, ObsData } from './obs_interface.js';
import { MesureMeteor } from '../metier/mesure_meteor.js';
import { MesureItem } from '../metier/mesure_meteor_interface.js';
// import {Code_QA} from '../tools/enums';

@Service({ transient: true })
export class Obs extends Entity implements Obs_INT {
    private mAll: MesureItem[] = []

    constructor(myData: ObsData = {} as ObsData) {
        if (JSON.stringify(myData) != '{}') {
            super(myData);
        } else {
            super({
                id: undefined,
                date_local: undefined,
                date_utc: undefined,
                Obs: undefined,
                duration: undefined,
                barometer: undefined,
                pressure: undefined,
                in_temp: undefined,
                out_temp: undefined,
                dewpoint: undefined,
                etp: undefined,
                heatindex: undefined,
                extra_temp1: undefined,
                extra_temp2: undefined,
                extra_temp3: undefined,
                in_humidity: undefined,
                out_humidity: undefined,
                extra_humid1: undefined,
                extra_humid2: undefined,
                leaf_temp1: undefined,
                leaf_temp2: undefined,
                leaf_wet1: undefined,
                leaf_wet2: undefined,
                radiation: undefined,
                radiation_rate: undefined,
                uv: undefined,
                rain: undefined,
                rain_utc: undefined,
                rain_rate: undefined,
                rx: undefined,
                soil_moist1: undefined,
                soil_moist2: undefined,
                soil_moist3: undefined,
                soil_moist4: undefined,
                soil_temp1: undefined,
                soil_temp2: undefined,
                soil_temp3: undefined,
                soil_temp4: undefined,
                voltage: undefined,
                wind_dir: undefined,
                wind: undefined,
                wind_gust_dir: undefined,
                wind_gust: undefined,
                wind10: undefined,
                wind10_dir: undefined,
                windchill: undefined,

                hail: undefined,
                zone_1: undefined,
                zone_2: undefined,
                zone_3: undefined,
                zone_4: undefined,
                zone_5: undefined,
                zone_6: undefined,
                zone_7: undefined,
                zone_8: undefined,
                zone_9: undefined,
                zone_10: undefined,
                j: undefined,
                qa_all: undefined,
                qa_details: undefined,
                qa_modifications: undefined,
            })
        }
        this.setTableName('obs');
    }
    public static async getOne(pgconn: DBConn | undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Obs> {
        var my_Obs = new Obs()
        const ObsData = (await my_Obs.getOneDBData(pgconn, dbOptions)) as ObsData;
        my_Obs = new Obs(ObsData);
        return my_Obs;
    }

    public static async getAll(pgconn: DBConn | undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Obs[]> {
        const all_Obss: Obs[] = [];
        var my_Obs = new Obs()
        const allData = await my_Obs.getDBData(pgconn, dbOptions);
        for (const a_data of allData) {
            my_Obs = new Obs(a_data as ObsData)
            all_Obss.push(my_Obs);
        }
        return all_Obss;
    }

    public static async liste(pgconn: DBConn | undefined, dbOptions: DBOptions = {} as DBOptions): Promise<ObsData[]> {
        const all_Obss: Obs[] = [];
        const my_Obs = new Obs();
        var sqlRequest = my_Obs.buildSelectRequest(dbOptions);

        const instance = Container.get(DB_PG);
        const allData = await instance.query(pgconn, sqlRequest);
        return allData;
    }

    public async getInsertBulkSQL(): Promise<{sql: string, nbFields: number}> {
        if (this.mAll.length == 0) {
            this.mAll = await Container.get(MesureMeteor).getListe();
        }
        const sqlBulk = {sql: 'insert into ' + this.getTableName() + '(date_local, date_utc, poste_id, duration, ', nbFields: 4};
    
        for (var aMesure of this.mAll) {
            if (aMesure.archive_col == undefined) {
                continue;
            }
            sqlBulk.sql += aMesure.json_input + ', ';
            sqlBulk.nbFields ++;
        }
        sqlBulk.sql = sqlBulk.sql.substring(0, sqlBulk.sql.length - 2) as string;
        sqlBulk.sql += ') ';
        return sqlBulk;
    }
    public async updateMe(pgconn: DBConn | undefined): Promise<number | undefined> {
        if (this.getData().id == undefined) {
            throw new Error('Obs not loaded, then cannot updateMe');
        }
        const updatedIds = await this.updateAll(pgconn, { 'where': 'id = ' + this.getData().id } as DBOptions);
        if (updatedIds.length == 0) {
            return undefined;
        }
        return updatedIds[0];
    }

    public async deleteMe(pgconn: DBConn | undefined): Promise<number | undefined> {
        if (this.getData().id == undefined) {
            throw new Error('Obs not loaded, then cannot deleteMe');
        }
        const deletedIds = await this.deleteAll(pgconn, { 'where': 'id = ' + this.getData().id } as DBOptions);
        if (deletedIds.length == 0) {
            return undefined;
        }
        return deletedIds[0];
    }
}
