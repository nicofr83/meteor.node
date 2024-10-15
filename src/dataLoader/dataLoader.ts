import { DumpArchive, DumpRecords, DumpArchiveIdx, DumpArray, DataLoader_INT } from './dataLoader_interface.js';
import { MesureItem} from '../metier/mesure_meteor_interface.js';

export abstract class DataLoader implements DataLoader_INT {
    protected mAll: MesureItem[] = [];

    constructor() {

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
            const chunk = dumpData.slice(i, i + chunkSize);
            for (const anArchiveRow of chunk) {
                var aRow = [] as any[];
                aRow.push(anArchiveRow[DumpArchiveIdx.date_local]);
                aRow.push(anArchiveRow[DumpArchiveIdx.date_utc]);
                aRow.push(anArchiveRow[DumpArchiveIdx.poste_id]);
                aRow.push(anArchiveRow[DumpArchiveIdx.interval]);
                for (const aCol of this.mAll) {
                    if (aCol.archive_col != undefined) {
                        var mesure_key = aCol.json_input as keyof typeof anArchiveRow;
                        aRow.push(anArchiveRow[mesure_key]);
                    }
                }
                chunkValue.push(aRow);
            }
            // const placeholders = chunk.map((_: any, idx: number) => `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3})`).join(',');

            var placeholders = chunk.map((_: any, idx: number) => {
                const baseIdx = idx * (nbColumns + 4) + 1;
                const cols = Array.from({ length: nbColumns + 4 }, (_, colIdx) => `$${baseIdx + colIdx}`).join(', ');
                return `(${cols})`;
            }).join(',');
            const values = chunkValue.flat();

            const insertQuery = sqlPreInsert + `${placeholders}`;
            try {
                const retIns = await client.query(insertQuery, values);
                console.dir(retIns);
            } catch(error: any) {
                throw error;
            }
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Multi-line INSERT took: ${duration} seconds`);
    }

    public async flushRecords(client: any, data: DumpRecords[]): Promise<void> {
    }
}
