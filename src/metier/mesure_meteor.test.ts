import 'reflect-metadata';
import { Container } from 'typedi';
import { MesureMeteor } from "./mesure_meteor.js";
import { DBOptions } from '../tools/db_interface.js';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("MesureMeteor test", () => {
    it("getColumnsName getOne no cxion", async () => {
        const myMesure = await MesureMeteor.getOne(undefined, {'where': 'id = 1'} as DBOptions);
        expect(myMesure.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getListes", async () => {
        const allMesures = await MesureMeteor.getListe();
        expect(allMesures[0].id).toEqual(1);
    }, 700 * SECONDS);
});
