import { DataStations, DataOneStation, DataMin, DataMax } from "./dataLoader_interface";

class DataLoader{
    constructor() {

    }

    public async load(data: DataStations|DataOneStation, dataMin: Array<DataMin>, dataMax: Array<DataMax>): Promise<void>{

        // Add current values and min/max from data to dataMin/dataMax, and min/max from data

        // Sort dataMin/dataMax by poste_id/date_local/mesure_id

        // keep only 2 records max per date_local

        // insert data/dataMin/dataMax into database

        // commit
    }
}
