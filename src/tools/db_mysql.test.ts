import 'reflect-metadata';
import { Container } from 'typedi';
import { DB_MYSQL } from "./db_mysql.js";
require('iconv-lite').encodingExists('foo')

// const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const SECONDS = 1000;

describe("DB_MYSQL Tests", () => {
    // it("singleton", () => {
    //     const instanceA = Container.get(DB_MYSQL);
    //     const instanceB = Container.get(DB_MYSQL);        
    //     expect(instanceB.getInstanceCount()).toEqual(1);
    // }, 70 * SECONDS);
    // it("connect", async () => {
    //     const instance = Container.get(DB_MYSQL);
    //     try {
    //         const client = await instance.connect();
    //         await instance.disconnect(client);
    //         expect(true)
    //     } catch (err) {
    //         expect(false)
    //     }       
    // }, 70 * SECONDS); 
    it("simple select", async () => {
        const instance = Container.get(DB_MYSQL);
        try {
            const client = await instance.connect('BBF015');
            await instance.beginTransaction(client);
            const res = await instance.query(client, 'SELECT min(datetime) as min, from_unixtime(datetime) as dt from archive');
            await instance.rollbackTransaction(client);
            await instance.disconnect(client);
            expect(res.length).toEqual(1);
            expect(res[0]['min']).toEqual(1435176420);
            expect(res[0]['dt']).toEqual('2015-06-24 22:07:00');
        } catch (err) {
            console.error(err);
            expect(false)
        }       
    }, 70 * SECONDS);
});
