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
    private dataInProcess:object|undefined;
    private callBackInProcess: Function|undefined;
    private taskName: string;
    private myLog: Log;
    private nbRetries: number = 0;
    private shutdownChild: boolean = false;
    private myTimeOutTimer: NodeJS.Timeout|undefined;   // timeout for a running job
    private restartTimeOut: NodeJS.Timeout|undefined;   // timeout during restart job
    private killTimeOut: NodeJS.Timeout|undefined;      // timeout during kill job
    private checkQInterval: NodeJS.Timeout|undefined;   // interval to check the queue
    private timeOut: number;
    private filename: string;
    private bStayOnline: boolean;
    private onGoingCheck: boolean = false;
    private startDate: number = new Date().getTime();

    constructor(filename: string, taskName: string, stayOnline: boolean = true, timeOut: number = 5000){
        this.taskName = taskName;
        console.log(this.taskName + ' ' + 'runOnce constructor');
        this.myLog = Container.get(Log);
        this.myLog.debug('runOnce',`${filename} ${taskName} ${stayOnline} ${timeOut}`);
        this.filename = filename;
        this.state = WorkerState.STOPPED;
        this.timeOut = timeOut;
        this.objectsQueue = new (Array <{'data': any, 'callback': Function|undefined}>);
        this.bStayOnline = stayOnline;
        this.killTimeOut = undefined;

        this.startChild();
        this.setCheckQueueInterval();
    }

    private setCheckQueueInterval() {
        // Check if the queue is empty
        if (this.checkQInterval == undefined) {
            this.checkQInterval = setInterval(() => {
                console.log(this.taskName + ' ' + 'checkQ timeout fired');
                this.checkQueue();
            }, 150);
            console.log(this.taskName + ' ' + 'checkQ timeout activated');
        }
    }
    private stopCheckQueueInterval() {
        // Check if the queue is empty
        if (this.checkQInterval != undefined) {
            clearInterval(this.checkQInterval);
            this.checkQInterval = undefined;
            console.log(this.taskName + ' ' + 'checkQ timeout de-activated');
        }
    }
    private stopChild(): void {
        try {
            console.log(this.taskName + ' ' + 'begin stopChild: ' + (new Date().getTime() - this.startDate) + 'ms');
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
                console.log(this.taskName + ' ' + 'restart timeout fired');
                if (this.state == WorkerState.STOPPED) {
                    this.startChild();
                    return;
                }
                this.worker.kill();
                // this.killTimeOut = setTimeout(() => {
                //     console.log(this.taskName + ' ' + 'kill timeout fired');
                //     this.startChild();
                // }, 400);
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
            console.log('startChild: ' + __dirname + "/" + this.filename);
            this.startDate = new Date().getTime();
            if (this.restartTimeOut != undefined) {
                clearTimeout(this.restartTimeOut);
            }
            if (this.killTimeOut != undefined) {
                clearTimeout(this.killTimeOut);
            }
            if (this.state == WorkerState.RUNNING || this.state == WorkerState.AVAILABLE) {
                return;
            }
            console.log('forking');
            // this.worker = fork('--debug=5589 ' + this.filename);
            this.worker = fork(__dirname + "/" + this.filename);
  
            console.log('child pid: ' + this.worker.pid);
            this.initializeWorker(this.worker);
        }
        catch (error: any) {
            this.myLog.exception('runOnce', error);
            process.exit(1);
        }
        this.dataInProcess = undefined;
        this.callBackInProcess = undefined;
        this.state = WorkerState.AVAILABLE;
        this.restartTimeOut = undefined;
        this.nbRetries = 0;
        this.shutdownChild = false;
    }

    private initializeWorker(myChild: ChildProcess) {
        myChild.on('message', (dataReturnedMsg: MsgFormatOut) => {
            console.log(this.taskName + ' ' + 'begin message received: ' + (new Date().getTime() - this.startDate) + 'ms');
            if (this.myTimeOutTimer != undefined) {
                clearTimeout(this.myTimeOutTimer);
                this.myTimeOutTimer = undefined;
            }
            // free resources
            const originalRequest = this.dataInProcess;
            const finalCallback = this.callBackInProcess;
            this.callBackInProcess = undefined;
            this.dataInProcess = undefined;
            this.nbRetries = 0;
            this.state = WorkerState.AVAILABLE;
            this.myLog.debug('runOnce', `message received: ${JSON.stringify(dataReturnedMsg.data)}`);

            if (finalCallback != undefined) {
                 try {
                    console.log(this.taskName + ' ' + 'cb called: ' + (new Date().getTime() - this.startDate) + 'ms');
                    finalCallback(dataReturnedMsg.status, dataReturnedMsg.data, dataReturnedMsg.logMessage, originalRequest);
                } catch (error: any) {
                    this.myLog.exception('runOnce-callback', error);
                }
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
                        this.myLog.debug('runOnce', 'data of failed job: ' + JSON.stringify(this.dataInProcess));
                        break;
                    case LogType.EXCEPTION:
                        this.myLog.printLog(logData.type, dataReturnedMsg.source, logData.message, {'stack': logData.stack});
                        this.myLog.debug('runOnce', 'data of failed job: ' + JSON.stringify(this.dataInProcess));
                }
            }
            // restart the child if not in stay online mode
            if (!this.bStayOnline) {
                this.stopChild();
            }
            console.log(this.taskName + ' ' + 'end message received: ' + (new Date().getTime() - this.startDate) + 'ms');
            this.checkQueue();
        });

        myChild.on('error', (error) => {
            console.log(this.taskName + ' ' + 'error: ' + error);
            this.myLog.exception('runOnce', error);
            this.stopCheckQueueInterval();
            this.stopChild();
        });

        myChild.on('exit', (code) => {
            // can get an exit without an error
            this.stopCheckQueueInterval();
            console.log('exit code: ' + code);
            if (this.state == WorkerState.AVAILABLE){
                this.stopChild();
                return;
            }
            if (this.nbRetries++ > 10) {
                this.myLog.exception('runOnce', new Error('to many reties, exiting '));
                this.shutdownChild = true;
                setTimeout(() => {
                    console.log(this.taskName + ' ' + 'process exit timeout fired');
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
        if (this.objectsQueue.length == 0 || this.onGoingCheck) {
            this.stopCheckQueueInterval();
            return;
        }

        try {
            if (this.state == WorkerState.AVAILABLE) {
                this.setCheckQueueInterval();
                this.state = WorkerState.RUNNING;
                var objToLaunch = this.objectsQueue.shift() as any;
                this.dataInProcess= objToLaunch.data;
                this.callBackInProcess = objToLaunch.callback;
                this.myLog.debug('runOnce', `job starting with ${JSON.stringify(this.dataInProcess)}`);

                const jobRequest: MsgFormatIn = {
                    'shutdown': false,
                    'data': this.dataInProcess
                };
                this.worker.send(jobRequest);

                this.myLog.debug('runOnce', `message sent to job`);
                this.shutdownChild = false;
                this.nbRetries = 0;
                if (this.timeOut > 0) {
                    this.myTimeOutTimer = setTimeout(() => {
                        console.log(this.taskName + ' ' + 'child timeout fired');
                        this.myLog.error('runOnce', new Error('timeout on child process: ' + this.taskName));
                        this.stopChild();
                    }, this.timeOut);
                }
            }
        }
        catch (error: any) {
            this.myLog.exception('runOnce', error);
        }
        finally {
            this.onGoingCheck = false
        }
    }

    public addJob(obj: object, callBack: (Function|undefined) = undefined) {
        this.myLog.debug('runOnce', `addJob: ${JSON.stringify(obj)}`);
        this.objectsQueue.push({'data': obj, 'callback': callBack});
        this.checkQueue();
    }
}
