import { Container } from 'typedi'
import { ChildProcess, fork } from'child_process';
import { MsgFormatIn, MsgFormatOut } from './runOnceSvc_interface.js'
import { WorkerState, LogType } from '../tools/enums.js';
import { Log } from '../tools/log.js';

export class RunOnce {
    private state: WorkerState;
    private objectsQueue: Array <{'data': any, 'callback': Function|undefined}> = [];
    // @ts-ignore
    private worker: ChildProcess;
    private objectInProcess:object|undefined;
    private callBackInProcess: Function|undefined;
    private taskName: string;
    private myTimeOut: NodeJS.Timeout|undefined;
    private myLog: Log;
    private nbRetries: number = 0;
    private shutdownChild: boolean = false;
    private restartTimeOut: NodeJS.Timeout|undefined;
    private killTimeOut: NodeJS.Timeout|undefined;
    private timeOut: number;
    private filename: string;
    private bStayOnline: boolean;

    constructor(filename: string, taskName: string, stayOnline: boolean = true, timeOut: number = 5000){
        this.myLog = Container.get(Log);
        this.myLog.debug('runOnce',`${filename} ${taskName} ${timeOut}`);
        this.filename = filename;
        this.taskName = taskName;
        this.state = WorkerState.STOPPED;
        this.timeOut = timeOut;
        this.objectsQueue = new (Array <{'data': any, 'callback': Function|undefined}>);
        this.bStayOnline = stayOnline;
        this.killTimeOut = undefined;

        this.startChild();

        // Check every second if the queue is empty
        setInterval(() => {
            this.checkQueue();
        }, 1000);
    }

    private stopChild(): void {
        try {
            if (this.shutdownChild) {
                return;
            }
            this.shutdownChild = true;

            this.state = WorkerState.STOPPING;
            const shutdownRequest: MsgFormatIn = {
                'shutdown': true,
                'data': undefined
            };
            this.worker.send(shutdownRequest);
            this.restartTimeOut = setTimeout(() => {
                if (this.state == WorkerState.STOPPED) {
                    this.startChild();
                    return;
                }
                this.worker.kill();
                this.killTimeOut = setTimeout(() => {
                    this.startChild();
                }, 400);
            }, 200);
        }
        catch (error: any) {
            this.myLog.exception('runOnce', error);
            // try {
            //     this.worker.kill();
            // } catch(error: any) {
            //     this.myLog.exception('runOnce', error);
            //     process.exit(1);
            // }
        }
    }

    private startChild(): void{
        try {
            if (this.restartTimeOut != undefined) {
                clearTimeout(this.restartTimeOut);
            }
            if (this.killTimeOut != undefined) {
                clearTimeout(this.killTimeOut);
            }
            if (this.state == WorkerState.RUNNING || this.state == WorkerState.AVAILABLE) {
                return;
            }
            this.worker = fork(this.filename);
            this.initializeWorker(this.worker);
        }
        catch (error: any) {
            this.myLog.exception('runOnce', error);
            process.exit(1);
        }
        this.objectInProcess = undefined;
        this.callBackInProcess = undefined;
        this.state = WorkerState.AVAILABLE;
        this.restartTimeOut = undefined;
        this.nbRetries = 0;
        this.shutdownChild = false;
    }

    private initializeWorker(myChild: ChildProcess) {
        myChild.on('message', (dataReturnedMsg: MsgFormatOut) => {
            const dataReturned = dataReturnedMsg.data as MsgFormatOut;

            if (this.myTimeOut != undefined) {
                clearTimeout(this.myTimeOut);
            }
            this.state = WorkerState.AVAILABLE;
            if (this.myTimeOut != undefined) {
                clearTimeout(this.myTimeOut);
                this.myTimeOut = undefined;
            }
            this.myLog.debug('runOnce', `message received: ${JSON.stringify(dataReturned)}`);

            if (this.callBackInProcess != undefined) {
                var finalCallback = this.callBackInProcess;
                const originalRequest = this.objectInProcess;
                this.callBackInProcess = undefined;
                this.objectInProcess = undefined;
                this.nbRetries = 0;

                try {
                    finalCallback(dataReturnedMsg.status, dataReturned, dataReturnedMsg.logMessage, originalRequest);
                } catch (error: any) {
                    this.myLog.exception('runOnce-callback', error);
                }

                this.objectInProcess = undefined;
                this.nbRetries = 0;
            }
            if (dataReturnedMsg.logMessage != undefined) {
                const logData = dataReturnedMsg.logMessage;
                switch (logData.type) {
                    case LogType.INFO:
                        this.myLog.info(`${dataReturnedMsg.source}`, `${logData.message}`);
                        break;
                    case LogType.DEBUG:
                        this.myLog.debug(`${dataReturnedMsg.source}`, `${logData.message}`, logData.params == undefined ? {} : logData.params);
                        break;
                    case LogType.ERROR:
                        this.myLog.printLog(logData.type, dataReturnedMsg.source, logData.message, {'firstStack': logData.stackLine});
                        this.myLog.debug('runOnce', 'data of failed job: ' + JSON.stringify(this.objectInProcess));
                        break;
                    case LogType.EXCEPTION:
                        this.myLog.printLog(logData.type, dataReturnedMsg.source, logData.message, {'stack': logData.stack});
                        this.myLog.debug('runOnce', 'data of failed job: ' + JSON.stringify(this.objectInProcess));
                }
            }
            if (this.bStayOnline) {
                this.stopChild();
            }
            this.checkQueue();
        });
        myChild.on('error', (error) => {
            this.myLog.exception('runOnce', error);
            this.stopChild();
        });
        myChild.on('exit', (code) => {
            // can get an exit without an error
            if (this.state == WorkerState.AVAILABLE){
                this.stopChild();
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
            this.state = WorkerState.STOPPED;
            if (this.bStayOnline){
                this.startChild();
            }
        });
    }
    private checkQueue() {
        // Nothing in the waiting list
        if (this.objectsQueue.length == 0) {
            return;
        }

        if (this.state == WorkerState.AVAILABLE) {
            this.state = WorkerState.RUNNING;
            var objToLaunch = this.objectsQueue.shift() as any;
            this.objectInProcess= objToLaunch.data;
            this.callBackInProcess = objToLaunch.callback;
            this.myLog.debug('runOnce', `job starting with ${JSON.stringify(objToLaunch.data)}`);

            const jobRequest: MsgFormatIn = {
                'shutdown': false,
                'data': objToLaunch.data
            };
            this.worker.send(jobRequest);

            this.myLog.debug('runOnce', `message sent`);
            this.shutdownChild = false;
            this.nbRetries = 0;
            if (this.timeOut > 0) {
                this.myTimeOut = setTimeout(() => {
                    this.myLog.error('runOnce', new Error('timeout on child process: ' + this.taskName));
                    this.stopChild();
                }, 5000);
            }    
            return;
        }
    }

    public addJob(obj: object, callBack: (Function|undefined) = undefined) {
        this.myLog.debug('runOnce', `addJob: ${JSON.stringify(obj)}`);
        this.objectsQueue.push({'data': obj, 'callback': callBack});
        this.checkQueue();
    }
}
