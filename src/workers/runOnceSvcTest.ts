import { RunOnceSvc } from './runOnceSvc.js';
import { MsgFormatIn, MsgFormatOut } from './runOnceSvc_interface.js';

class TestRunOnceSvc extends RunOnceSvc {
    private count: number = 0;
    constructor() {
        super();
        this.name = __filename;
        this.count = 0;
        // console.log('TestRunOnceSvc constructor');
    }
    public async runMe(data: any): Promise<object|undefined> {
        this.count++;
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise<object|undefined>((f, reject) => {
            setTimeout(() => {
                try {
                    // console.log('    SVC: ' + JSON.stringify(data) + ', count: ' + this.count);
                    f({'returnedData': {'count': this.count}});
                } catch (error) {
                    reject(error);
                }
            },50);
        });
    }
}
new TestRunOnceSvc();
