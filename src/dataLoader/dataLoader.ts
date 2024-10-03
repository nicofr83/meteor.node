import { DumpArchive, DumpRecords, DumpArray, DataLoader_INT } from './dataLoader_interface.js';

export abstract class DataLoader implements DataLoader_INT {
    constructor() {

    }

    public async flushObs(client: any, data: DumpArchive[]): Promise<void> {
        const chunkSize = 1000;
        const startTime = Date.now();

        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const placeholders = chunk.map((_: any, idx: number) => `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3})`).join(',');
            const values = chunk.flat();

            const insertQuery = `
                INSERT INTO test_table (data, nombre, time_added) VALUES ${placeholders}
            `;

            await client.query(insertQuery, values);
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Multi-line INSERT took: ${duration} seconds`);
    }

    public async flushRecords(client: any, data: DumpRecords[]): Promise<void> {
    }
}
