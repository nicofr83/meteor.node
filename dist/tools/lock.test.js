"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const lock_1 = require("./lock");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
describe("Lock Tests", () => {
    it("Aquire/Release", async () => {
        const myLock = typedi_1.Container.get(lock_1.Lock);
        myLock.setGoal('test');
        await myLock.acquire('test lock');
        expect(myLock.isLocked()).toBe(true);
        myLock.release();
        expect(myLock.isLocked()).toBe(false);
    }, 70 * SECONDS);
    it("Aquire/Release on 2 locks", async () => {
        const myLock1 = typedi_1.Container.get(lock_1.Lock);
        myLock1.setGoal('test');
        const myLock2 = typedi_1.Container.get(lock_1.Lock);
        myLock2.setGoal('test2');
        await myLock1.acquire('test lock1');
        await myLock2.acquire('test lock2');
        myLock1.release();
        myLock2.release();
        expect(myLock1.isLocked()).toBe(false);
        expect(myLock2.isLocked()).toBe(false);
        expect(true);
    }, 70 * SECONDS);
    it("Aquire a non released lock", async () => {
        const myLock = typedi_1.Container.get(lock_1.Lock);
        myLock.setGoal('test');
        await myLock.acquire('main lock', 100);
        setTimeout(() => {
            myLock.release();
        }, 50);
        expect(await myLock.acquire('test blocked', 200)).toBe(true);
        myLock.release();
        await myLock.acquire('test lock');
        expect(myLock.isLocked()).toBe(true);
        myLock.release();
        setTimeout(() => {
            expect(myLock.isLocked()).toBe(false);
        }, 200);
    }, 70 * SECONDS);
    it("Fail to aquire a non released lock", async () => {
        const myLock = typedi_1.Container.get(lock_1.Lock);
        myLock.setGoal('test');
        await myLock.acquire('main lock', 100);
        expect(await myLock.acquire('test blocked', 100)).toBe(false);
        expect(myLock.isLocked()).toBe(true);
        myLock.release();
        await myLock.acquire('test lock');
        expect(myLock.isLocked()).toBe(true);
        myLock.release();
        setTimeout(() => {
            expect(myLock.isLocked()).toBe(false);
        }, 200);
    }, 70 * SECONDS);
});
//# sourceMappingURL=lock.test.js.map