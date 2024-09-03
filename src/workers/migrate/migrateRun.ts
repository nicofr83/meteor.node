import {RunOnce} from "../runOnce.js";
import {LogData} from "../runOnceSvc_interface.js";

var mt_once: RunOnce;
try{
    mt_once = new RunOnce('./dist/workers/migrate/migrate.js', 'migrate', false, -1);
} catch (error) {
    console.error(`MT_RUNONCE: ${error}`);
    process.exit(1);
}

var ret = undefined as any;
var cbCount = 1;

function cb(status: boolean, dataCB: any, logMsg: LogData, request: any) {
    console.log('---------------------------------------------------------------------------------');
    if (status) {
        console.log(` -> runOnceSvcTestRun cb ${cbCount} status: ${status} data: ${JSON.stringify(dataCB)}`);
    } else {
            console.log(` -> ERROR: logMsg: ${logMsg.message}`);
    }
    console.log(`    request: ${JSON.stringify(request)}`);
    console.log('---------------------------------------------------------------------------------\n');
    cbCount++;

    setInterval(() => {
        if (cbCount >= 10) {
            process.exit(0);
        }
    }, 500);
}

for (var i = 1; i < 10; i++) {
    mt_once.addJob({'meteor': 'BBF015'}, cb);
}
