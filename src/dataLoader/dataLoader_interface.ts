export interface DumpArchive {
    [key: string]: any;
    date_local: Date;
    date_utc: Date;
    poste_id: number;
    interval: number;
    barometer: number|undefined;
    pressure: number|undefined;
    in_temp: number|undefined;
    out_temp: number|undefined;
    dewpoint: number|undefined;
    etp: number|undefined;
    heatindex: number|undefined;
    extra_temp1: number|undefined;
    extra_temp2: number|undefined;
    extra_temp3: number|undefined;
    hail: number|undefined;
    in_humidity: number|undefined;
    out_humidity: number|undefined;
    extra_humid1: number|undefined;
    extra_humid2: number|undefined;
    leaf_temp1: number|undefined;
    leaf_temp2: number|undefined;
    leaf_wet1: number|undefined;
    leaf_wet2: number|undefined;
    radiation: number|undefined;
    uv: number|undefined;
    rain: number|undefined;
    rain_rate: number|undefined;
    rx: number|undefined;
    soil_moist1: number|undefined;
    soil_moist2: number|undefined;
    soil_moist3: number|undefined;
    soil_moist4: number|undefined;
    soil_temp1: number|undefined;
    soil_temp2: number|undefined;
    soil_temp3: number|undefined;
    soil_temp4: number|undefined;
    voltage: number|undefined;
    wind: number|undefined;
    wind_gust: number|undefined;
    windchill: number|undefined;
}
export interface DumpRecords {
    [key: string]: any;
    date_local: Date;
    mid: bigint;
    min: number|undefined;
    mintime: Date|undefined;
    max: number|undefined;
    maxtime: Date|undefined;
    max_dir: number|undefined;
}
export interface DumpArray {
    archive: DumpArchive[];
    records: DumpRecords[];
}

export interface DataLoader_INT {
    flushObs(client: any, data: DumpArchive[]): Promise<void>;
    flushRecords(client: any, data: DumpRecords[]): Promise<void>;
}
