import { RunOnceSvc } from '../runOnceSvc.js';
import { Container } from 'typedi';
import { Log } from '../../tools/log.js';
import { DumpLoader } from "../../dataLoader/dump/dumpLoader.js";
import { DumpRecords, DumpRecordsIdx, DumpArchiveIdx, DumpArray } from '../../dataLoader/dataLoader_interface.js';
import { PosteMeteor } from "../../metier/poste_meteor.js";
import { MesureMeteor } from "../../metier/mesure_meteor.js";
import { MesureItem } from '../../metier/mesure_meteor_interface.js';
import { DBOptions } from '../../tools/db_interface.js';
import { DB_PG } from "../../tools/db_pg.js";

class Migrate extends RunOnceSvc {
    private myDump = Container.get(DumpLoader);
    private myPoste : PosteMeteor | undefined;
    private myMesure = Container.get(MesureMeteor);
    private mAll: MesureItem[] = [];
    private pgInstance = Container.get(DB_PG);

    constructor() {
        super();
        this.myPoste = undefined;
    }

    public async runMe(data: any): Promise<object | undefined> {
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise<object | undefined>(async (f, reject) => {
            const client = await this.pgInstance.connect();
            try {
                this.myLog.debug('Migrate.runMe', `data: ${JSON.stringify(data)}`);
                this.mAll = await this.myMesure.getListe();
                this.myPoste = await PosteMeteor.getOne(undefined, { 'where': `meteor = \'${data.meteor}\'` } as DBOptions);
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

            } catch (error: any) {
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
