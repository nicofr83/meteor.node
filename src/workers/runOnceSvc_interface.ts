// worker.ts
import {LogType} from '../tools/enums.js';

export interface DataFormatIn {
}
export interface DataFormatOut {

}
export interface LogMessage extends DataFormatOut {
    type: LogType.INFO;
    message: string;
}
export interface LogDebug extends DataFormatOut{
    type: LogType.DEBUG;
    message: string;
    params: object|undefined;
}
export interface LogError extends DataFormatOut{
    type: LogType.ERROR
    message: string;
    stackLine: string;
}
export interface LogException extends DataFormatOut{
    type: LogType.EXCEPTION
    message: string;
    stack: string[];
}

export type LogData = LogMessage | LogDebug | LogError | LogException;

export interface MsgFormatIn {
    shutdown: boolean;
    data: DataFormatIn | undefined;
}
export interface MsgFormatOut {
    status: boolean;
    source: string;
    message: object | undefined;
    logMessage: LogData|undefined;
    data: DataFormatOut | undefined;
}

export interface RunOnceSvcInt {
    runMe(data: object): Promise<object|undefined>;
    log(type: LogType, message: string): void;
}
