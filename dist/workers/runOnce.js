"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunOnce = void 0;
const typedi_1 = require("typedi");
const child_process_1 = require("child_process");
const enums_js_1 = require("../tools/enums.js");
const log_js_1 = require("../tools/log.js");
const lock_js_1 = require("../tools/lock.js");
class RunOnce {
    state;
    objectsQueue = [];
    // @ts-ignore
    worker;
    dataInProcess;
    callBackInProcess;
    taskName;
    myLog;
    restartLock;
    nbRetries = 0;
    shutdownChild = false;
    myTimeOutTimer; // timeout for a running job
    restartTimeOut; // timeout during restart job
    checkQInterval; // interval to check the queue
    timeOut;
    filename;
    bStayOnline;
    startJobDate = new Date().getTime();
    constructor(filename, taskName, stayOnline = true, timeOut = 5000) {
        this.myLog = typedi_1.Container.get(log_js_1.Log);
        this.restartLock = typedi_1.Container.get(lock_js_1.Lock);
        this.restartLock.setGoal('restartLock');
        this.restartLock.release();
        this.taskName = taskName;
        this.myLog.debug('runOnce', this.taskName + ' ' + 'runOnce constructor');
        this.myLog.debug('runOnce', `${filename} ${taskName} ${stayOnline} ${timeOut}`);
        this.filename = filename;
        this.state = enums_js_1.WorkerState.STOPPED;
        this.timeOut = timeOut;
        this.objectsQueue = new (Array);
        this.bStayOnline = stayOnline;
        this.startChild();
        this.setCheckQueueInterval();
    }
    setCheckQueueInterval() {
        // Check if the queue is empty
        if (this.checkQInterval == undefined) {
            this.checkQInterval = setInterval(() => {
                this.checkQueue();
            }, 150);
            this.myLog.debug('runOnce', this.taskName + ' ' + 'checkQ timeout activated');
        }
    }
    stopCheckQueueInterval() {
        // Check if the queue is empty
        if (this.checkQInterval != undefined) {
            clearInterval(this.checkQInterval);
            this.checkQInterval = undefined;
            this.myLog.debug('runOnce', this.taskName + ' ' + 'checkQ timeout de-activated');
        }
    }
    async stopChild() {
        try {
            this.myLog.debug('runOnce', this.taskName + ' ' + 'begin stopChild: ' + (new Date().getTime() - this.startJobDate) + 'ms');
            if (this.shutdownChild) {
                return;
            }
            this.shutdownChild = true;
            this.state = enums_js_1.WorkerState.STOPPING;
            const shutdownRequest = {
                'shutdown': true,
                'data': undefined
            };
            this.worker.send(shutdownRequest);
            this.state = enums_js_1.WorkerState.STOPPING;
            const restartLockResult = await this.restartLock.acquire('stopChild', 5000);
            if (!restartLockResult) {
                this.myLog.info('runOnce', 'child job does not terminate in time, killing it');
                this.worker.kill();
            }
            else {
                this.myLog.debug('runOnce', 'child job stopped successfully');
            }
            this.state = enums_js_1.WorkerState.STOPPED;
            this.restartLock.release();
        }
        catch (error) {
            this.myLog.exception('runOnce', error);
            try {
                this.worker.kill();
            }
            catch (error) {
                this.myLog.exception('runOnce', error);
            }
            process.exit(1);
        }
    }
    startChild() {
        try {
            if (this.state != enums_js_1.WorkerState.STOPPED) {
                this.myLog.info('runOnce', 'startChild with state != STOPPED, state = ' + this.state.toString());
                return;
            }
            this.myLog.debug('runOnce', 'startChild: ' + __dirname + "/" + this.filename);
            this.startJobDate = new Date().getTime();
            this.myLog.debug('runOnce', 'forking' + __dirname + "/" + this.filename);
            this.worker = (0, child_process_1.fork)(__dirname + "/" + this.filename);
            this.myLog.debug('runOnce', 'child pid: ' + this.worker.pid);
            this.initializeWorker(this.worker);
        }
        catch (error) {
            this.myLog.exception('runOnce', error);
            process.exit(1);
        }
        this.dataInProcess = undefined;
        this.callBackInProcess = undefined;
        this.state = enums_js_1.WorkerState.AVAILABLE;
        this.restartTimeOut = undefined;
        this.nbRetries = 0;
        this.shutdownChild = false;
        this.restartLock.release();
    }
    initializeWorker(myChild) {
        myChild.on('message', async (dataReturnedMsg) => {
            this.myLog.debug('runOnce', this.taskName + ' ' +
                'status: ' + dataReturnedMsg.status.toString() +
                ', message received: ' + JSON.stringify(dataReturnedMsg.data) +
                ', time: ' + (new Date().getTime() - this.startJobDate) + 'ms');
            if (this.myTimeOutTimer != undefined) {
                clearTimeout(this.myTimeOutTimer);
                this.myTimeOutTimer = undefined;
            }
            // callback
            if (this.callBackInProcess != undefined) {
                try {
                    this.myLog.debug('runOnce', this.taskName + ' ' + 'cb called: ' + (new Date().getTime() - this.startJobDate) + 'ms');
                    this.callBackInProcess(dataReturnedMsg.status, dataReturnedMsg.data, this.dataInProcess);
                }
                catch (error) {
                    this.myLog.exception('runOnce-callback', error);
                }
            }
            // free resources
            this.callBackInProcess = undefined;
            this.dataInProcess = undefined;
            this.nbRetries = 0;
            this.state = enums_js_1.WorkerState.AVAILABLE;
            this.checkQueue();
        });
        myChild.on('error', async (error) => {
            this.myLog.exception('runOnce', error);
            await this.stopChild();
            this.startChild();
            this.checkQueue();
        });
        myChild.on('exit', (code) => {
            // can get an exit without an error
            this.stopCheckQueueInterval();
            this.myLog.debug('runOnce', 'exit code: ' + code);
            this.restartLock.release();
            this.state = enums_js_1.WorkerState.STOPPED;
            if (this.bStayOnline) {
                this.startChild();
            }
        });
    }
    checkQueue() {
        if (this.state != enums_js_1.WorkerState.AVAILABLE) {
            return;
        }
        try {
            // limit re-entrance and uncessary calls
            this.stopCheckQueueInterval();
            // Nothing in the waiting list
            if (this.objectsQueue.length == 0) {
                // wait for a new job (add job)
                if (!this.bStayOnline) {
                    this.stopChild().then(() => {
                        process.exit(0);
                        return;
                    }).catch((error) => {
                        this.myLog.exception('runOnce', error);
                        process.exit(1);
                        return;
                    });
                }
                this.setCheckQueueInterval();
                return;
            }
            this.state = enums_js_1.WorkerState.RUNNING;
            var objToLaunch = this.objectsQueue.shift();
            this.dataInProcess = objToLaunch.data;
            this.callBackInProcess = objToLaunch.callback;
            this.myLog.debug('runOnce', `job starting with ${JSON.stringify(this.dataInProcess)}`);
            const jobRequest = {
                'shutdown': false,
                'data': objToLaunch.data
            };
            this.worker.send(jobRequest);
            this.myLog.debug('runOnce', `message sent to job`);
        }
        catch (error) {
            this.myLog.exception('runOnce', error);
            this.stopChild().then(() => {
                process.exit(1);
            }).catch((error) => {
                this.myLog.exception('runOnce', error);
                process.exit(1);
            });
        }
    }
    addJob(obj, callBack = undefined) {
        this.myLog.debug('runOnce', `addJob: ${JSON.stringify(obj)}`);
        this.objectsQueue.push({ 'data': obj, 'callback': callBack });
        this.checkQueue();
    }
}
exports.RunOnce = RunOnce;
//# sourceMappingURL=runOnce.js.map