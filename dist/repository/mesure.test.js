"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
const mesure_js_1 = require("./mesure.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
describe("Mesure test", () => {
    it("getColumnsName getOne no cxion", async () => {
        const myMesure = await mesure_js_1.Mesure.getOne(undefined, { 'where': 'id = 1' });
        expect(myMesure.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getOne with cxion", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        const myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        // console.dir(res);
        expect(myMesure.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getAll", async () => {
        const allMesures = await mesure_js_1.Mesure.getAll(undefined, {});
        expect(allMesures.length).toBeGreaterThanOrEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName liste", async () => {
        const allMesures = await mesure_js_1.Mesure.liste(undefined, { 'order': 'id' });
        expect(allMesures[0].id).toEqual(1);
    }, 700 * SECONDS);
    it("updateAll commit", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        var allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({ 'allow_zero': !allow_zero });
        await myMesure.updateAll(pgConn, { 'where': 'id = 1' });
        await db.commitTransaction(pgConn);
        myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        const new_allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({ 'allow_zero': allow_zero });
        await myMesure.updateAll(pgConn, { 'where': 'id = 1' });
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        expect(new_allow_zero).toEqual(!allow_zero);
    }, 700 * SECONDS);
    it("updateMe rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        var allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({ 'allow_zero': !allow_zero });
        await myMesure.updateMe(pgConn);
        myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        expect(myMesure.getData().allow_zero).toEqual(!allow_zero);
        await db.rollbackTransaction(pgConn);
        myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        expect(myMesure.getData().allow_zero).toEqual(allow_zero);
    }, 700 * SECONDS);
    it("updateAll rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        var allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({ 'allow_zero': !allow_zero });
        await myMesure.updateAll(pgConn, { 'where': 'id = 1' });
        await db.rollbackTransaction(pgConn);
        myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        expect(myMesure.getData().allow_zero).toEqual(allow_zero);
    }, 700 * SECONDS);
    it("deleteAll rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myMesure = new mesure_js_1.Mesure();
        var deletedKeys = await myMesure.deleteAll(pgConn, { 'where': 'id in (1, 2)' });
        await db.rollbackTransaction(pgConn);
        expect(deletedKeys).toHaveLength(2);
    }, 700 * SECONDS);
    it("deleteMe rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        var deletedKeys = await myMesure.deleteMe(pgConn);
        await db.rollbackTransaction(pgConn);
        expect(deletedKeys.id).toEqual(1);
    }, 700 * SECONDS);
    it("insert rollback", async () => {
        const db = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await db.beginTransaction();
        var myMesure = await mesure_js_1.Mesure.getOne(pgConn, { 'where': 'id = 1' });
        myMesure.setData({ 'name': 'test Mesure', id: undefined });
        await myMesure.insertMe(pgConn);
        await db.rollbackTransaction(pgConn);
        await db.execute(pgConn, "SELECT setval(pg_get_serial_sequence('mesures', 'id'), max(id)) FROM mesures;");
        expect(myMesure.getData().id).toBeDefined();
    }, 700 * SECONDS);
});
//# sourceMappingURL=mesure.test.js.map