// import { RunOnceSvc } from '../runOnceSvc.js';
// import { Container } from 'typedi';
// import { Log } from '../../tools/log.js';
// import { DumpLoader } from "../../dataLoader/dump/dumpLoader.js";
// import { PosteMeteor } from "../../metier/poste_meteor.js";
// import { MesureMeteor } from "../../metier/mesure_meteor.js";
// import { DBOptions } from '../../tools/db_interface.js';
// import { MesureItem } from '../../metier/mesure_meteor_interface.js';
// import { DumpArchive, DumpRecords, DumpRecordsIdx, DumpArchiveIdx, DumpArray } from '../../dataLoader/dataLoader_interface.js';
// import { DB_PG } from "../../tools/db_pg.js";
// import { DBConn } from '../../tools/db_interface.js';

// class Migrate extends RunOnceSvc {
//     private myDump = Container.get(DumpLoader);
//     private myPoste = Container.get(PosteMeteor);
//     private myMesure = Container.get(MesureMeteor);
//     private mAll: MesureItem[] = [];
//     private myLog = Container.get(Log);
//     private pgInstance = Container.get(DB_PG);

//     constructor() {
//         super();
//     }

//     public async runMe(data: any): Promise<object | undefined> {
//         // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
//         return new Promise<object | undefined>(async (f, reject) => {
//             const client = await this.pgInstance.connect();
//             try {
//                 this.myLog.debug('Migrate.runMe', `data: ${JSON.stringify(data)}`);
//                 this.mAll = await this.myMesure.getListe();
//                 this.myPoste = await PosteMeteor.getOne(undefined, { 'where': `meteor = \'${data.meteor}\'` } as DBOptions);
//                 this.myDump.setStation(data.meteor, this.myPoste);
//                 var dateLimits = await this.myDump.getFirstSlot();
//                 var maxDate = Date.now() + 4 * 60 * 1000;

//                 while (dateLimits.min < maxDate) {
//                     await this.pgInstance.beginTransaction(client);
//                     var dumpData = await this.myDump.getFromDump(dateLimits);
//                     this.addMesureValueToRecords(dumpData);
//                     const cleanRecords = this.cleanUpRecords(dumpData);

//                     await this.loadArchiveData(client, dumpData.archive);
//                     await this.loadRecordsData(client, cleanRecords);


//                     dateLimits = this.myDump.getNextSlot(dateLimits);

//                     await this.pgInstance.commitTransaction(client);
//                 }
//                 f(undefined);

//             } catch (error: any) {
//                 reject(error);
//             }
//             finally {
//                 await this.pgInstance.disconnect(client);

//             }
//         });
//     }
//     private async loadArchiveData(client: DBConn, archiveData: DumpArchive[]) {
//         if (archiveData.length == 0) {
//             return;
//         }
        
//     }

//     private async loadRecordsData(client: DBConn, records: DumpRecords[]) {
//         if (records.length == 0) {
//             return;
//         }
//     }

//     private addMesureValueToRecords(dumpData: DumpArray) {
//         for (const anArchiveData of dumpData.archive) {
//             for (const aMesure of this.mAll) {
//                 if (aMesure.min == true || aMesure.max == true) {
//                     dumpData.records.push(
//                         [
//                             anArchiveData[DumpArchiveIdx.date_local].toISOString().slice(0, 10),
//                             aMesure.id,
//                             aMesure.min == true ? anArchiveData[aMesure.json_input as string] : undefined,
//                             aMesure.min == true ? anArchiveData.date_local.setHours(0,0,0,0) : undefined,
//                             aMesure.max == true ? anArchiveData[aMesure.json_input as string] : undefined,
//                             aMesure.max == true ? anArchiveData.date_local.setHours(0,0,0,0) : undefined,
//                             anArchiveData.max_dir,
//                         ] as DumpRecords);
//                 }
//             }
//         }
//     }
//     private cleanUpRecords(dumpData: DumpArray): DumpRecords[] {
//         const cleanRecords = [] as DumpRecords[];
//         const tmpRecordsData = dumpData.records.sort((a, b) => {
//             if (a[DumpRecordsIdx.DATE_LOCAL] != b[DumpRecordsIdx.DATE_LOCAL]) {
//                 return Number(a[DumpRecordsIdx.DATE_LOCAL] < b[DumpRecordsIdx.DATE_LOCAL]);
//             }
//             return (a[DumpRecordsIdx.MID] - b[DumpRecordsIdx.MID]) as unknown as number;
//         });
//         dumpData.records = tmpRecordsData;

//         var aDate: string = "1900-01-01";
//         var aMid: bigint = BigInt(-1);
//         var count: number = 0;

//         for (const aRecord of dumpData.records) {
//             if (aRecord[DumpRecordsIdx.DATE_LOCAL] != aDate || aRecord[DumpRecordsIdx.MID] != aMid) {
//                 count = 0;
//                 aDate = aRecord[DumpRecordsIdx.DATE_LOCAL];
//                 aMid = aRecord[DumpRecordsIdx.MID];
//             }
//             if (count++ <= 2) {
//                 cleanRecords.push(aRecord);
//             }
//         }
//         return cleanRecords;
//     }
// }
