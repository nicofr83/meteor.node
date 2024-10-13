import {RunOnce} from "../runOnce.js";
import {LogData} from "../runOnceSvc_interface.js";

var mt_once: RunOnce;
try{
    console.log(__dirname);
    mt_once = new RunOnce('./migrate/migrate.js', 'migrate', false, -1);
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
        if (cbCount >= 100000000) {
            console.log(' exiting..');
            process.exit(0);
        }
    }, 50000);
}

console.log(` -> starting job for BBF015`);
mt_once.addJob({'meteor': 'BBF015'}, cb);
