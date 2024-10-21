import { DumpArchive, DumpRecords, DumpArray, DumpArchiveIdx, DumpRecordsIdx, DataLoader_INT } from './dataLoader_interface.js';
import { MesureItem} from '../metier/mesure_meteor_interface.js';
import { Log } from '../tools/log.js';
import {Container} from 'typedi';

export abstract class DataLoader implements DataLoader_INT {
    protected mAll: MesureItem[] = [];
    protected myLog = Container.get(Log);

    private sortArray(recordsArray: DumpRecords[], orderAsc: boolean): DumpRecords[] {
        return recordsArray.sort((a, b) => {
            if (a[0] == b[0]) {
                var testMid = a[1] > b[1] ? 1: (a[1] < b[1]) ? -1 : 0;
                if (testMid == 0){
                    testMid = a[5] > b[5] ? 1: (a[5] < b[5]) ? -1 : 0;
                } else {
                    testMid = a[5] < b[5] ? 1: (a[5] > b[5]) ? -1 : 0;
                }
                return testMid;    
            }
            const testDate = a[0] > b[0] ? 1: -1;
            return testDate;
        });
    }
    private cleanUpRecords(dumpRecords: DumpRecords[], orderAsc: boolean = true): DumpRecords[] {
        const cleanRecords = [] as DumpRecords[];
        // ****************************************************************
        // Constants of DumpRecordsIdx are not used for performance reasons
        // ****************************************************************
        const tmpRecordsData = this.sortArray(dumpRecords, orderAsc);

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
        return cleanRecords;
    }
    public async flushObs(client: any, dumpData: DumpArchive[]): Promise<void> {
        const chunkSize = 1000;
        const startTime = Date.now();
        var sqlPreInsert = 'INSERT INTO obs (date_local, date_utc, poste_id, duration, '
        var nbColumns = 0;

        for (const aCol of this.mAll) {
            if (aCol.archive_col != undefined) {
                sqlPreInsert += aCol.json_input + ', ';
                nbColumns++;
            }
        }
        sqlPreInsert = sqlPreInsert.slice(0, -2) + ') VALUES ';

        for (let i = 0; i < dumpData.length; i += chunkSize) {
            const chunkValue = [] as any[];
            // we remove the obs_is column for our insert
            const chunk = dumpData.slice(i, i + chunkSize).map(v => v.filter((_, i) => i < 40));
            for (const anArchiveRow of chunk) {
                var aRow = [] as any[];
                aRow.push(anArchiveRow[DumpArchiveIdx.date_local]);
                aRow.push(anArchiveRow[DumpArchiveIdx.date_utc]);
                aRow.push(anArchiveRow[DumpArchiveIdx.poste_id]);
                aRow.push(anArchiveRow[DumpArchiveIdx.interval]);
                for (const aCol of this.mAll) {
                    if (aCol.archive_col != undefined) {
                        var mesure_key = aCol.json_input as keyof typeof DumpArchiveIdx;
                        const mesureValue = anArchiveRow[DumpArchiveIdx[mesure_key]];
                        // do not push zero values if not allowed by the mesure
                        if (aCol.allow_zero == false && mesureValue == 0) {
                            aRow.push(undefined);
                        } else {
                            aRow.push(mesureValue);
                        }
                    }
                }
                chunkValue.push(aRow);
            }

            var placeholders = chunk.map((_: any, idx: number) => {
                const baseIdx = idx * (nbColumns + 4) + 1;
                const cols = Array.from({ length: nbColumns + 4 }, (_, colIdx) => `$${baseIdx + colIdx}`).join(', ');
                return `(${cols})`;
            }).join(',');
            const values = chunkValue.flat();

            const insertQuery = sqlPreInsert + `${placeholders}` + ' returning id';
            try {
                const retIns = await client.query(insertQuery, values);
                // Load obs_id in our array
                for (let j = 0; j < retIns.rows.length; j++) {
                    dumpData[i + j][DumpArchiveIdx.obs_id] = Number(retIns.rows[j].id);
                }
                // console.log('chunk:', i);
            } catch(error: any) {
                throw error;
            }
        }

        const duration = (Date.now() - startTime) / 1000;
        this.myLog.debug('migrate', `Flush Obs took: ${duration} seconds`);
    }

    public async flushRecords(client: any, data: DumpRecords[]): Promise<void> {
        const chunkSize = 1000;
        const startTime = Date.now();

        // ------------
        // Load x_min
        // ------------
        var sqlInsert = 'insert into x_min(date_local, mesure_id, poste_id, obs_id, qa_min, min, min_time) values ';
        var nbColumns = 7;
        var values = [] as any[];
        var minRecords = data.filter((aRow: any) => (aRow[DumpRecordsIdx.MIN] != undefined && aRow[DumpRecordsIdx.MIN] != null));
        var valMinRecords= this.cleanUpRecords(minRecords.map(v => v.filter((_, i) => i < 7)), false);
        minRecords = [];

        for (let i = 0; i < valMinRecords.length; i += chunkSize) {
            var chunk = valMinRecords.slice(i, i + chunkSize);
            valMinRecords = [];
 
            var placeholders = chunk.map((_: any, idx: number) => {
                const baseIdx = idx * (nbColumns) + 1;
                const cols = Array.from({ length: nbColumns }, (_, colIdx) => `$${baseIdx + colIdx}`).join(', ');
                return `(${cols})`;
            }).join(',');

            values = chunk.flat();
            chunk = [];

            const insertQuery = sqlInsert + `${placeholders}`;
            try {
                await client.query(insertQuery, values);
                values = [];
            } catch(error: any) {
                throw error;
            }
        }

        // ------------
        // Load x_max
        // ------------
        var maxRecords = data.filter((aRow: any) => (aRow[DumpRecordsIdx.MAX] != undefined && aRow[DumpRecordsIdx.MAX] != null));

        const removeIndexes = [5, 6]
        var valMaxRecords = this.cleanUpRecords(maxRecords.map(v => v.filter((_, i) => !removeIndexes.includes(i))), true);

        maxRecords = [];
    
        var sqlInsert = 'insert into x_max(date_local, mesure_id, poste_id, obs_id, qa_max, max, max_time, max_dir) values ';
        nbColumns = 8;

        for (var i = 0; i < valMaxRecords.length; i += chunkSize) {
            const chunk = valMaxRecords.slice(i, i + chunkSize);
    
            // const placeholders = chunk.map((_, index) => `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`).join(',');
            var placeholders = chunk.map((_: any, idx: number) => {
                const baseIdx = idx * (nbColumns) + 1;
                const cols = Array.from({ length: nbColumns }, (_, colIdx) => `$${baseIdx + colIdx}`).join(', ');
                return `(${cols})`;
            }).join(',');

            const values = chunk.flat();

            const insertQuery = sqlInsert + `${placeholders}`;
            try {
                const retIns = await client.query(insertQuery, values);
                // console.dir(retIns);
            } catch(error: any) {
                throw error;
            }
        }
        const duration = (Date.now() - startTime) / 1000;
        this.myLog.debug('flushRecords', `Flush Records took: ${duration} seconds`);
    }
}
