import 'reflect-metadata';
import { Container} from 'typedi';
import {DB} from "../../../src/tools/db";

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("DB Tests", () => {
    it("singleton", () => {
        const instanceA = Container.get(DB);
        const instanceB = Container.get(DB);        
        expect(instanceB.getInstanceCount()).toEqual(1);
    }, 70 * SECONDS);
    it("connect", async () => {
        const instance = Container.get(DB);
        try {
            const client = await instance.connect();
            await instance.disconnect(client);
            expect(true)
        } catch (err) {
            expect(false)
        }       
    }, 70 * SECONDS); 
    it("simple select", async () => {
        const instance = Container.get(DB);
        try {
            const client = await instance.connect();
            await instance.beginTransaction(client);
            const res = await instance.execute(client, 'SELECT version()');
            await instance.rollbackTransaction(client);
            await instance.disconnect(client);
            expect((res.version as string).startsWith("PostgreSQL ")).toEqual(true);
        } catch (err) {
            console.error(err);
            expect(false)
        }       
    }, 70 * SECONDS);
    it("select one poste", async () => {
        const instance = Container.get(DB);
        try {
            const client = await instance.connect();
            await instance.beginTransaction(client);
            const res = await instance.execute(client, 'SELECT * from Postes order by id limit 1');
            await instance.rollbackTransaction(client);
            await instance.disconnect(client);
            console.dir(res);
            expect(res.id).toEqual(1);
        } catch (err) {
            console.error(err);
            expect(false)
        }       
    }, 70 * SECONDS);

});
