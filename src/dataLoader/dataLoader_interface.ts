export const DumpArchiveIdx = {
    "date_local": 0,
    "date_utc": 1,
    "poste_id": 2,
    "interval": 3,
    "barometer": 4,
    "pressure": 5,
    "in_temp": 6,
    "out_temp": 7,
    "dewpoint": 8,
    "etp": 9,
    "heatindex": 10,
    "extra_temp1": 11,
    "extra_temp2": 12,
    "extra_temp3": 13,
    "hail": 14,
    "in_humidity": 15,
    "out_humidity": 16,
    "extra_humid1": 17,
    "extra_humid2": 18,
    "leaf_temp1": 19,
    "leaf_temp2": 20,
    "leaf_wet1": 21,
    "leaf_wet2": 22,
    "radiation": 23,
    "uv": 24,
    "rain": 25,
    "rain_rate": 26,
    "rx": 27,
    "soil_moist1": 28,
    "soil_moist2": 29,
    "soil_moist3": 30,
    "soil_moist4": 31,
    "soil_temp1": 32,
    "soil_temp2": 33,
    "soil_temp3": 34,
    "soil_temp4": 35,
    "voltage": 36,
    "wind": 37,
    "wind_gust": 38,
    "windchill": 39,
};

export type DumpArchive = Array<any>;

export const DumpRecordsIdx = {
    "DATE_LOCAL": 0,    // Keep a zero value here
    "MID": 1,           // Keep a one value here
    "POSTE_ID": 2,
    "OBS_ID": 3,    
    "QA": 4,
    "MIN": 5,
    "MINTIME": 6,
    "MAX": 7,
    "MAXTIME": 8,
    "MAXDIR": 9,
};

export type DumpRecords = Array<any>;

export interface DumpArray {
    archive: DumpArchive[];
    records: DumpRecords[];
}

export interface DataLoader_INT {
    flushObs(client: any, data: DumpArchive[]): Promise<void>;
    flushRecords(client: any, data: DumpRecords[]): Promise<void>;
}
