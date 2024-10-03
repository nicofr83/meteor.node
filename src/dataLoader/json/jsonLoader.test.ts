import 'reflect-metadata';
import { Service } from 'typedi';
import { DumpArchive, DumpRecords, DumpArray} from '../dataLoader_interface.js';
import { DataStations, DataOneStation, DataMin, DataMax } from "./jsonLoader_interface.js";

@Service({transient: true})
export class JsonLoader{
    constructor() {

    }
}
