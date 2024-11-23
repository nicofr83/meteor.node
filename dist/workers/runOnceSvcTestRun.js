"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runOnce_js_1 = require("./runOnce.js");
var mt_once;
try {
    mt_once = new runOnce_js_1.RunOnce('./dist/workers/runOnceSvcTest.js', 'runOnceSvc', false, -1);
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
        if (cbCount >= 10) {
            process.exit(0);
        }
    }, 500);
}
for (var i = 1; i < 10; i++) {
    mt_once.addJob({ 'my_data': 'test ' + i, 'id': i }, cb);
}
//# sourceMappingURL=runOnceSvcTestRun.js.map