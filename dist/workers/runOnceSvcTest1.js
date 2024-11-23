"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runOnceSvc_js_1 = require("./runOnceSvc.js");
class TestRunOnceSvc extends runOnceSvc_js_1.RunOnceSvc {
    count = 0;
    constructor() {
        super();
        const fnArrray = __filename.split('/');
        this.name = fnArrray[fnArrray.length - 1].split('.')[0];
        this.count = 0;
        // console.log('TestRunOnceSvc constructor');
    }
    async runMe(data) {
        this.count++;
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise((f, reject) => {
            setTimeout(() => {
                try {
                    // console.log('    SVC: ' + JSON.stringify(data) + ', count: ' + this.count);
                    f({ 'returnedData': { 'count': this.count } });
                }
                catch (error) {
                    reject(error);
                }
            }, 10);
        });
    }
}
new TestRunOnceSvc();
//# sourceMappingURL=runOnceSvcTest1.js.map