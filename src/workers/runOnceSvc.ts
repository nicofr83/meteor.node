import { RunOnceSvcInt, MsgFormatIn, MsgFormatOut} from './runOnceSvc_interface.js';
import { LogType } from '../tools/enums.js';
import dotenv from "dotenv"
import {Container} from 'typedi';
import { Log } from '../tools/log.js';

export abstract class RunOnceSvc implements RunOnceSvcInt {
    public name: string = 'RunOnceSvc';
    private startDate: number = new Date().getTime();
    protected myLog = Container.get(Log);

    constructor() {
        // dotenv.config({path: './config/.env.local'});
        process.on('message', async (msgIn: MsgFormatIn) => {
            this.myLog.debug('runOnceSvc', '   -> ' + this.name + ': message received:' + (new Date().getTime() - this.startDate) + 'ms');
            if (process.env.DEBUG) {
                this.myLog.debug('runOnceSvc', JSON.stringify(msgIn));
            }
            if (msgIn.shutdown) {
                process.exit(1);
            }
            if (msgIn.hasOwnProperty('data') && (msgIn.data as any).hasOwnProperty('setName')) {
                this.name = (msgIn.data as any).setName;
                return;
            }
            await this.performTask(msgIn);
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

    public async performTask(data: MsgFormatIn): Promise<void> {
        if (data == undefined) {
            return;
        }
        const msgBack = {
            'status': true,
            'source': this.name,
            'data': undefined,
            'logMessage': undefined
        } as MsgFormatOut;
    
        try {
            this.startDate = new Date().getTime();
            // console.log('   -> ' + this.name + ': Perform called, date reseted:');
            msgBack.data = await this.runMe(data.data);    
            (process as any).send(msgBack);    
            // console.log('   -> ' + this.name + ': message processed:' + (new Date().getTime() - this.startDate) + 'ms');

        }
        catch (error: any) {
            msgBack.status = false;
            msgBack.data = error.message;
            (process as any).send(msgBack);
        } 
    }
    public async runMe(data: any): Promise<object|undefined> {
        throw new Error('Method not implemented.');
    }
}
