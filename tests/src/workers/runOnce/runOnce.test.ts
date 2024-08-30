import {RunOnce} from "../../../../src/workers/runOnce/runOnce";

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
const mt_once = new RunOnce('./' + 'runOnceSvcTest.js', 'runOnceSvcTest', 2, 1000);

describe("RunOnce Tests", () => {

    it("test RunOnce 1 job no callback", () => {
        mt_once.addJob({'slotId': 1, 'data': 'test 1'});
        setTimeout(() => {
            expect(true);
        }, 100);
    }, 70 * SECONDS);
    it("test RunOnce 1 job", () => {
        var ret = undefined as any;
        function cb(status: boolean, dataCB: any) {
            ret = status ? dataCB : 'Error in service';
        }

        mt_once.addJob({'slotId': 1, 'data': 'test 1'}, cb);
        setTimeout(() => {
            expect(ret).toEqual('test 1');
        }, 100);
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
    }, 100);
}, 70 * SECONDS);

});
