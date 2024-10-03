import 'reflect-metadata';
import { Service } from 'typedi';
import { DumpArchive, DumpRecords, DumpArray} from '../dataLoader_interface.js';
import { DataStations, DataOneStation, DataMin, DataMax, JsonLoaderINT } from "./jsonLoader_interface.js";
import { DataLoader } from '../dataLoader.js';

@Service({transient: true})
export class JsonLoader extends DataLoader implements JsonLoaderINT {
    constructor() {
        super();
    }
}
