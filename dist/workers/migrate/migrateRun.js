"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runOnce_js_1 = require("../runOnce.js");
var mt_once;
try {
    mt_once = new runOnce_js_1.RunOnce('./migrate/migrate.js', 'migrate', false, -1);
}
catch (error) {
    console.error(`MT_RUNONCE: ${error}`);
    process.exit(1);
}
var ret = undefined;
var cbCount = 1;
function cb(status, dataCB, request) {
    console.log('---------------------------------------------------------------------------------');
    if (status) {
        console.log(` -> runOnceSvcTestRun cb ${cbCount} status: ${status} data: ${JSON.stringify(dataCB)}`);
    }
    else {
        console.log(` -> ERROR: data: ${JSON.stringify(dataCB)}`);
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
mt_once.addJob({ 'meteor': 'BBF015' }, cb);
//# sourceMappingURL=migrateRun.js.map