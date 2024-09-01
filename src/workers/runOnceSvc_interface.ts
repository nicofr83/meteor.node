// worker.ts
import {LogType} from '../tools/enums.js';

export interface DataFormatIn {
}
export interface DataFormatOut {

}
export interface LogMessage{
    type: LogType.INFO;
    message: string;
}
export interface LogDebug{
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
    stack: string[];
}

export type LogData = LogMessage | LogDebug | LogError | LogException;

export interface MsgFormatIn {
    status: boolean;
    data: DataFormatIn | undefined;
}
export interface MsgFormatOut {
    status: boolean;
    source: string;
    logMessage: LogData|undefined;
    data: DataFormatOut | undefined;
}

export interface RunOnceSvcInt {
    runMe(data: object): Promise<object|undefined>;
}
