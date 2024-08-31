import { Worker } from 'worker_threads';
import {WorkerState} from '../tools/enums';

export class RunOnce {
    private state: WorkerState[] = [];
    private objectToProcess: Array <{'data': any, 'callback': Function|undefined}> = [];
    private worker: Worker[] = [];
    private objectInProcess = [] as (object|undefined)[];
    private callBackInProcess = [] as (Function|undefined)[];
    private taskName: string;
    private maxInstance: number;

    constructor(filename: string, taskName: string, maxInstance: number = 1, checkTimeOut: number = 2000){
        // console.log(`MT_RUNONCE: ${filename} ${taskName} ${maxInstance} ${checkTimeOut}`);
        for (var idx = 0; idx < maxInstance; idx++) {
            // console.log(`MT_RUNONCE: init worker ${idx}`);
            this.worker.push(new Worker(filename));
            this.initializeWorker(this.worker[idx]);
            this.objectInProcess.push(undefined);
            this.callBackInProcess.push(undefined);
            this.state.push(WorkerState.AVAILABLE);
        }
        this.taskName = taskName;
        this.maxInstance = maxInstance;
        setInterval(() => {
            this.checkQueue();
        }, checkTimeOut);
    }

    private checkQueue() {
        // Nothing in the waiting list
        if (this.objectToProcess.length == 0) {
            return;
        }
        var idx = 0;
        while (idx < this.maxInstance) {
            if (this.state[idx] == WorkerState.AVAILABLE) {
                this.state[idx] = WorkerState.RUNNING;
                var objToLaunch = this.objectToProcess.shift() as any;
                objToLaunch['data']['slotId'] = idx;
                this.objectInProcess[idx] = objToLaunch.data;
                this.callBackInProcess[idx] = objToLaunch.callback;
                // console.log(`MT_RUNONCE: slot ${idx} starting with ${JSON.stringify(ObjectToProcess.data)}`);           
                this.worker[idx].postMessage(objToLaunch.data);
                return;
            }
            idx++;
        }
    }

    private initializeWorker(myWorker: Worker) {
        myWorker.on('message', (message) => {
            const dataReturned = JSON.parse(message);
            // console.log(`Task in slot ${dataReturned['slotId']} Done -> received message: ${JSON.stringify(dataReturned)}`);
            const bStatus = (dataReturned['status'] == 'Task Done')? true: false;

            const idx = dataReturned['slotId'];
            this.state[idx] = WorkerState.AVAILABLE;
            this.objectInProcess[idx] = undefined;
            if (this.callBackInProcess[idx] != undefined) {
                var finalCallback = this.callBackInProcess[idx];
                this.callBackInProcess[idx] = undefined;
                if (bStatus) {
                    finalCallback(bStatus, (dataReturned.hasOwnProperty('dataCB')) ? dataReturned['dataCB'] : undefined);
                } else {
                    finalCallback(bStatus, {'message': dataReturned['message'], 'stack': dataReturned['stack']});
                }
            }

            this.checkQueue();
        });
        myWorker.on('error', (error) => {
            console.error(`received error event: ${error}`);
            setTimeout(() => {
                process.exit(1);
            }, 500);
        });
        myWorker.on('exit', (code) => {
            console.log(`Exception received exit event, task ${code}`);
            setTimeout(() => {
                process.exit(1);
            }, 500);
        });
        // myWorker.on('offline', () => {
        //     console.log(`received offLine event`);
        // });
    }
    public addJob(obj: object, callBack: (Function|undefined) = undefined) {
        this.objectToProcess.push({'data': obj, 'callback': callBack});
        this.checkQueue();
    }
}
