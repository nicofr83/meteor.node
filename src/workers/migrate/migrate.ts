import { RunOnceSvc } from '../runOnceSvc.js';

class TestRunOnceSvc extends RunOnceSvc {
    constructor() {
        super();
        const filePath = __filename.toString().split('/');
        this.name =filePath[filePath.length - 1];
    }
    public async runMe(data: any): Promise<object|undefined> {
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise<object|undefined>((f, reject) => {
            setTimeout(() => {
                try {
 
                    f({'returnedData': {'count': 1}});
                } catch (error) {
                    reject(error);
                }
            },200);
        });
    }
}
new TestRunOnceSvc();
