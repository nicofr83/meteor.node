import {RunOnce} from "./runOnce.js";

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
// console.log("runOnce Test Starting");
var mtLoop: RunOnce;
var mtOnce: RunOnce;
try{
    mtLoop = new RunOnce('./dist/workers/runOnceSvcTest.js', 'runOnceSvcTest', true, -1);
    mtOnce = new RunOnce('./dist/workers/runOnceSvcTest.js', 'runOnceSvcTest', false, -1);
} catch (error) {
    // console.error(`MT_RUNONCE: ${error}`);
    process.exit(1);
}
// console.log("runOnce Test Started");

describe("RunOnce Tests", () => {

    it("1 job no callback", () => {
        return new Promise<void>((f, reject) => {
            mtLoop.addJob({'slotId': 1, 'data': 'test 1'});
            setTimeout(() => {
                expect(true);
                f();
            }, 200);
        });
    }, 70 * SECONDS);
    it("1 job with callback", async () => {
        return new Promise<void>((f, reject) => {
            var ret = undefined as any;
            function cb(status: boolean, dataCB: any) {
                console.dir(dataCB);
                expect(dataCB.returnedData.count).toBeGreaterThan(0);
                f();
            }
            mtLoop.addJob({'slotId': 1, 'data': 'test 1'}, cb);
        });
    }, 70 * SECONDS);
it("4 jobs", () => {
    var ret = [] as any[];
    function cb(status: boolean, dataCB: any) {
        if (status) {
            ret.push(dataCB);
        }
    }
    var idx = 0;
    while (idx < 4) {
        mtLoop.addJob({'slotId': 1, 'data': 'test ' + idx++}, cb);
    }   
    setTimeout(() => {
        expect(ret.length).toEqual(4);
        expect(ret[ret.length - 1].returnedData.count).toBeGreaterThan(3);
    }, 200);
}, 70 * SECONDS);
it("4 jobs on a new instance", () => {
    var ret = [] as any[];
    function cb(status: boolean, dataCB: any) {
        if (status) {
            ret.push(dataCB);
        }
    }
    var idx = 0;
    while (idx < 4) {
        mtOnce.addJob({'slotId': 1, 'data': 'test ' + idx++}, cb);
    }   
    setTimeout(() => {
        expect(ret.length).toEqual(4);
        expect(ret[ret.length - 1].returnedData.count).toEqual(1);
    }, 200);
}, 70 * SECONDS);

});
