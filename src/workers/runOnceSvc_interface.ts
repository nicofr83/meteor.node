// worker.ts

export interface MsgFormatIn {
    shutdown: boolean;
    data: object | undefined;
}
export interface MsgFormatOut {
    status: boolean;
    source: string;
    data: object | undefined;
}

export interface RunOnceSvcInt {
    runMe(data: any): Promise<object|undefined>;
}
