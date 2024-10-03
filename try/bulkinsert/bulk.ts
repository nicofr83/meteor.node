import { Client } from 'pg';

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Funicula',
    database: 'climato'
});

const numRecords = 1000000;
// insert date local
// const data = Array.from({ length: numRecords }, (_, i) => [`data_${i}`, i, new Date()]);

// insert date UTC
const data = Array.from({ length: numRecords }, (_, i) => [`data_${i}`, i, new Date().toISOString()]);

async function measureInsert() {
    const chunkSize = 1000;
    const startTime = Date.now();

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const placeholders = chunk.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(',');
        const values = chunk.flat();

        const insertQuery = `
            INSERT INTO test_table (data, nombre, time_added) VALUES ${placeholders}
        `;

        await client.query(insertQuery, values);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Multi-line INSERT took: ${duration} seconds`);
}


async function main() {
    await client.connect();

    await measureInsert();

    await client.end();
}

main();
