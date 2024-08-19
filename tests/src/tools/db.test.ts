import 'reflect-metadata';
import { Container} from 'typedi';
import {DB} from "../../../src/tools/db";

describe("DB Tests", () => {
    it("singleton", () => {
        const instanceA = Container.get(DB);
        const instanceB = Container.get(DB);        
        expect(instanceB.getInstanceCount()).toEqual(1);
    });
    it("connect", async () => {
        const instance = Container.get(DB);
        try {
            const client = await instance.connect();
            await instance.disconnect(client);
            expect(true)
        } catch (err) {
            expect(false)
        }       
    }); 
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
    }); 

});

