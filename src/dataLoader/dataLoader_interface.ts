
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
        [key: string]: string|Date|number|undefined;
        barometer: number|undefined;
        barometer_avg: number|undefined;
        barometer_max_time: string|Date|undefined;
        barometer_max: number|undefined;
        barometer_min_time: string|Date|undefined;
        barometer_min: number|undefined;

        dewpoint: number|undefined;
        dewpoint_avg: number|undefined;
        dewpoint_max_time: string|Date|undefined;
        dewpoint_max: number|undefined;
        dewpoint_min_time: string|Date|undefined;
        dewpoint_min: number|undefined;

        etp: number|undefined;

        // ?? extrahumid1
        extra_humid1: number|undefined;
        extra_humid1_avg: number|undefined;
        extra_humid1_max_time: string|Date|undefined;
        extra_humid1_max: number|undefined;
        extra_humid1_min_time: string|Date|undefined;
        extra_humid1_min: number|undefined;

        extra_humid2: number|undefined;
        extra_humid2_avg: number|undefined;
        extra_humid2_max_time: string|Date|undefined;
        extra_humid2_max: number|undefined;
        extra_humid2_min_time: string|Date|undefined;
        extra_humid2_min: number|undefined;

        // ?? extratemp
        extra_temp1: number|undefined;
        extra_temp1_avg: number|undefined;

        extra_temp2: number|undefined;
        extra_temp2_avg: number|undefined;

        extra_temp3: number|undefined;
        extra_temp3_avg: number|undefined;

        // ?? hail_sum or hail_s
        hail: number|undefined;
        hail_sum: number|undefined;

        heatindex: number|undefined;
        heatindex_avg: number|undefined;
        heatindex_max_time: string|Date|undefined;
        heatindex_max: number|undefined;

        // ?? out_humidity
        humidity: number|undefined;
        humidity_avg: number|undefined;
        humidity_max_time: string|Date|undefined;
        humidity_max: number|undefined;
        humidity_min_time: string|Date|undefined;
        humidity_min: number|undefined;

        in_humidity: number|undefined;
        in_humidity_avg: number|undefined;
        in_humidity_max_time: string|Date|undefined;
        in_humidity_max: number|undefined;
        in_humidity_min_time: string|Date|undefined;
        in_humidity_min: number|undefined;

        in_temp: number|undefined;
        in_temp_avg: number|undefined;
        in_temp_max_time: string|Date|undefined;
        in_temp_max: number|undefined;
        in_temp_min_time: string|Date|undefined;
        in_temp_min: number|undefined;

        // ?? leaftemp1
        leaf_temp1: number|undefined;
        leaf_temp1_avg: number|undefined;

        // ?? leaftemp2
        leaf_temp2: number|undefined;
        leaf_temp2_avg: number|undefined;

        // ?? leafwet1
        leaf_wet1: number|undefined;
        leaf_wet1_avg: number|undefined;

        // ?? leafwet2
        leaf_wet2: number|undefined;
        leaf_wet2_avg: number|undefined;

        out_temp: number|undefined;
        out_temp_avg: number|undefined;
        out_temp_max_time: string|Date|undefined;
        out_temp_max: number|undefined;
        out_temp_min_time: string|Date|undefined;
        out_temp_min: number|undefined;
        
        pressure: number|undefined;
        pressure_avg: number|undefined;
        pressure_max_time: string|Date|undefined;
        pressure_max: number|undefined;
        pressure_min_time: string|Date|undefined;
        pressure_min: number|undefined;
        
        radiation: number|undefined;
        radiation_max_time: string|Date|undefined;
        radiation_max: number|undefined;
        radiation_min_time: string|Date|undefined;
        radiation_min: number|undefined;

        // ?? radiation_rate vs radiation... and check in jsonValidator
        // ?? radiation_rate_max
        radiation_rate: number|undefined;
        radiation_rate_avg: number|undefined;
        radiation_rate_max_time: string|Date|undefined;
        radiation_rate_max: number|undefined;

        rain: number|undefined;

        rain_rate_avg: number|undefined;
        rain_rate_max_time: string|Date|undefined;
        rain_rate_max: number|undefined;

        rain_utc: number|undefined;

        rx: number|undefined;

        // ?? soil_moist1
        // ?? soilmoist1
        soil_moist1: number|undefined;
        soil_moist1_avg: number|undefined;

        // ?? soil_moist2
        soil_moist2: number|undefined;
        soil_moist2_avg: number|undefined;

        // ?? soil_moist3
        soil_moist3: number|undefined;
        soil_moist3_avg: number|undefined;

        // ?? soil_moist4
        soil_moist4: number|undefined;
        soil_moist4_avg: number|undefined;

        // ?? soiltemp1
        soil_temp1: number|undefined;
        soil_temp1_avg: number|undefined;
        soil_temp1_min_time: string|Date|undefined;
        soil_temp1_min: number|undefined;

        // ?? soiltemp2
        soil_temp2: number|undefined;
        soil_temp2_avg: number|undefined;
        soil_temp2_min_time: string|Date|undefined;
        soil_temp2_min: number|undefined;

        // ?? soiltemp3
        soil_temp3: number|undefined;
        soil_temp3_avg: number|undefined;
        soil_temp3_min_time: string|Date|undefined;
        soil_temp3_min: number|undefined;

        // ?? soiltemp4
        soil_temp4: number|undefined;
        soil_temp4_avg: number|undefined;
        soil_temp4_min_time: string|Date|undefined;
        soil_temp4_min: number|undefined;

        // ?? uv
        uv_indice: number|undefined;
        uv_indice_avg: number|undefined;
        uv_indice_max_time: string|Date|undefined;
        uv_indice_max: number|undefined;

        voltage: number|undefined;
        voltage_avg: number|undefined;
        voltage_min_time: string|Date|undefined;
        voltage_min: number|undefined;

        // ?? gust/gust_dir
        wind: number|undefined;
        wind_avg: number|undefined;
        wind_dir: number|undefined;
        wind_max: number|undefined;
        wind_max_dir: number|undefined;
        wind_max_time: string|Date|undefined;

        wind10: number|undefined;
        wind10_avg: number|undefined;

        windchill: number|undefined;
        windchill_avg: number|undefined;
        windchill_min_time: string|Date|undefined;
        windchill_min: number|undefined;

        end_valeurs: number|undefined;
    };
}
export const dataJsonKeys = [
    "barometer", "barometer_avg", "barometer_max_time", "barometer_max", "barometer_min_time", "barometer_min",
    "dewpoint", "dewpoint_avg", "dewpoint_max_time", "dewpoint_max", "dewpoint_min_time", "dewpoint_min",
    "etp",
    "extra_humid1", "extra_humid1_avg", "extra_humid1_max_time", "extra_humid1_max", "extra_humid1_min_time", "extra_humid1_min",
    "extra_humid2", "extra_humid2_avg", "extra_humid2_max_time", "extra_humid2_max", "extra_humid2_min_time", "extra_humid2_min",
    "extra_temp1", "extra_temp1_avg",
    "extra_temp2", "extra_temp2_avg",
    "extra_temp3", "extra_temp3_avg",
    "hail", "hail_sum",
    "heatindex", "heatindex_avg", "heatindex_max_time", "heatindex_max",
    "humidity", "humidity_avg", "humidity_max_time", "humidity_max", "humidity_min_time", "humidity_min",
    "in_humidity", "in_humidity_avg", "in_humidity_max_time", "in_humidity_max", "in_humidity_min_time", "in_humidity_min",
    "in_temp", "in_temp_avg", "in_temp_max_time", "in_temp_max", "in_temp_min_time", "in_temp_min",
    "leaf_temp1", "leaf_temp1_avg",
    "leaf_temp2", "leaf_temp2_avg",
    "leaf_wet1", "leaf_wet1_avg",
    "leaf_wet2", "leaf_wet2_avg",
    "out_temp", "out_temp_avg", "out_temp_max_time", "out_temp_max", "out_temp_min_time", "out_temp_min",
    "pressure", "pressure_avg", "pressure_max_time", "pressure_max", "pressure_min_time", "pressure_min",
    "radiation", "radiation_max_time", "radiation_max", "radiation_min_time", "radiation_min",
    "radiation_rate", "radiation_rate_avg", "radiation_rate_max_time", "radiation_rate_max",
    "rain",
    "rain_rate_avg", "rain_rate_max_time", "rain_rate_max",
    "rain_utc",
    "rx",
    "soil_moist1", "soil_moist1_avg",
    "soil_moist2", "soil_moist2_avg",
    "soil_moist3", "soil_moist3_avg",
    "soil_moist4", "soil_moist4_avg",
    "soil_temp1", "soil_temp1_avg", "soil_temp1_min_time", "soil_temp1_min",
    "soil_temp2", "soil_temp2_avg", "soil_temp2_min_time", "soil_temp2_min",
    "soil_temp3", "soil_temp3_avg", "soil_temp3_min_time", "soil_temp3_min",
    "soil_temp4", "soil_temp4_avg", "soil_temp4_min_time", "soil_temp4_min",
    "uv_indice", "uv_indice_avg", "uv_indice_max_time", "uv_indice_max",
    "voltage", "voltage_avg", "voltage_min_time", "voltage_min",
    "wind", "wind_avg", "wind_dir", "wind_max", "wind_max_dir", "wind_max_time",
    "wind10", "wind10_avg",
    "windchill", "windchill_avg", "windchill_min_time", "windchill_min",
    "end_valeurs",
];

export interface DataOneStation {
    meteor: string;
    info: DataInfo;
    data: Array<DataJson>;
    // ?? no more extremes key
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
