"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runOnceSvc_js_1 = require("../runOnceSvc.js");
const typedi_1 = require("typedi");
const dumpLoader_js_1 = require("../../dataLoader/dump/dumpLoader.js");
const poste_meteor_js_1 = require("../../metier/poste_meteor.js");
const mesure_meteor_js_1 = require("../../metier/mesure_meteor.js");
const db_pg_js_1 = require("../../tools/db_pg.js");
class Migrate extends runOnceSvc_js_1.RunOnceSvc {
    myDump = typedi_1.Container.get(dumpLoader_js_1.DumpLoader);
    myPoste;
    myMesure = typedi_1.Container.get(mesure_meteor_js_1.MesureMeteor);
    mAll = [];
    pgInstance = typedi_1.Container.get(db_pg_js_1.DB_PG);
    constructor() {
        super();
        this.myPoste = undefined;
    }
    async runMe(data) {
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise(async (f, reject) => {
            const client = await this.pgInstance.connect();
            try {
                this.myLog.debug('Migrate.runMe', `data: ${JSON.stringify(data)}`);
                this.mAll = await this.myMesure.getListe();
                this.myPoste = await poste_meteor_js_1.PosteMeteor.getOne(undefined, { 'where': `meteor = \'${data.meteor}\'` });
                this.myDump.setStation(data.meteor, this.myPoste);
                var dateLimits = await this.myDump.getFirstSlot();
                var maxDate = Date.now() + 4 * 60 * 1000;
                while ((dateLimits.min - dateLimits.arch_max) <= 0) {
                    await this.pgInstance.beginTransaction(client);
                    var commitStartTime = Date.now();
                    var dumpData = await this.myDump.getFromDump(dateLimits);
                    var duration = (Date.now() - commitStartTime) / 1000;
                    this.myLog.debug('migrate', `getFromDump took: ${duration} seconds`);
                    await this.myDump.flushObs(client, dumpData.archive);
                    this.myDump.addMesureValueToRecords(dumpData);
                    await this.myDump.flushRecords(client, dumpData.records);
                    commitStartTime = Date.now();
                    await this.pgInstance.commitTransaction(client);
                    duration = (Date.now() - commitStartTime) / 1000;
                    this.myLog.debug('migrate', `Commit took: ${duration} seconds`);
                    dateLimits = this.myDump.getNextSlot(dateLimits);
                }
                f(undefined);
            }
            catch (error) {
                this.myLog.exception('migrate', error);
                setTimeout(() => {
                    reject(error);
                }, 1000);
            }
            finally {
                await this.pgInstance.disconnect(client);
            }
        });
    }
}
new Migrate();
//# sourceMappingURL=migrate.js.map