// info(source: string, message: string, params?: object): void;
// error(source: string, error: Error, params?: object): void;
// exception(source: string, error: Error, params?: object): void;
import 'reflect-metadata';
import { Container} from 'typedi';
import {Log} from "./log.js";
import {describe, expect, test} from '@jest/globals';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("Log Tests", () => {
    it("Info", () => {
        const myLog = Container.get(Log) as Log;
        const myLogData = myLog.info("source", "me", {a: 1}, true) as any;
        expect(myLogData.source).toEqual("source");
        expect(myLogData.message).toEqual("me");
        expect(myLogData.params.a).toEqual(1);
    }, 70 * SECONDS);
    it("Error", () => {
        const myLog = Container.get(Log) as Log;
        const myLogData = myLog.error("source", new Error('err 1'), {a: 1}, true) as any;
        expect(myLogData.source).toEqual("source");
        expect(myLogData.params.a).toEqual(1);
        expect(myLogData.message.indexOf("log.test.ts")).toBeGreaterThan(0);
    }, 70 * SECONDS);
    it("Exception", () => {
        const myLog = Container.get(Log) as Log;
        const myLogData = myLog.exception("source", new Error('err 1'), {a: 1}, true) as any;
        expect(myLogData.source).toEqual("source");
        expect(myLogData.params.a).toEqual(1);
        expect(myLogData.message.indexOf("log.test.ts")).toBeGreaterThan(0);
    }, 70 * SECONDS);

});
