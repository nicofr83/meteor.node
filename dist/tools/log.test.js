"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// info(source: string, message: string, params?: object): void;
// error(source: string, error: Error, params?: object): void;
// exception(source: string, error: Error, params?: object): void;
require("reflect-metadata");
const typedi_1 = require("typedi");
const log_js_1 = require("./log.js");
const globals_1 = require("@jest/globals");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
(0, globals_1.describe)("Log Tests", () => {
    it("Info", () => {
        const myLog = typedi_1.Container.get(log_js_1.Log);
        const myLogData = myLog.info("source", "me", { a: 1 }, true);
        (0, globals_1.expect)(myLogData.source).toEqual("source");
        (0, globals_1.expect)(myLogData.message).toEqual("me");
        (0, globals_1.expect)(myLogData.params.a).toEqual(1);
    }, 70 * SECONDS);
    it("Error", () => {
        const myLog = typedi_1.Container.get(log_js_1.Log);
        const myLogData = myLog.error("source", new Error('err 1'), { a: 1 }, true);
        (0, globals_1.expect)(myLogData.source).toEqual("source");
        (0, globals_1.expect)(myLogData.params.a).toEqual(1);
        (0, globals_1.expect)(myLogData.message.indexOf("log.test.ts")).toBeGreaterThan(0);
    }, 70 * SECONDS);
    it("Exception", () => {
        const myLog = typedi_1.Container.get(log_js_1.Log);
        const myLogData = myLog.exception("source", new Error('err 1'), { a: 1 }, true);
        (0, globals_1.expect)(myLogData.source).toEqual("source");
        (0, globals_1.expect)(myLogData.params.a).toEqual(1);
        (0, globals_1.expect)(myLogData.message.indexOf("log.test.ts")).toBeGreaterThan(0);
    }, 70 * SECONDS);
});
//# sourceMappingURL=log.test.js.map