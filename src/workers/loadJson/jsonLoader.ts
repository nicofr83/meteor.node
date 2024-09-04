import 'reflect-metadata';
import Container from 'typedi';
import { DataStations, DataOneStation, DataJson, DataMin, DataMax } from "../../dataLoader/dataLoader_interface";
import { Log } from '../../tools/log.js';
import fs from "fs";
import { json } from 'body-parser';

export class JsonLoader{
    private myLog: Log;
    private  dataSations: DataStations;

    constructor() {
        this.myLog = Container.get(Log);
        this.dataSations = [];
    }
    public async  processFile(filename: string): Promise<void>{
        this.myLog.info('jsonLoader', `processFile: ${filename}`);
    }

    public async loadJsonFile(filename: string): Promise<any> {
        fs.readFile(filename, 'utf-8', (err, fileData) => {
            if (err) {
                this.myLog.error('jsonLoader', err);
                throw new Error(`error reading file: ${filename}`);
            }
            this.dataSations = JSON.parse(fileData) as DataStations;
            this.myLog.debug('jsonLoader', `data loaded from: ${filename}`);
            return this.dataSations;
        });
    }
}
const jsonLoader = new JsonLoader();
await jsonLoader.loadJsonFile('/Users/nico/projects/meteor.node/data/json/obs.MTG280.2022-07-10T10-20.json');
console.log('jsonLoader', 'done');
