import 'reflect-metadata';
import Container from 'typedi';
import { Log } from '../../tools/log.js';

export class JsonLoader{
    private myLog: Log;

    constructor() {
        this.myLog = Container.get(Log);
        console.log('**** JsonLoader (forked app) constructor');
    }
    public async  processFile(filename: string): Promise<void>{
        this.myLog.info('jsonLoader', `processFile: ${filename}`);
    }
}
