import { RunOnceSvcInt, MsgFormatIn, MsgFormatOut, LogException } from './runOnceSvc_interface.js';
import { LogType } from '../tools/enums.js';

export abstract class RunOnceSvc implements RunOnceSvcInt {
    public name: string = 'RunOnceSvc';

    constructor() {
        // process.on('message', (msg: any) => {
        //     console.log('Message from parent:', msg);
        //     console.log("child: NICO :" + process.env.NICO)
        
        //   });
        process.on('message', async (data: MsgFormatIn) => {
            if (process.env.DEBUG) {
                this.log(LogType.DEBUG, 'RunOnceSvc: message received');
            }
            if (data.shutdown) {
                process.exit(1);
            }
            await this.performTask(data);
        });
        process.on('error', (error: Error) => {
            process.exit(1);
        });
        process.on('exit', (code: number) => {
            process.exit(code);
        });
        process.on('uncaughtException', (error: Error) => {
            process.exit(1);
        });

    }
    public log(type: LogType, message: string): void {
        const debugMsg = {
            'status': true,
            'source': this.name,
            'logMessage': {
                'type':type,
                'message': message
            }
        } as MsgFormatOut;

        (process as any).send(debugMsg);
    }
    public async performTask(data: MsgFormatIn): Promise<void> {
        const msgBack = {
            'status': true,
            'source': this.name,
            'message': undefined,
            'logMessage': undefined
        } as MsgFormatOut;
    
        try {
            msgBack.message = await this.runMe(data);
    
            if (process.env.DEBUG) {
                const debugMsg = {
                    'status': true,
                    'source': this.name,
                    'logMessage': {
                        'type': LogType.DEBUG,
                        'message': 'job done: ' + JSON.stringify(msgBack)
                    }
                } as MsgFormatOut;    
                (process as any).send(debugMsg);
            }
            (process as any).send(msgBack);    
        }
        catch (error: any) {
            msgBack.status = false;
            msgBack.message = {
                type: LogType.EXCEPTION,
                message: error.name,
                stack: error.stack.split('\n')
            } as LogException;
            (process as any).send(JSON.stringify(msgBack));
        } 
    }
    public async runMe(data: object): Promise<object|undefined> {
        const myErr = new Error('Method not implemented.');
        const msgBack = {
            'status': false,
            'source': this.name,
            'message': {
                'type': LogType.EXCEPTION,
                'message': myErr.name,
                'stack': myErr.stack?.split('\n')
            } as LogException,
        } as MsgFormatOut;
        (process as any).send(JSON.stringify(msgBack));
        setTimeout(() => {
            process.exit(1);
        }, 200);
        return undefined;
    }
}
