import { RunOnceSvc } from '../runOnceSvc.js';
import { Container } from 'typedi';
import { Log } from '../../tools/log.js';
import { DumpLoader } from "../../dataLoader/dump/dumpLoader.js";
import { DumpRecords, DumpArray } from '../../dataLoader/dataLoader_interface.js';
import { PosteMeteor } from "../../metier/poste_meteor.js";
import { MesureMeteor } from "../../metier/mesure_meteor.js";
import { MesureItem } from '../../metier/mesure_meteor_interface.js';
import { DBOptions } from '../../tools/db_interface.js';
import { DB_PG } from "../../tools/db_pg.js";
console.log('in migrate 2');

class Migrate extends RunOnceSvc {
    private myDump = Container.get(DumpLoader);
    private myPoste : PosteMeteor | undefined;
    private myMesure = Container.get(MesureMeteor);
    private mAll: MesureItem[] = [];
    private myLog = Container.get(Log);
    private pgInstance = Container.get(DB_PG);

    constructor() {
        console.log('in migrate constructor')
        super();
        this.myPoste = undefined;
        console.log('exiting migrate constructor 2')
    }

    public async runMe(data: any): Promise<object | undefined> {
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise<object | undefined>(async (f, reject) => {
            console.log('in migrate')
            const client = await this.pgInstance.connect();
            try {
                this.myLog.debug('Migrate.runMe', `data: ${JSON.stringify(data)}`);
                this.mAll = await this.myMesure.getListe();
                this.myPoste = await PosteMeteor.getOne(undefined, { 'where': `meteor = \'${data.meteor}\'` } as DBOptions);
                this.myDump.setStation(data.meteor, this.myPoste);
                var dateLimits = await this.myDump.getFirstSlot();
                var maxDate = Date.now() + 4 * 60 * 1000;

                while (dateLimits.min < maxDate) {
                    await this.pgInstance.beginTransaction(client);

                    var dumpData = await this.myDump.getFromDump(dateLimits);
                    this.addMesureValueToRecords(dumpData);

                    this.myDump.flushObs(client, dumpData.archive);
                    this.myDump.flushRecords(client, this.cleanUpRecords(dumpData));

                    await this.pgInstance.commitTransaction(client);
                    dateLimits = this.myDump.getNextSlot(dateLimits);
                }
                f(undefined);

            } catch (error: any) {
                console.log('error:', error)
                setTimeout(() => {
                    reject(error);
                }, 1000);
            }
            finally {
                await this.pgInstance.disconnect(client);

            }
        });
    }
  
    private addMesureValueToRecords(dumpData: DumpArray) {
        for (const anArchiveData of dumpData.archive) {
            for (const aMesure of this.mAll) {
                if (aMesure.min == true || aMesure.max == true) {
                    dumpData.records.push({
                        date_local: anArchiveData.date_local,
                        mid: aMesure.id as bigint,
                        min: aMesure.min == true ? anArchiveData[aMesure.json_input as string] : undefined,
                        mintime: aMesure.min == true ? new Date(anArchiveData.date_local.setHours(0,0,0,0)) : undefined,
                        max:  aMesure.max == true ? anArchiveData[aMesure.json_input as string] : undefined,
                        maxtime: aMesure.max == true ? new Date(anArchiveData.date_local.setHours(0,0,0,0)) : undefined,
                        max_dir: anArchiveData.max_diDumpRecords,
                    });
                }
            }
        }
    }
    private cleanUpRecords(dumpData: DumpArray): DumpRecords[] {
        const cleanRecords = [] as DumpRecords[];
        const tmpRecordsData = dumpData.records.sort((a, b) => {
            if (a.date_local != b.date_local) {
                return a.date_local.getTime() - b.date_local.getTime();
            }
            return (a.mid - b.mid) as unknown as number;
        });
        dumpData.records = tmpRecordsData;

        var aDate: number = -1;
        var aMid: bigint = BigInt(-1);
        var count: number = 0;

        for (const aRecord of dumpData.records) {
            if (aRecord.date_local.getTime() != aDate || aRecord.mid != aMid) {
                count = 0;
                aDate = aRecord.date_local.getTime();
                aMid = aRecord.mid;
            }
            if (count++ <= 2) {
                cleanRecords.push(aRecord);
            }
        }
        return cleanRecords;
    }
}
new Migrate();
