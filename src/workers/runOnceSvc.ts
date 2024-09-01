// worker.ts
import { MessagePort, parentPort } from 'worker_threads';
import { RunOnceSvcInt } from './runOnceSvc_interface.js';

export class RunOnceSvc implements RunOnceSvcInt {
    msgParentPort: MessagePort = parentPort as MessagePort;

    constructor() {
        console.log('RunOnceSvc: constructor');
        this.msgParentPort.on('message', async (data: object) => {
            console.log(`RunOnceSvc:  Task ${data} activated...`);
            await this.performTask(data);
        });
    }
    public async performTask(data: object): Promise<void> {
        const msgBack = {
            'status': 'OK', 
            'slotId': (data as any)['slotId'],
        } as any;

        try {
            console.log(`RunOnceSvc: Task ${(data as any)['taskId']} in slot ${(data as any)['slotId']} started`);
            msgBack['dataDB'] = await this.runMe(data);
            console.log("RunOnceSvc: Task Done: " + JSON.stringify(msgBack));
            (parentPort as MessagePort).postMessage(JSON.stringify(msgBack));    
        }
        catch (error: any) {
            msgBack['status'] = 'Exception';
            msgBack['message'] = error.message;
            msgBack['exc'] = error.stack;
            (parentPort as MessagePort).postMessage(JSON.stringify(msgBack));
        }
    }
    public async runMe(data: object): Promise<object|undefined> {
        // throw new Error('Method not implemented.');
        console.log(`TestRunOnceSvc: ${JSON.stringify(data)}`);
        return data;
    }
}
