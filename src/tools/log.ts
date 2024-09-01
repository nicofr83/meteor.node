import 'reflect-metadata';
import { Service } from 'typedi';
import {LogINT} from './log_interface.js'
import {LogType} from './enums.js';

// @Service({ transient: true })
@Service()
export class Log implements LogINT {
    public printLog(type: LogType, source: string, message: string, params?: object, btest: boolean = false): any{
        if (btest) {
            return {
                'date': new Date(),
                'source': source,
                'message': message,
                'params': params
            }
        }
        console.log(`${type}: ${new Date()} ${source}, ${message}, ${JSON.stringify(params)}`);
    }
    public info(source: string, message: string, params?: object, btest: boolean = false): any{
        return this.printLog(LogType.INFO, source, message, params, btest);
    }
    public debug(source: string, message: string, params?: object, btest: boolean = false): any{
        if (process.env.DEBUG === 'true') {
            return this.printLog(LogType.DEBUG, source, message, params, btest);
        }
    }
    public error(source: string, error: Error, params?: object, btest: boolean = false): any{
        const stackLine = (error.stack == undefined)? '' : (error.stack as any).split('\n')[1];
        return this.printLog(LogType.ERROR, source, stackLine, params, btest);
    }
    public exception(source: string, error: Error, params?: object, btest: boolean = false): any{
        return this.printLog(LogType.EXCEPTION, source, error.stack == undefined?'': error.stack, params, btest);
    }
}
