import { RunOnceSvc } from '../runOnceSvc.js';

class Migrate extends RunOnceSvc {

    constructor() {
        super();
    }

    public async runMe(data: any): Promise<object|undefined> {
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise<object|undefined>((f, reject) => {
            try {
                console.log('first call of setTimer');
 
            } catch(error: any) {
                reject(error);
            }
        });
    }
}
new Migrate();
