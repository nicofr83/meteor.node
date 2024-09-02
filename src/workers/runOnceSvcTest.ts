import { RunOnceSvc } from './runOnceSvc.js';
import { LogType } from '../tools/enums.js';

class TestRunOnceSvc extends RunOnceSvc {
    constructor() {
        super();
        this.name = __filename;
    }
    public async runMe(data: object): Promise<object|undefined> {
        this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return data;
    }
}
new TestRunOnceSvc();
