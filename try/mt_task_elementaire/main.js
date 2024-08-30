// main.ts
import { Worker } from 'worker_threads';
var State;
(function (State) {
    State[State["AVAILABLE"] = 0] = "AVAILABLE";
    State[State["RUNNING"] = 1] = "RUNNING";
})(State || (State = {}));
class MT_RUNONCE {
    state = [];
    objectToProcess = [];
    worker = [];
    objectInProcess = [];
    callBackInProcess = [];
    taskName;
    maxInstance;
    constructor(filename, taskName, maxInstance = 1, checkTimeOut = 2000) {
        // console.log(`MT_RUNONCE: ${filename} ${taskName} ${maxInstance} ${checkTimeOut}`);
        for (var idx = 0; idx < maxInstance; idx++) {
            // console.log(`MT_RUNONCE: init worker ${idx}`);
            this.worker.push(new Worker(filename));
            this.initializeWorker(this.worker[idx]);
            this.objectInProcess.push(undefined);
            this.callBackInProcess.push(undefined);
            this.state.push(State.AVAILABLE);
        }
        this.taskName = taskName;
        this.maxInstance = maxInstance;
        setInterval(() => {
            this.checkQueue();
        }, checkTimeOut);
        setInterval(() => {
            console.dir(this);
        }, 15000);
    }
    checkQueue() {
        // Nothing in the waiting list
        if (this.objectToProcess.length == 0) {
            return;
        }
        var idx = 0;
        while (idx < this.maxInstance) {
            if (this.state[idx] == State.AVAILABLE) {
                this.state[idx] = State.RUNNING;
                var ObjectToProcess = this.objectToProcess.shift();
                ObjectToProcess['data']['slotId'] = idx;
                this.objectInProcess[idx] = ObjectToProcess.data;
                this.callBackInProcess[idx] = ObjectToProcess.callback;
                // console.log(`MT_RUNONCE: slot ${idx} starting with ${JSON.stringify(ObjectToProcess.data)}`);           
                this.worker[idx].postMessage(ObjectToProcess.data);
                return;
            }
            idx++;
        }
    }
    initializeWorker(myWorker) {
        myWorker.on('message', (message) => {
            const dataReturned = JSON.parse(message);
            // console.log(`Task in slot ${dataReturned['slotId']} Done -> received message: ${JSON.stringify(dataReturned)}`);
            const bStatus = (dataReturned['status'] == 'Task Done') ? true : false;
            const idx = dataReturned['slotId'];
            this.state[idx] = State.AVAILABLE;
            this.objectInProcess[idx] = undefined;
            if (this.callBackInProcess[idx] != undefined) {
                var finalCallback = this.callBackInProcess[idx];
                this.callBackInProcess[idx] = undefined;
                if (bStatus) {
                    finalCallback(bStatus, (dataReturned.hasOwnProperty('dataCB')) ? dataReturned['dataCB'] : undefined);
                }
                else {
                    finalCallback(bStatus, { 'message': dataReturned['message'], 'stack': dataReturned['stack'] });
                }
            }
            this.checkQueue();
        });
        myWorker.on('error', (error) => {
            console.error(`received error event: ${error}`);
            setTimeout(() => {
                process.exit(1);
            }, 100);
        });
        myWorker.on('exit', (code) => {
            console.log(`Exception received exit event, task ${code}`);
            setTimeout(() => {
                process.exit(1);
            }, 100);
        });
        myWorker.on('offline', () => {
            console.log(`received offLine event`);
        });
    }
    addJob(obj, callBack = undefined) {
        this.objectToProcess.push({ 'data': obj, 'callback': callBack });
        this.checkQueue();
    }
}
function cb(status, ret) {
    if (status) {
        console.log(`        callback task completed: ${JSON.stringify(ret)}`);
    }
    else {
        console.log(`***     callback task failed: ${JSON.stringify(ret)}`);
    }
}
const mt = new MT_RUNONCE('./worker.js', 'Test', 5, 2000);
setTimeout(() => {
    for (var idx = 0; idx <= 10; idx++) {
        mt.addJob({ 'taskId': idx + 1000, 'data': 'this is test ' + (idx + 1000) }, cb);
    }
    ;
}, 1000);
//# sourceMappingURL=main.js.map