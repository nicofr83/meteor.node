import 'reflect-metadata';
import { Container } from 'typedi';
import { ObsMeteor } from "./obs_meteor.js";
import { ObsData } from "./obs_meteor_interface.js";
import { DBOptions } from '../tools/db_interface.js';
import { DB_PG } from '../tools/db_pg.js';
import { Obs } from '../repository/obs.js';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const MyOBsMeteor = Container.get(ObsMeteor);

describe("ObsMeteor test", () => {
    beforeEach(() => {
        process.env.TZ = 'UTC';
    });
    it("Insert data, and check dates", async () => {
        const myObs = new ObsMeteor({
            poste_id: 36,
            date_local: new Date('2022-03-12T20:00:00Z'),
            date_utc: new Date('2022-03-13T02:00:00Z'),
            duration: 5,
            barometer: 1234,
        } as ObsData);
        const dbPg = Container.get(DB_PG); 
        const pgConn = await dbPg.connect();
        await dbPg.beginTransaction(pgConn);        
        await myObs.insertMe(pgConn);
        const myObs2 = await ObsMeteor.getOne(pgConn, {'where': 'id = ' + myObs.getData().id,} as DBOptions);
        await dbPg.rollbackTransaction(pgConn);
        await dbPg.disconnect(pgConn);
        
        expect( myObs.getData().date_local.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
        expect( myObs.getData().date_utc.toJSON()).toEqual('2022-03-13T02:00:00.000Z');
        expect( myObs2.getData().date_local.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
        expect( myObs2.getData().date_utc.toJSON()).toEqual('2022-03-13T02:00:00.000Z');
    }, 700 * SECONDS);
    // it("Check Dates", async () => {
    //     const myObs = await ObsMeteor.getOne(undefined, {'order': 'id', 'limit': 1} as DBOptions);
    //     expect( myObs.getData().date_local.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
    //     expect(allMesures[0].id).toEqual(1);
    // }, 700 * SECONDS);
});
