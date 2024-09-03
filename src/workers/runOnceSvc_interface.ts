// worker.ts
import {LogType} from '../tools/enums.js';


export interface LogMessage {
    type: LogType.INFO;
    message: string;
}
export interface LogDebug {
    type: LogType.DEBUG;
    message: string;
    params: object|undefined;
}
export interface LogError {
    type: LogType.ERROR
    message: string;
    stackLine: string;
}
export interface LogException {
    type: LogType.EXCEPTION
    message: string;
    stack: string;
}

export type LogData = LogMessage | LogDebug | LogError | LogException;

export interface MsgFormatIn {
    shutdown: boolean;
    longlife: boolean;
    data: object | undefined;
}
export interface MsgFormatOut {
    status: boolean;
    source: string;
    logMessage: LogData | undefined;
    data: object | undefined;
}

export interface RunOnceSvcInt {
    runMe(data: any): Promise<object|undefined>;
    log(type: LogType, message: string): void;
}
