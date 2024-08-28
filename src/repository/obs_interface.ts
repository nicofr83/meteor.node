

import { Entity_Herited_INT, EntityData } from './entity_interface';
export type Entity_Child_INT = Entity_Herited_INT;

export interface ObsData extends EntityData{
    date_local: Date|undefined;
    date_utc: Date|undefined;
    Obs: number|undefined;
    duration: number|undefined;
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
    in_humidity: number|undefined;
    out_humidity: number|undefined;
    extra_humid1: number|undefined;
    extra_humid2: number|undefined;
    leaf_temp1: number|undefined;
    leaf_temp2: number|undefined;
    leaf_wet1: number|undefined;
    leaf_wet2: number|undefined;
    radiation: number|undefined;
    radiation_rate: number|undefined;
    uv: number|undefined;
    rain: number|undefined;
    rain_utc: number|undefined;
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
    wind_dir: number|undefined;
    wind: number|undefined;
    wind_gust_dir: number|undefined;
    wind_gust: number|undefined;
    wind10: number|undefined;
    wind10_dir: number|undefined;
    windchill: number|undefined;
    
    hail: number|undefined;
    zone_1: number|undefined;
    zone_2: number|undefined;
    zone_3: number|undefined;
    zone_4: number|undefined;
    zone_5: number|undefined;
    zone_6: number|undefined;
    zone_7: number|undefined;
    zone_8: number|undefined;
    zone_9: number|undefined;
    zone_10: number|undefined;
    j: string|undefined;
    qa_all: number|undefined;
    qa_details: string|undefined;
    qa_modifications: number|undefined;
}

export interface Obs_INT extends Entity_Child_INT {

}
