
export interface DataInfo {
    version: number|undefined;
    json_type: string|undefined;
    title: string|undefined;
    hardware: string|undefined;
    weewxVersion: string|undefined;
    time: string|undefined;
    uptime: string|undefined;
    last_update: string|undefined;
    last_update_before_stop: string|undefined;
}
export interface DataJson {
    stop_dat: Date;
    duration: number;
    valeurs: {
        out_temp: number|undefined;
        out_temp_avg: number|undefined;
        out_temp_min: number|undefined;
        out_temp_min_time: string|Date|undefined;
        out_temp_max: number|undefined;
        out_temp_max_time: string|Date|undefined;

        windchill: number|undefined;
        windchill_avg: number|undefined;
        windchill_min: number|undefined;
        windchill_min_time: string|Date|undefined;

        heatindex: number|undefined;
        heatindex_max: number|undefined;
        heatindex_max_time: string|Date|undefined;
        heatindex_avg: number|undefined;

        dewpoint: number|undefined;
        dewpoint_avg: number|undefined;
        dewpoint_min: number|undefined;
        dewpoint_min_time: string|Date|undefined;
        dewpoint_max: number|undefined;
        dewpoint_max_time: string|Date|undefined;

        humidity: number|undefined;
        humidity_avg: number|undefined;
        humidity_min: number|undefined;
        humidity_min_time: string|Date|undefined;
        humidity_max: number|undefined;
        humidity_max_time: string|Date|undefined;

        barometer: number|undefined;
        barometer_avg: number|undefined;
        barometer_min: number|undefined;
        barometer_min_time: string|Date|undefined;
        barometer_max: number|undefined;
        barometer_max_time: string|Date|undefined;

        pressure: number|undefined;
        pressure_avg: number|undefined;
        pressure_min: number|undefined;
        pressure_min_time: string|Date|undefined;
        pressure_max: number|undefined;
        pressure_max_time: string|Date|undefined;

        wind_avg: number|undefined;
        wind_dir: number|undefined;
        wind_max: number|undefined;
        wind_max_dir: number|undefined;
        wind_max_time: string|Date|undefined;

        wind10_avg: number|undefined;

        rain: number|undefined;
        rain_rate_max: number|undefined;
        rain_rate_max_time: string|Date|undefined;
        rain_rate_avg: number|undefined;

        uv_indice: number|undefined;
        uv_indice_avg: number|undefined;
        uv_indice_max: number|undefined;
        uv_indice_max_time: string|Date|undefined;

        radiation: number|undefined;
        radiation_min: number|undefined;
        radiation_min_time: string|Date|undefined;
        radiation_max: number|undefined;
        radiation_max_time: string|Date|undefined;

        in_temp: number|undefined;
        in_temp_avg: number|undefined;
        in_temp_min: number|undefined;
        in_temp_min_time: string|Date|undefined;
        in_temp_max: number|undefined;
        in_temp_max_time: string|Date|undefined;

        in_humidity: number|undefined;
        in_humidity_avg: number|undefined;
        in_humidity_max: number|undefined;
        in_humidity_max_time: string|Date|undefined;
        in_humidity_min: number|undefined;
        in_humidity_min_time: string|Date|undefined;

        rx: number|undefined;

        voltage: number|undefined;
        voltage_avg: number|undefined;
        voltage_min: number|undefined;
        voltage_min_time: string|Date|undefined;

        end_valeurs: number|undefined;
    };
}

export interface DataOneStation {
    meteor: string;
    info: DataInfo;
    data: DataJson[];
}

export type DataStations = DataOneStation[];

export interface DataMin {
    obs_id: number|undefined;
    date_local: string|Date|undefined;
    poste_id: number|undefined;
    mesure_id: number|undefined;
    min: number|undefined;
    min_time: string|Date|undefined;
    qa_min: number|undefined;
}

export interface DataMax {
    obs_id: number|undefined;
    date_local: string|Date|undefined;
    poste_id: number|undefined;
    mesure_id: number|undefined;
    max: number|undefined;
    max_time: string|Date|undefined;
    qa_max: number|undefined;
    max_dir: number|undefined;
}

export interface JsonLoaderINT {
    load(data: DataStations|DataOneStation, dataMin: Array<DataMin>, dataMax: Array<DataMax>): Promise<void>;
}
