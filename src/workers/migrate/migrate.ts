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

                while ((dateLimits.min - dateLimits.arch_max) <= 0) {
                    await this.pgInstance.beginTransaction(client);

                    var dumpData = await this.myDump.getFromDump(dateLimits);
                    this.addMesureValueToRecords(dumpData);

                    await this.myDump.flushObs(client, dumpData.archive);
                    await this.myDump.flushRecords(client, this.cleanUpRecords(dumpData));

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
        const date_local_key: keyof typeof dumpData.archive = DumpArchiveIdx.date_local;
        
        for (const anArchiveData of dumpData.archive) {
            for (const aMesure of this.mAll) {
                if (aMesure.id == BigInt(13)) {
                    console.log('dewpoint');
                }
                if (aMesure.min == true || aMesure.max == true) {
                    var json_input_key: keyof typeof DumpArchiveIdx = aMesure.json_input as any;
                    const obs_date = new Date(anArchiveData[date_local_key].setHours(0,0,0,0));
                    const obs_value = anArchiveData[DumpArchiveIdx[json_input_key]];
                    if (obs_value != undefined) {
                        dumpData.records.push([
                            anArchiveData[date_local_key].toISOString().slice(0, 10),
                            Number(aMesure.id),
                            this.myPoste?.getData().id,
                            undefined,
                            0,
                            aMesure.min == true ? obs_value : undefined,
                            aMesure.min == true ? obs_date : undefined,
                            aMesure.max == true ? obs_value : undefined,
                            aMesure.max == true ? obs_date : undefined,
                            undefined,
                            // (113, 'gust dir',        'wind_gust_dir',   'windGustDir',      'skip',       null,     false,   false,    0,      false,    true,  'wind_max_dir',        '{}'),
                            // (114, 'gust',            'wind_gust',       'windGust',         'wind',       113,      false,   true,     3,       true,    true,      'wind_max',
                        ]);
                    }
                }
            }
        }
    }
    private cleanUpRecords(dumpData: DumpArray): DumpRecords[] {
        const cleanRecords = [] as DumpRecords[];
        // ****************************************************************
        // Constants of DumpRecordsIdx are not used for performance reasons
        // ****************************************************************
        const tmpRecordsData = dumpData.records.sort((a, b) => {
            if (a[0] == b[0]) {
                const delta_mid = (a[1] - b[1]) as unknown as number;
                return delta_mid;
            }
            return a[0] > b[0] as any;
        });
        var aDate: string = "1950/01/01";
        var aMid: bigint = BigInt(-1);
        var count: number = 0;

        for (const aRecord of tmpRecordsData) {
            if (aRecord[0] != aDate || aRecord[1] != aMid) {
                count = 0;
                aDate = aRecord[0];
                aMid = aRecord[1];
            }
            if (count++ <= 2) {
                cleanRecords.push(aRecord);
            }
        }
        return cleanRecords.sort((a, b) => {
            if (a[0] == b[0]) {
                const delta_mid = Number(a[1] - b[1]);
                return delta_mid;
            }
            return a[0] > b[0] as any;
        });
    }
}
new Migrate();
