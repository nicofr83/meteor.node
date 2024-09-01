import { RunOnceSvc } from './runOnceSvc.js';

class TestRunOnceSvc extends RunOnceSvc {
    constructor() {
        console.log('TestRunOnceSvc: constructor');
        super();
    }
    public async runMe(data: object): Promise<object|undefined> {
        console.log(`TestRunOnceSvc: ${JSON.stringify(data)}`);
        return data;
    }
}
new TestRunOnceSvc();
