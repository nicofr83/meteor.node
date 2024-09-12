import 'reflect-metadata';
import { Container } from 'typedi';
import { DB_PG } from "./db_pg.js";

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("DB_PG Tests", () => {
    it("singleton", () => {
        const instanceA = Container.get(DB_PG);
        const instanceB = Container.get(DB_PG);        
        expect(instanceB.getInstanceCount()).toEqual(1);
    }, 70 * SECONDS);
    it("connect", async () => {
        const instance = Container.get(DB_PG);
        try {
            const client = await instance.connect();
            await instance.disconnect(client);
            expect(true)
        } catch (err) {
            expect(false)
        }       
    }, 70 * SECONDS); 
    it("simple select", async () => {
        const dbPG = Container.get(DB_PG);
        try {
            const client = await dbPG.connect();
            await dbPG.beginTransaction(client);
            const res = await dbPG.execute(client, 'SELECT version()');
            await dbPG.rollbackTransaction(client);
            await dbPG.disconnect(client);
            expect((res.version as string).startsWith("PostgreSQL ")).toEqual(true);
        } catch (err) {
            console.error(err);
            expect(false)
        }       
    }, 70 * SECONDS);
    it("select one poste", async () => {
        const instance = Container.get(DB_PG);
        try {
            const client = await instance.connect();
            await instance.beginTransaction(client);
            const res = await instance.execute(client, 'SELECT * from Postes order by id limit 1');
            await instance.commitTransaction(client);
            await instance.disconnect(client);
            // console.dir(res);
            expect(res.id).toEqual(1);
        } catch (err) {
            console.error(err);
            expect(false)
        }       
    }, 70 * SECONDS);

});
