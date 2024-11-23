"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runOnce_js_1 = require("./runOnce.js");
// const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const SECONDS = 5000;
// console.log("runOnce Test Starting");
var mtLoop;
var mtOnce;
try {
    mtLoop = new runOnce_js_1.RunOnce('./runOnceSvcTest1.js', 'runOnceSvcTest1_loop', true, -1);
    mtOnce = new runOnce_js_1.RunOnce('./runOnceSvcTest2.js', 'runOnceSvcTest2_once', false, -1);
}
catch (error) {
    // console.error(`MT_RUNONCE: ${error}`);
    process.exit(1);
}
// console.log("runOnce Test Started");
describe("RunOnce Tests", () => {
    it("1 job no callback", () => {
        return new Promise((f, reject) => {
            mtLoop.addJob({ 'slotId': 1, 'data': 'test 1' });
            setTimeout(() => {
                expect(true);
                f();
            }, 200);
        });
    }, 70 * SECONDS);
    it("1 job with callback", async () => {
        return new Promise((f, reject) => {
            const d1 = new Date().getTime();
            var ret = undefined;
            function cb1(status, dataCB) {
                // console.log('cb1: ' + (new Date().getTime() - d1) + 'ms');
                ret = true;
            }
            mtLoop.addJob({ 'slotId': 1, 'data': 'test 1' }, cb1);
            setTimeout(() => {
                try {
                    // console.log('exit1: ' + (new Date().getTime() - d1) + 'ms');
                    expect(ret).toBe(true);
                    f();
                }
                catch (error) {
                    reject(error);
                }
            }, 300);
        });
    }, 70 * SECONDS);
    it("4 jobs", () => {
        return new Promise((f, reject) => {
            var ret = [];
            // console.log('4 jobs');
            function cb(status, dataCB) {
                if (status) {
                    ret.push(dataCB);
                    // console.log('cb: ' + JSON.stringify(dataCB) + ', ' + ret.length);
                }
            }
            var idx = 0;
            while (idx < 4) {
                mtLoop.addJob({ 'slotId': 1, 'data': 'test ' + idx++ }, cb);
                // console.log('job added');
            }
            setTimeout(() => {
                try {
                    // console.dir(ret);
                    expect(ret.length).toEqual(4);
                    expect(ret[ret.length - 1].returnedData.count).toBeGreaterThan(4);
                    f();
                }
                catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }, 70 * SECONDS);
    it("4 jobs on a new instance", () => {
        // console.log('4 jobs on a new instance');
        return new Promise((f, reject) => {
            var ret = [];
            function cb2(status, dataCB) {
                if (status) {
                    ret.push(dataCB);
                }
                console.log('cb: ' + dataCB + ', status: ' + status + ', ret.len: ' + ret.length);
            }
            var idx = 0;
            while (idx < 4) {
                mtOnce.addJob({ 'slotId': 1, 'data': 'test ' + idx++ }, cb2);
            }
            setTimeout(() => {
                try {
                    // console.dir(ret);
                    expect(ret.length).toEqual(4);
                    expect(ret[ret.length - 1].returnedData.count).toBe(4);
                    f();
                }
                catch (error) {
                    reject(error);
                }
            }, 3000);
        });
    }, 70 * SECONDS);
});
//# sourceMappingURL=runOnce.test.js.map