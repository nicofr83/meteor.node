"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
const poste_js_1 = require("./poste.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
describe("Poste test", () => {
    it("getColumnsName getOne no cxion", async () => {
        const myPoste = await poste_js_1.Poste.getOne(undefined, { 'where': 'id = 1' });
        expect(myPoste.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getOne with cxion", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        const myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': 'id = 1' });
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        // console.dir(res);
        expect(myPoste.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getAll", async () => {
        const allPostes = await poste_js_1.Poste.getAll(undefined, {});
        // console.dir(allPostes[0]);
        // Poste {
        //     data: {
        //       id: 1,
        //       meteor: 'BER605',
        //       delta_timezone: 4,
        //       data_source: 1,
        //       load_type: 1,
        //       api_key: 'mon api key 007',
        //       type: 'VP2',
        //       altitude: 605,
        //       lat: -21.30833,
        //       long: 55.53887,
        //       info: null,
        //       stop_date: null,
        //       last_obs_date_local: 1999-12-31T23:00:00.000Z,
        //       last_obs_id: '0',
        //       last_json_date_local: 2099-12-31T23:00:00.000Z,
        //       info_sync: null
        //     },
        //     tableName: 'postes',
        //     dirtyCols: [],
        //     isDirty: false
        //   }
        expect(allPostes.length).toBeGreaterThanOrEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName liste", async () => {
        const allPostes = await poste_js_1.Poste.liste(undefined, { 'order': 'id' });
        // console.dir(allPostes[0]);
        // {
        //     id: 1,
        //     meteor: 'BER605',
        //     delta_timezone: 4,
        //     data_source: 1,
        //     load_type: 1,
        //     api_key: 'mon api key 007',
        //     type: 'VP2',
        //     altitude: 605,
        //     lat: -21.30833,
        //     long: 55.53887,
        //     info: null,
        //     stop_date: null,
        //     last_obs_date_local: 1999-12-31T23:00:00.000Z,
        //     last_obs_id: '0',
        //     last_json_date_local: 2099-12-31T23:00:00.000Z,
        //     info_sync: null
        //   }
        expect(allPostes[0].id).toEqual(1);
    }, 700 * SECONDS);
    it("updateAll commit", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        var altitude = myPoste.getData().altitude;
        myPoste.setData({ 'altitude': 150 });
        await myPoste.updateAll(pgConn, { 'where': "meteor = 'BBF015'" });
        await db.commitTransaction(pgConn);
        myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        const new_altitude = myPoste.getData().altitude;
        myPoste.setData({ 'altitude': altitude });
        await myPoste.updateAll(pgConn, { 'where': "meteor = 'BBF015'" });
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        expect(new_altitude).toEqual(150);
    }, 700 * SECONDS);
    it("updateMe rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        var altitude = myPoste.getData().altitude;
        myPoste.setData({ 'altitude': 150 });
        await myPoste.updateMe(pgConn);
        myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        expect(myPoste.getData().altitude).toEqual(150);
        await db.rollbackTransaction(pgConn);
        myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        expect(myPoste.getData().altitude).toEqual(altitude);
    }, 700 * SECONDS);
    it("updateAll rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        var altitude = myPoste.getData().altitude;
        myPoste.setData({ 'altitude': 150 });
        await myPoste.updateAll(pgConn, { 'where': "meteor = 'BBF015'" });
        await db.rollbackTransaction(pgConn);
        myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        expect(myPoste.getData().altitude).toEqual(altitude);
    }, 700 * SECONDS);
    it("deleteAll rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myPoste = new poste_js_1.Poste();
        var deletedKeys = await myPoste.deleteAll(pgConn, { 'where': 'id in (1, 2)' });
        await db.rollbackTransaction(pgConn);
        expect(deletedKeys).toHaveLength(2);
    }, 700 * SECONDS);
    it("deleteMe rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        var deletedKeys = await myPoste.deleteMe(pgConn);
        await db.rollbackTransaction(pgConn);
        expect(deletedKeys.id).toEqual(36);
    }, 700 * SECONDS);
    it("insert rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myPoste = await poste_js_1.Poste.getOne(pgConn, { 'where': "meteor = 'BBF015'" });
        myPoste.setData({ 'meteor': 'BBF015-2', id: undefined });
        await myPoste.insertMe(pgConn);
        await db.rollbackTransaction(pgConn);
        await db.execute(pgConn, "SELECT setval(pg_get_serial_sequence('obs', 'id'), max(id)) FROM obs;");
        expect(myPoste.getData().id).toBeDefined();
    }, 700 * SECONDS);
});
//# sourceMappingURL=poste.test.js.map