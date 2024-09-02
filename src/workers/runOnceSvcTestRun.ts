import {RunOnce} from "./runOnce.js";

var mt_once: RunOnce;
try{
    mt_once = new RunOnce('./dist/workers/runOnceSvcTest.js', 'runOnceSvc', 1000);
} catch (error) {
    console.error(`MT_RUNONCE: ${error}`);
    process.exit(1);
}

var ret = undefined as any;
function cb(dataCB: any) {
    console.log(`runOnceSvcTestRun cb data: ${JSON.stringify(dataCB)}`);
}
mt_once.addJob({'my_data': 'test 1'}, cb);
mt_once.addJob({'my_data': 'test 2'}, cb);
mt_once.addJob({'my_data': 'test 3'}, cb);
mt_once.addJob({'my_data': 'test 4'}, cb);
setInterval(() => {
    console.log('runOnceSvcTestRun timeout');
}, 30000);
