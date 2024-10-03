import 'reflect-metadata';
import { Container } from 'typedi';
import { DB_PG } from "../tools/db_pg.js";
import { DBConn, DBOptions } from "../tools/db_interface.js"
import { Obs} from "./obs.js";
import { ObsData } from './obs_interface';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
var min_id = 1;

describe("Obs test", () => {
    it("getOne no cxion", async () => {
        const obsObject = Container.get(Obs) as Obs;
        const db = Container.get(DB_PG);
        const obs_count = await obsObject.count(undefined);
        if (obs_count.count == 0) {
            await db.execute(undefined, "SELECT setval(pg_get_serial_sequence('obs', 'id'), null);");
            const tmpObs = new Obs({date_local: new Date(), date_utc: new Date(), duration: 0, poste_id: 1, barometer: 1020.123} as ObsData);
            await tmpObs.insertMe(undefined);
        } else {
            min_id = (await db.execute(undefined, "SELECT min(id) FROM obs;")).min;
        }
        const myObs = await Obs.getOne(undefined, {'where': 'id = ' + min_id} as DBOptions);
        expect(myObs.getData().id).toEqual(min_id);
    }, 700 * SECONDS);
    it("getOne with cxion and transaction", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction() as DBConn;
        const myObs = await Obs.getOne(pgConn, {'where': 'id = ' + min_id} as DBOptions);
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        // console.dir(res);
        expect(myObs.getData().id).toEqual(min_id);
    }, 700 * SECONDS);
    it("getAll", async () => {
        const allObs = await Obs.getAll(undefined, {'limit': 10} as DBOptions);
        expect(allObs.length).toBeLessThanOrEqual(10);
    }, 700 * SECONDS);
    it("getInsertBulkSQL", async () => {
        const anObs = new Obs();
        const sql_bulk = await anObs.getInsertBulkSQL();
        expect(sql_bulk.nbFields).toBe(43);
        expect(sql_bulk.sql).toBe('insert into obs(date_local, date_utc, poste_id, duration, barometer, pressure, in_temp, out_temp, dewpoint, etp, heatindex, extra_temp1, extra_temp2, extra_temp3, hail, in_humidity, out_humidity, extra_humid1, extra_humid2, leaf_temp1, leaf_temp2, leaf_wet1, leaf_wet2, radiation, radiation_rate, uv, rain, rain_rate, rx, soil_moist1, soil_moist2, soil_moist3, soil_moist4, soil_temp1, soil_temp2, soil_temp3, soil_temp4, voltage, wind_dir, wind, wind_gust_dir, wind_gust, windchill) ');
    }, 700 * SECONDS);

//     it("updateAll commit", async () => {
//         const db = Container.get(DB_PG) as DB_PG;
//         const pgConn = await db.beginTransaction();
//         var myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         var allow_zero = myObs.getData().allow_zero;
//         myObs.setData({'allow_zero': !allow_zero} as MesureData);
//         await myObs.updateAll(pgConn, {'where': 'id = 1'} as DBOptions);
//         await db.commitTransaction(pgConn);

//         myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         const new_allow_zero = myObs.getData().allow_zero;

//         myObs.setData({'allow_zero': allow_zero} as MesureData);
//         await myObs.updateAll(pgConn, {'where': 'id = 1'} as DBOptions);
//         await db.commitTransaction(pgConn);

//         await db.disconnect(pgConn);
//         expect(new_allow_zero).toEqual(!allow_zero);
//     }, 700 * SECONDS);
//     it("updateMe rollback", async () => {
//         const db = Container.get(DB_PG) as DB_PG;
//         const pgConn = await db.beginTransaction();
//         var myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         var allow_zero = myObs.getData().allow_zero;
//         myObs.setData({'allow_zero': !allow_zero} as MesureData);
//         await myObs.updateMe(pgConn);
//         myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         expect(myObs.getData().allow_zero).toEqual(!allow_zero);
//         await db.rollbackTransaction(pgConn);
//         myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         expect(myObs.getData().allow_zero).toEqual(allow_zero);
//     }, 700 * SECONDS);

//     it("updateAll rollback", async () => {
//         const db = Container.get(DB_PG) as DB_PG;
//         const pgConn = await db.beginTransaction();
//         var myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         var allow_zero = myObs.getData().allow_zero;
//         myObs.setData({'allow_zero': !allow_zero} as MesureData);
//         await myObs.updateAll(pgConn, {'where': 'id = 1'} as DBOptions);
//         await db.rollbackTransaction(pgConn);

//         myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         expect(myObs.getData().allow_zero).toEqual(allow_zero);
//     }, 700 * SECONDS);
//     it("deleteAll rollback", async () => {
//         const db = Container.get(DB_PG) as DB_PG;
//         const pgConn = await db.beginTransaction();
//         var myObs = new Mesure();
//         var deletedKeys = await myObs.deleteAll(pgConn, {'where': 'id in (1, 2)'} as DBOptions);
//         await db.rollbackTransaction(pgConn);
//         expect(deletedKeys).toHaveLength(2);
//     }, 700 * SECONDS);

//     it("deleteMe rollback", async () => {
//         const db = Container.get(DB_PG) as DB_PG;
//         const pgConn = await db.beginTransaction();
//         var myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         var deletedKeys = await myObs.deleteMe(pgConn);
//         await db.rollbackTransaction(pgConn);
//         expect((deletedKeys as any).id).toEqual(1);
//     }, 700 * SECONDS);
//    it("insert rollback", async () => {
//         const db = Container.get(DB_PG) as DB_PG;
//         const pgConn = await db.beginTransaction();
//         var myObs = await Obs.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
//         myObs.setData({'name': 'test Mesure', id: undefined} as MesureData);
//         await myObs.insertMe(pgConn);
//         await db.rollbackTransaction(pgConn);
//         await db.execute(pgConn,"SELECT setval(pg_get_serial_sequence('mesures', 'id'), max(id)) FROM mesures;");
//         expect(myObs.getData().id).toBeDefined();
//     }, 700 * SECONDS);

});
