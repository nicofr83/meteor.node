import 'reflect-metadata';
import {Container} from 'typedi';
import {DB, DBOptions } from "../../../src/tools/db";
import {Poste} from "../../../src/repository/poste";
import {PosteData} from '../../../src/repository/poste_interface';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("Poste test", () => {
    it("getColumnsName getOne no cxion", async () => {
        const myPoste = await Poste.getOne(undefined, {'where': 'id = 1'} as DBOptions);
        expect(myPoste.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getOne with cxion", async () => {
        const db = Container.get(DB);
        const pgConn = await db.beginTransaction();
        const myPoste = await Poste.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        await db.commitTransaction(pgConn);
        await db.disconnect(pgConn);
        // console.dir(res);
        expect(myPoste.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getColumnsName getAll", async () => {
        const allPostes = await Poste.getAll(undefined, {} as DBOptions);
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
        const allPostes = await Poste.liste(undefined, {'order': 'id'} as DBOptions);
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
    it("update commit", async () => {
        const db = Container.get(DB);
        const pgConn = await db.beginTransaction();
        var myPoste = await Poste.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        var altitude = myPoste.getData().altitude;
        myPoste.setData({'altitude': 150} as PosteData);
        await myPoste.update(pgConn);
        await db.commitTransaction(pgConn);

        myPoste = await Poste.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        const new_altitude = myPoste.getData().altitude;
        myPoste.setData({'altitude': altitude} as PosteData);
        await myPoste.update(pgConn);
        await db.commitTransaction(pgConn);

        await db.disconnect(pgConn);
        expect(new_altitude).toEqual(150);
    }, 700 * SECONDS);
    it("update rollback", async () => {
        const db = Container.get(DB);
        const pgConn = await db.beginTransaction();
        var myPoste = await Poste.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        var altitude = myPoste.getData().altitude;
        myPoste.setData({'altitude': 150} as PosteData);
        await myPoste.update(pgConn);
        await db.rollbackTransaction(pgConn);

        myPoste = await Poste.getOne(pgConn, {'where': 'id = 1'} as DBOptions);
        expect(myPoste.getData().altitude).toEqual(altitude);
    }, 700 * SECONDS);
    it("delete rollback", async () => {
        const db = Container.get(DB);
        const pgConn = await db.beginTransaction();
        var myPoste = new Poste();
        var deletedKeys = await myPoste.delete(pgConn, {'where': 'id in (1, 2)'} as DBOptions);
        await db.rollbackTransaction(pgConn);
        expect(deletedKeys).toHaveLength(2);
    }, 700 * SECONDS);
});
