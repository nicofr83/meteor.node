import { Container } from 'typedi'
import { ChildProcess, fork } from'child_process';
import { MsgFormatIn, MsgFormatOut } from './runOnceSvc_interface.js'
import { WorkerState, LogType } from '../tools/enums.js';
import { Log } from '../tools/log.js';
import { Lock } from '../tools/lock.js';

export class RunOnce {
    private state: WorkerState;
    private objectsQueue: Array <{'data': any, 'callback': Function|undefined}> = [];
    // @ts-ignore
    private worker: ChildProcess;
    private dataInProcess:object|undefined;
    private callBackInProcess: Function|undefined;
    private taskName: string;
    private myLog: Log;
    private restartLock: Lock;
    private nbRetries: number = 0;
    private shutdownChild: boolean = false;
    private myTimeOutTimer: NodeJS.Timeout|undefined;   // timeout for a running job
    private restartTimeOut: NodeJS.Timeout|undefined;   // timeout during restart job
    private checkQInterval: NodeJS.Timeout|undefined;   // interval to check the queue
    private timeOut: number;
    private filename: string;
    private bStayOnline: boolean;
    private startJobDate: number = new Date().getTime();

    constructor(filename: string, taskName: string, stayOnline: boolean = true, timeOut: number = 5000){
        this.myLog = Container.get(Log);
        this.restartLock = Container.get(Lock);
        this.restartLock.setGoal('restartLock');
        this.restartLock.release();
        this.taskName = taskName;
        this.myLog.debug('runOnce', this.taskName + ' ' + 'runOnce constructor');
        this.myLog.debug('runOnce',`${filename} ${taskName} ${stayOnline} ${timeOut}`);
        this.filename = filename;
        this.state = WorkerState.STOPPED;
        this.timeOut = timeOut;
        this.objectsQueue = new (Array <{'data': any, 'callback': Function|undefined}>);
        this.bStayOnline = stayOnline;

        this.startChild();
        this.setCheckQueueInterval();
    }

    private setCheckQueueInterval() {
        // Check if the queue is empty
        if (this.checkQInterval == undefined) {
            this.checkQInterval = setInterval(() => {
                this.checkQueue();
            }, 150);
            this.myLog.debug('runOnce', this.taskName + ' ' + 'checkQ timeout activated');
        }
    }
    private stopCheckQueueInterval() {
        // Check if the queue is empty
        if (this.checkQInterval != undefined) {
            clearInterval(this.checkQInterval);
            this.checkQInterval = undefined;
            this.myLog.debug('runOnce', this.taskName + ' ' + 'checkQ timeout de-activated');
        }
    }
    private async stopChild(): Promise<void> {
        try {
            this.myLog.debug('runOnce', this.taskName + ' ' + 'begin stopChild: ' + (new Date().getTime() - this.startJobDate) + 'ms');
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
            this.state = WorkerState.STOPPING;
            const restartLockResult = await this.restartLock.acquire('stopChild', 5000);
            if (!restartLockResult) {
                this.myLog.info('runOnce', 'child job does not terminate in time, killing it');
                this.worker.kill();
            } else {
                this.myLog.debug('runOnce', 'child job stopped successfully');
            }
            this.state = WorkerState.STOPPED;
            this.restartLock.release();
        }
        catch (error: any) {
            this.myLog.exception('runOnce', error);
            try {
                this.worker.kill();
            } catch(error: any) {
                this.myLog.exception('runOnce', error);
            }
            process.exit(1);
        }
    }

    private startChild(): void{
        try {
            if (this.state != WorkerState.STOPPED) {
                this.myLog.info('runOnce', 'startChild with state != STOPPED, state = ' + this.state.toString());
                return;
            }
            this.myLog.debug('runOnce', 'startChild: ' + __dirname + "/" + this.filename);

            this.startJobDate = new Date().getTime();
            this.myLog.debug('runOnce', 'forking' + __dirname + "/" + this.filename);
            this.worker = fork(__dirname + "/" + this.filename);
            this.myLog.debug('runOnce', 'child pid: ' + this.worker.pid);
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
        this.restartLock.release();
    }

    private initializeWorker(myChild: ChildProcess) {
        myChild.on('message',async (dataReturnedMsg: MsgFormatOut) => {
            this.myLog.debug(
                'runOnce', this.taskName + ' ' +
                'status: ' + dataReturnedMsg.status.toString() +
                ', message received: ' + JSON.stringify(dataReturnedMsg.data) +
                ', time: ' + (new Date().getTime() - this.startJobDate) + 'ms'
            );
            if (this.myTimeOutTimer != undefined) {
                clearTimeout(this.myTimeOutTimer);
                this.myTimeOutTimer = undefined;
            }
            // callback
            if (this.callBackInProcess != undefined) {
                 try {
                    this.myLog.debug('runOnce', this.taskName + ' ' + 'cb called: ' + (new Date().getTime() - this.startJobDate) + 'ms');
                    this.callBackInProcess(dataReturnedMsg.status, dataReturnedMsg.data, this.dataInProcess);
                } catch (error: any) {
                    this.myLog.exception('runOnce-callback', error);
                }
            }
            // free resources
            this.callBackInProcess = undefined;
            this.dataInProcess = undefined;
            this.nbRetries = 0;
            this.state = WorkerState.AVAILABLE;
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
            this.state = WorkerState.STOPPED;
            if (this.bStayOnline){
                this.startChild();
            }
        });
    }

    private checkQueue() {
        if (this.state != WorkerState.AVAILABLE) {
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

            this.state = WorkerState.RUNNING;
            var objToLaunch = this.objectsQueue.shift() as any;
            this.dataInProcess= objToLaunch.data;
            this.callBackInProcess = objToLaunch.callback;
            this.myLog.debug('runOnce', `job starting with ${JSON.stringify(this.dataInProcess)}`);

            const jobRequest: MsgFormatIn = {
                'shutdown': false,
                'data': objToLaunch.data
            };
            this.worker.send(jobRequest);
            this.myLog.debug('runOnce', `message sent to job`);
        }
        catch (error: any) {
            this.myLog.exception('runOnce', error);
            this.stopChild().then(() => {
                process.exit(1);
            }).catch((error) => {
                this.myLog.exception('runOnce', error);
                process.exit(1);
            });
        }
    }

    public addJob(obj: object, callBack: (Function|undefined) = undefined) {
        this.myLog.debug('runOnce', `addJob: ${JSON.stringify(obj)}`);
        this.objectsQueue.push({'data': obj, 'callback': callBack});
        this.checkQueue();
    }
}
