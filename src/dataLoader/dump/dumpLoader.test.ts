import 'reflect-metadata';
import { Container } from 'typedi';
import { DumpLoader } from "./dumpLoader.js";
import { MesureMeteor } from '../../metier/mesure_meteor.js';
import { DB_MYSQL } from '../../tools/db_mysql.js';
import { PosteMeteor } from "../../metier/poste_meteor.js";
import { DBOptions } from '../../tools/db_interface.js';

// const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const SECONDS = 1000;
const myMesure = Container.get(MesureMeteor);

describe("Dump test", () => {
    var myDump: DumpLoader;
    var db_mysql: DB_MYSQL;

    beforeEach(() => {
        process.env.TZ = 'UTC';
        myDump = Container.get(DumpLoader);
        db_mysql = Container.get(DB_MYSQL);
    });

    it("should throw an error if Station name is undefined", async () => {
        await expect(myDump.archiveDateLimits()).rejects.toThrow('Station name is undefined');
        expect(true);
    }, 700 * SECONDS);

    it("archiveDateLimits", async () => {
        const myPoste = await PosteMeteor.getOne(undefined, { 'where': `meteor = \'BBF015\'` } as DBOptions);
        myDump.setStation('BBF015', myPoste);

        const dateLimits = await myDump.archiveDateLimits();
        // +------------+---------------------+------------+---------------------+
        // | min        | min_dt              | max        | max_dt              |
        // +------------+---------------------+------------+---------------------+
        // | 1435176420 | 2015-06-24 20:07:00 | 1647115200 | 2022-03-12 20:00:00 |
        // +------------+---------------------+------------+---------------------+
        expect(dateLimits.min).toEqual(1435176419);
        expect(dateLimits.min_dt.getTime()/1000).toEqual(1435176419);
        expect(new Date((dateLimits.min as number) * 1000).toJSON()).toEqual('2015-06-24T20:06:59.000Z');
        expect(dateLimits.min_dt.toJSON()).toEqual('2015-06-24T20:06:59.000Z');
        expect(dateLimits.min).toEqual(dateLimits.arch_min);

        expect(dateLimits.max).toEqual(1647115200);
        expect(dateLimits.max_dt.getTime()/1000).toEqual(1647115200);
        expect(dateLimits.max_dt.toJSON()).toEqual('2022-03-12T20:00:00.000Z');
        expect(dateLimits.max).toEqual(dateLimits.arch_max);

        expect(new Date(dateLimits.max as number * 1000).toJSON()).toEqual('2022-03-12T20:00:00.000Z');
    }, 700 * SECONDS);

    it("loadArchiveSQL", async () => {
        const myPoste = await PosteMeteor.getOne(undefined, { 'where': `meteor = \'BBF015'` } as DBOptions);
        myDump.setStation('BBF015', myPoste);
        const dateLimits = await myDump.archiveDateLimits();
        const mAll = await myMesure.getListe();
        const sql = myDump.loadArchiveSQL(mAll, dateLimits);
        expect(sql).toEqual("select from_unixtime(datetime + 3600 * 4) as date_local, from_unixtime(datetime) as date_utc, 36 as poste_id, `interval` as duration, barometer as barometer, pressure as pressure, inTemp as in_temp, outTemp as out_temp, dewpoint as dewpoint, ET as etp, heatindex as heatindex, extraTemp1 as extra_temp1, extraTemp2 as extra_temp2, extraTemp3 as extra_temp3, hail as hail, inHumidity as in_humidity, outHumidity as out_humidity, extraHumid1 as extra_humid1, extraHumid2 as extra_humid2, leafTemp1 as leaf_temp1, leafTemp2 as leaf_temp2, leafWet1 as leaf_wet1, leafWet2 as leaf_wet2, radiation as radiation, radiation as radiation_rate, UV as uv, rain as rain, rainRate as rain_rate, rxCheckPercent as rx, soilMoist1 as soil_moist1, soilMoist2 as soil_moist2, soilMoist3 as soil_moist3, soilMoist4 as soil_moist4, soilTemp1 as soil_temp1, soilTemp2 as soil_temp2, soilTemp3 as soil_temp3, soilTemp4 as soil_temp4, consBatteryVoltage as voltage, windDir as wind_dir, windSpeed as wind, windGustDir as wind_gust_dir, windGust as wind_gust, windchill as windchill, null from archive where datetime > 1435176419 and datetime <= 1647115200 order by datetime");
    }, 700 * SECONDS);
    it("loadRecordSQL", async () => {
        const myPoste = await PosteMeteor.getOne(undefined, { 'where': `meteor = \'BBF015'` } as DBOptions);
        myDump.setStation('BBF015', myPoste);
        const dateLimits = await myDump.archiveDateLimits();
        const mAll = await myMesure.getListe();
        const sql = myDump.loadRecordSQL(mAll[0], dateLimits);
        expect(sql).toEqual( "select DATE_FORMAT(from_unixtime(datetime + 3600 * 4), '%Y-%m-%d') as date_local, 1 as mid, 36 as pid, null as value, 0, min, from_unixtime(mintime + 3600 * 4), null, null, null as max_dir from archive_day_barometer where dateTime > 1435176419 and dateTime <= 1647115200 order by date_local");
    }, 700 * SECONDS);
    
    
    // it ("getNextSlot", async() => {
    //     await myDump.setStationName('BBF015');
    //     const dateLimits = await myDump.archiveDateLimits();
    //     while(dateLimits.min < dateLimits.max) {
  
    //             // calling process should do:
    //     // var dateLimits = await this.archiveDateLimits();
    //     // if (dateLimits.min_dt < curPoste.getData().last_obs_date_local) {
    //     //     dateLimits.min_dt = curPoste.getData().last_obs_date_local;
    //     //     dateLimits.min = Math.floor(new Date('2012.08.10').getTime() / 1000);
    //     // }
    //     // save max/max_dt
    //     // dateLimits = this.getNextSlot(dateLimits, true);

    // }, 700 * SECONDS);
});
