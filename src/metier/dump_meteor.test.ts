import 'reflect-metadata';
import { Container } from 'typedi';
import { DumpMeteor } from "./dump_meteor.js";
import { DBOptions } from '../tools/db_interface.js';
import { MesureMeteor } from './mesure_meteor.js';

process.env.TZ = 'UTC';

// const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const SECONDS = 1000;
const myMesure = Container.get(MesureMeteor);

describe("Dump test", () => {
    // it("getColumnsName getOne no cxion", async () => {
    //     const myMesure = await MesureMeteor.getOne(undefined, {'where': 'id = 1'} as DBOptions);
    //     expect(myMesure.getData().id).toEqual(1);
    // }, 700 * SECONDS);
    it("archiveDateLimits", async () => {
        const myDump = Container.get(DumpMeteor);
        myDump.setDbName('BBF015');
        const dateLimits = await myDump.archiveDateLimits();
        // +------------+---------------------+------------+---------------------+
        // | min        | min_dt              | max        | max_dt              |
        // +------------+---------------------+------------+---------------------+
        // | 1435176420 | 2015-06-24 20:07:00 | 1647115200 | 2022-03-12 20:00:00 |
        // +------------+---------------------+------------+---------------------+
        expect(dateLimits.min).toEqual(1435176420);
        expect(dateLimits.min_dt.getTime()/1000).toEqual(1435176420);
        expect(new Date((dateLimits.min as number) * 1000).toJSON()).toEqual('2015-06-24T20:07:00.000Z');
        expect(dateLimits.min_dt.toJSON()).toEqual('2015-06-24T20:07:00.000Z');

        expect(dateLimits.max).toEqual(1647115200);
        expect(dateLimits.max_dt.getTime()/1000).toEqual(1647115200);
        expect(dateLimits.max_dt.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
        expect(new Date(dateLimits.max as number * 1000).toJSON()).toEqual('2022-03-12T20:00:00.000Z');
    }, 700 * SECONDS);
    it("loadArchiveSQL", async () => {
        const myDump = Container.get(DumpMeteor);
        myDump.setDbName('BBF015');
        const dateLimits = await myDump.archiveDateLimits();
        const mAll = await myMesure.getListe();
        const sql = myDump.loadArchiveSQL(mAll, dateLimits);
        expect(sql).toEqual('select datetime, from_unixtime(datetime) as date_utc, usUnits, `interval`, barometer, pressure, inTemp, outTemp, dewpoint, ET, heatindex, extraTemp1, extraTemp2, extraTemp3, hail, inHumidity, outHumidity, extraHumid1, extraHumid2, leafTemp1, leafTemp2, leafWet1, leafWet2, radiation, radiation, UV, rain, null, rainRate, rxCheckPercent, soilMoist1, soilMoist2, soilMoist3, soilMoist4, soilTemp1, soilTemp2, soilTemp3, soilTemp4, consBatteryVoltage, windDir, windSpeed, windGustDir, windGust, windchill from archive where datetime >= 1435176420 and datetime < 1647115200 order by datetime');
    }, 700 * SECONDS);
});
