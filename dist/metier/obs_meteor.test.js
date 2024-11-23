"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const obs_meteor_js_1 = require("./obs_meteor.js");
const db_pg_js_1 = require("../tools/db_pg.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const MyOBsMeteor = typedi_1.Container.get(obs_meteor_js_1.ObsMeteor);
describe("ObsMeteor test", () => {
    beforeEach(() => {
        process.env.TZ = 'UTC';
    });
    it("Insert data, and check dates", async () => {
        const myObs = new obs_meteor_js_1.ObsMeteor({
            poste_id: 36,
            date_local: new Date('2022-03-12T20:00:00Z'),
            date_utc: new Date('2022-03-13T02:00:00Z'),
            duration: 5,
            barometer: 1234,
        });
        const dbPg = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await dbPg.connect();
        await dbPg.beginTransaction(pgConn);
        await myObs.insertMe(pgConn);
        const myObs2 = await obs_meteor_js_1.ObsMeteor.getOne(pgConn, { 'where': 'id = ' + myObs.getData().id, });
        await dbPg.rollbackTransaction(pgConn);
        await dbPg.disconnect(pgConn);
        expect(myObs.getData().date_local.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
        expect(myObs.getData().date_utc.toJSON()).toEqual('2022-03-13T02:00:00.000Z');
        expect(myObs2.getData().date_local.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
        expect(myObs2.getData().date_utc.toJSON()).toEqual('2022-03-13T02:00:00.000Z');
    }, 700 * SECONDS);
    // it("Check Dates", async () => {
    //     const myObs = await ObsMeteor.getOne(undefined, {'order': 'id', 'limit': 1} as DBOptions);
    //     expect( myObs.getData().date_local.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
    //     expect(allMesures[0].id).toEqual(1);
    // }, 700 * SECONDS);
});
//# sourceMappingURL=obs_meteor.test.js.map