import 'reflect-metadata';
import {Container, Service} from 'typedi';
import { DataStations } from "../../dataLoader/json/jsonLoader_interface";
import { Log } from '../../tools/log.js';
import { JsonLoader } from '../../dataLoader/json/jsonLoader.js';
import fs from "fs";
import { checkJson } from './jsonValidator';

@Service({transient: true})
export class JsonLoaderWorker{
    private myLog: Log;
    private dataSations: DataStations;
    private jsonLoader: JsonLoader;

    constructor() {
        this.myLog = Container.get(Log);
        this.jsonLoader = Container.get(JsonLoader);
        this.dataSations = [];
    }
    public async  processFile(filename: string): Promise<void>{
        this.myLog.info('jsonLoader', `processFile: ${filename}`);
        // this.dataLoader.load(this.dataSations);
    }

    public async loadJsonFile(filename: string): Promise<any> {
        fs.readFile(filename, 'utf-8', (err, fileData) => {
            if (err) {
                this.myLog.error('jsonLoader', err);
                throw new Error(`error reading file: ${filename}`);
            }
            this.dataSations = JSON.parse(fileData) as DataStations;
            checkJson(this.dataSations, filename);
            this.myLog.debug('jsonLoader', `data loaded from: ${filename}`);
            return this.dataSations;
        });
    }
}
