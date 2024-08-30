// worker.ts

export interface RunOnceSvcInt {
    performTask(data: object): Promise<void>;
    runMe(data: object): object|undefined;
}
