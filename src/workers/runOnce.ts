import { Container } from 'typedi'
import { ChildProcess, fork } from'child_process';
import { MsgFormatIn, MsgFormatOut } from './runOnceSvc_interface.js'
import { WorkerState, LogType } from '../tools/enums.js';
import { Log } from '../tools/log.js';

export class RunOnce {
    private state: WorkerState;
    private objectsQueue: Array <{'data': any, 'callback': Function|undefined}> = [];
    private worker: ChildProcess;
    private objectInProcess:object|undefined;
    private callBackInProcess: Function|undefined;
    private taskName: string;
    private myTimeOut: NodeJS.Timeout|undefined;
    private myLog: Log;
    private nbRetries: number = 0;
    private shutdownChild: boolean = false;

    constructor(filename: string, taskName: string, timeOut: number = 5000){
        this.myLog = Container.get(Log);
        this.myLog.debug('runOnce',`${filename} ${taskName} ${timeOut}`);
        try {
            this.worker= fork(filename);
            this.initializeWorker(this.worker);
        } catch (error: any) {
            this.myLog.exception('runOnce', error);
            process.exit(1);
        }
        this.objectInProcess = undefined;
        this.callBackInProcess = undefined;
        this.state = WorkerState.AVAILABLE;
        this.taskName = taskName;
        this.myTimeOut = undefined;
        setInterval(() => {
            this.checkQueue();
        }, 1000);
    }

    private restartChild() {

        this.shutdownChild = false;
    }
    private initializeWorker(myChild: ChildProcess) {
        myChild.on('message', (dataReturned: MsgFormatOut) => {
            if (dataReturned.data != undefined) {
                if (this.myTimeOut != undefined) {
                    clearTimeout(this.myTimeOut);
                    this.myTimeOut = undefined;
                }
                this.myLog.debug('runOnce', `message received: ${JSON.stringify(dataReturned)}`);
                this.state = WorkerState.AVAILABLE;
                this.objectInProcess = undefined;
                if (this.callBackInProcess != undefined) {
                    var finalCallback = this.callBackInProcess;
                    this.callBackInProcess = undefined;
                    try {
                        finalCallback(dataReturned.status, dataReturned.data);
                    } catch (error: any) {
                        this.myLog.exception('runOnce-callback', error);
                    }
                }
                this.nbRetries = 0;
                this.checkQueue();
            }
            if (dataReturned.logMessage != undefined) {
                const logData = dataReturned.logMessage;
                switch (logData.type) {
                    case LogType.INFO:
                        this.myLog.info(`${dataReturned.source}`, `${logData.message}`);
                        break;
                    case LogType.DEBUG:
                        this.myLog.debug(`${dataReturned.source}`, `${logData.message}`, logData.params == undefined ? {} : logData.params);
                        break;
                    case LogType.ERROR:
                        this.myLog.printLog(logData.type, dataReturned.source, logData.message, {'firstStack': logData.stackLine});
                        break;
                    case LogType.EXCEPTION:
                        this.myLog.printLog(logData.type, dataReturned.source, logData.message, {'stack': logData.stack});
                        this.restartChild()
                        return;
                }
            }
        });
        myChild.on('error', (error) => {
            if (this.shutdownChild) {
                return;
            }
            if (this.nbRetries++ > 10) {
                this.myLog.exception('runOnce', new Error('to many reties, exiting '));
                this.shutdownChild = true;
                setTimeout(() => {
                    process.exit(1);
                }, 500);
                return;
            }
            this.myLog.exception('runOnce', error);
            this.restartChild();
        });
        myChild.on('exit', (code) => {
            if (this.shutdownChild) {
                return;
            }
            if (this.nbRetries++ > 10) {
                this.myLog.exception('runOnce', new Error('to many reties, exiting '));
                this.shutdownChild = true;
                setTimeout(() => {
                    process.exit(1);
                }, 500);
                return;
            }
            this.myLog.error('runOnce', new Error('child process exited with code ' + code));
            this.restartChild();
        });
    }
    private checkQueue() {
        // Nothing in the waiting list
        if (this.objectsQueue == undefined) {
            console.log(`MT_RUNONCE: nothing in the waiting list`);
            return;
        }

        if (this.state == WorkerState.AVAILABLE) {
            this.state = WorkerState.RUNNING;
            var objToLaunch = this.objectsQueue.shift() as any;
            this.objectInProcess= objToLaunch.data;
            this.callBackInProcess = objToLaunch.callback;
            this.myLog.debug('runOnce', `job starting with ${JSON.stringify(objToLaunch.data)}`);
            this.worker.send(objToLaunch.data);
            this.myLog.debug('runOnce', `message sent`);
            this.shutdownChild = false;
            this,this.nbRetries = 0;
            return;
        }
    }

    public addJob(obj: object, callBack: (Function|undefined) = undefined) {
        this.myLog.debug('runOnce', `addJob: ${JSON.stringify(obj)}`);
        this.objectsQueue.push({'data': obj, 'callback': callBack});
        this.checkQueue();
    }
}
