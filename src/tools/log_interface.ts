
export interface LogINT {
    info(source: string, message: string, params?: object, isTest?: boolean): void;
    error(source: string, error: Error, params?: object, isTest?: boolean): void;
    exception(source: string, error: Error, params?: object, isTest?: boolean): void;
}
