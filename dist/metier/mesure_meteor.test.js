"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const mesure_meteor_js_1 = require("./mesure_meteor.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const myMesureMeteor = typedi_1.Container.get(mesure_meteor_js_1.MesureMeteor);
describe("MesureMeteor test", () => {
    it("getColumnsName getOne no cxion", async () => {
        const myMesure = await mesure_meteor_js_1.MesureMeteor.getOne(undefined, { 'where': 'id = 1' });
        expect(myMesure.getData().id).toEqual(1);
    }, 700 * SECONDS);
    it("getListes", async () => {
        const allMesures = await myMesureMeteor.getListe();
        expect(allMesures[0].id).toEqual(1);
    }, 700 * SECONDS);
});
//# sourceMappingURL=mesure_meteor.test.js.map