import {RunOnce} from "./runOnce.js";

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
// console.log("runOnce Test Starting");
var mt_once: RunOnce;
try{
    mt_once = new RunOnce('./dist/workers/runOnceSvcTest.js', 'runOnceSvcTest', true, 1000);
} catch (error) {
    // console.error(`MT_RUNONCE: ${error}`);
    process.exit(1);
}
// console.log("runOnce Test Started");

describe("RunOnce Tests", () => {

    it("test RunOnce 1 job no callback", () => {
        return new Promise<void>((f, reject) => {
            mt_once.addJob({'slotId': 1, 'data': 'test 1'});
            setTimeout(() => {
                expect(true);
                f();
            }, 200);
        });
    }, 70 * SECONDS);
    it("test RunOnce 1 job", async () => {
        return new Promise<void>((f, reject) => {
            var ret = undefined as any;
            function cb(status: boolean, dataCB: any) {
                // ret = status ? dataCB : 'Error in service';
                expect(dataCB).toEqual('test 1');
                f();
            }
            mt_once.addJob({'slotId': 1, 'data': 'test 1'}, cb);
            // setTimeout(() => {
            //     console.log('ret', ret);
            // }, 2000);
        });
    }, 70 * SECONDS);
it("test RunOnce 4 jobs", () => {
    var ret = [] as any[];
    function cb(status: boolean, dataCB: any) {
        if (status) {
            ret.push(dataCB);
        }
    }
    var idx = 0;
    while (idx < 4) {
        mt_once.addJob({'slotId': 1, 'data': 'test ' + idx++}, cb);
    }   
    setTimeout(() => {
        expect(ret.length).toEqual(4);
    }, 200);
}, 70 * SECONDS);

});
