import 'reflect-metadata';
import { Container } from 'typedi';
import { ObsMeteor } from "./obs_meteor.js";
import { DBOptions } from '../tools/db_interface.js';
import exp from 'constants';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("Obs test", () => {
    // it("getColumnsName getOne no cxion", async () => {
    //     const myMesure = await MesureMeteor.getOne(undefined, {'where': 'id = 1'} as DBOptions);
    //     expect(myMesure.getData().id).toEqual(1);
    // }, 700 * SECONDS);
    it("archiveDateLimits", async () => {
        const dateLimits = await ObsMeteor.archiveDateLimits();
        //   min        | min_dt              | max        | max_dt              |
        // +------------+---------------------+------------+---------------------+
        // | 1435176420 | 2015-06-24 22:07:00 | 1647115200 | 2022-03-12 21:00:00 |
        expect(dateLimits.min).toEqual(1435176420);
        expect(dateLimits.min_dt).toEqual(new Date('2015-06-24 22:07:00'));
        expect(dateLimits.max).toEqual(1647115200);
        expect(dateLimits.max_dt).toEqual(new Date('2022-03-12 21:00:00'));
    }, 700 * SECONDS);
});
