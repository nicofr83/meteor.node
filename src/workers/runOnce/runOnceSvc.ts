// worker.ts
import { MessagePort, parentPort } from 'worker_threads';
import { RunOnceSvcInt } from './runOnceSvc_interface';

export abstract class RunOnceSvc implements RunOnceSvcInt {
    public async performTask(data: object): Promise<void> {
        const msgBack = {
            'status': 'Task Done', 
            'slotId': (data as any)['slotId'],
        } as any;

        try {
            msgBack['dataDB'] = await this.runMe(data);
            (parentPort as MessagePort).postMessage(JSON.stringify(msgBack));    
        }
        catch (error: any) {
            msgBack['status'] = 'Exception';
            msgBack['message'] = error.message;
            msgBack['exc'] = error.stack;
            (parentPort as MessagePort).postMessage(JSON.stringify(msgBack));
        }
    }
    public runMe(data: object): object|undefined {
        throw new Error('Method not implemented.');
    }
}
