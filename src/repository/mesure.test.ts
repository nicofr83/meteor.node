import 'reflect-metadata';
import { Container } from 'typedi';
import { DB_PG } from "../tools/db_pg.js";
import { dbConn, DBOptions } from "../tools/db_interface.js"
import { Mesure} from "./mesure.js";
import { MesureData } from './mesure_interface';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("Mesure test", () => {
    it("getColumnsName getOne no cxion", async () => {
        const myMesure = await Mesure.getOne(undefined, {'where': 'id = 1'} as DBOptions);
        expect(myMesure.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getOne with cxion", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction() as dbConn;
        const myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        // console.dir(res);
        expect(myMesure.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getAll", async () => {
        const allMesures = await Mesure.getAll(undefined, {} as DBOptions);
        expect(allMesures.length).toBeGreaterThanOrEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName liste", async () => {
        const allMesures = await Mesure.liste(undefined, {'order': 'id'} as DBOptions);
        expect(allMesures[0].id).toEqual(1);
    }, 700 * SECONDS);
    it("updateAll commit", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction();
        var myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        var allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({'allow_zero': !allow_zero} as MesureData);
        await myMesure.updateAll(pgConn, {'where': 'id = 1'} as DBOptions);
        await db.commitTransaction(pgConn);

        myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        const new_allow_zero = myMesure.getData().allow_zero;

        myMesure.setData({'allow_zero': allow_zero} as MesureData);
        await myMesure.updateAll(pgConn, {'where': 'id = 1'} as DBOptions);
        await db.commitTransaction(pgConn);

        await db.disconnect(pgConn);
        expect(new_allow_zero).toEqual(!allow_zero);
    }, 700 * SECONDS);
    it("updateMe rollback", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction();
        var myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        var allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({'allow_zero': !allow_zero} as MesureData);
        await myMesure.updateMe(pgConn);
        myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        expect(myMesure.getData().allow_zero).toEqual(!allow_zero);
        await db.rollbackTransaction(pgConn);
        myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        expect(myMesure.getData().allow_zero).toEqual(allow_zero);
    }, 700 * SECONDS);

    it("updateAll rollback", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction();
        var myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        var allow_zero = myMesure.getData().allow_zero;
        myMesure.setData({'allow_zero': !allow_zero} as MesureData);
        await myMesure.updateAll(pgConn, {'where': 'id = 1'} as DBOptions);
        await db.rollbackTransaction(pgConn);

        myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        expect(myMesure.getData().allow_zero).toEqual(allow_zero);
    }, 700 * SECONDS);
    it("deleteAll rollback", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction();
        var myMesure = new Mesure();
        var deletedKeys = await myMesure.deleteAll(pgConn, {'where': 'id in (1, 2)'} as DBOptions);
        await db.rollbackTransaction(pgConn);
        expect(deletedKeys).toHaveLength(2);
    }, 700 * SECONDS);

    it("deleteMe rollback", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction();
        var myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        var deletedKeys = await myMesure.deleteMe(pgConn);
        await db.rollbackTransaction(pgConn);
        expect((deletedKeys as any).id).toEqual(1);
    }, 700 * SECONDS);
   it("insert rollback", async () => {
        const db = Container.get(DB_PG) as DB_PG;
        const pgConn = await db.beginTransaction();
        var myMesure = await Mesure.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        myMesure.setData({'name': 'test Mesure', id: undefined} as MesureData);
        await myMesure.insertMe(pgConn);
        await db.rollbackTransaction(pgConn);
        await db.execute(pgConn,"SELECT setval(pg_get_serial_sequence('mesures', 'id'), max(id)) FROM mesures;");
        expect(myMesure.getData().id).toBeDefined();
    }, 700 * SECONDS);

});
