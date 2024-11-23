"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunOnceSvc = void 0;
const typedi_1 = require("typedi");
const log_js_1 = require("../tools/log.js");
class RunOnceSvc {
    name = 'RunOnceSvc';
    startDate = new Date().getTime();
    myLog = typedi_1.Container.get(log_js_1.Log);
    constructor() {
        // dotenv.config({path: './config/.env.local'});
        process.on('message', async (msgIn) => {
            this.myLog.debug('runOnceSvc', '   -> ' + this.name + ': message received:' + (new Date().getTime() - this.startDate) + 'ms');
            if (process.env.DEBUG) {
                this.myLog.debug('runOnceSvc', JSON.stringify(msgIn));
            }
            if (msgIn.shutdown) {
                process.exit(1);
            }
            if (msgIn.hasOwnProperty('data') && msgIn.data.hasOwnProperty('setName')) {
                this.name = msgIn.data.setName;
                return;
            }
            await this.performTask(msgIn);
        });
        process.on('error', (error) => {
            process.exit(1);
        });
        process.on('exit', (code) => {
            process.exit(code);
        });
        process.on('uncaughtException', (error) => {
            process.exit(1);
        });
    }
    async performTask(data) {
        if (data == undefined) {
            return;
        }
        const msgBack = {
            'status': true,
            'source': this.name,
            'data': undefined,
            'logMessage': undefined
        };
        try {
            this.startDate = new Date().getTime();
            // console.log('   -> ' + this.name + ': Perform called, date reseted:');
            msgBack.data = await this.runMe(data.data);
            process.send(msgBack);
            // console.log('   -> ' + this.name + ': message processed:' + (new Date().getTime() - this.startDate) + 'ms');
        }
        catch (error) {
            msgBack.status = false;
            msgBack.data = error.message;
            process.send(msgBack);
        }
    }
    async runMe(data) {
        throw new Error('Method not implemented.');
    }
}
exports.RunOnceSvc = RunOnceSvc;
//# sourceMappingURL=runOnceSvc.js.map