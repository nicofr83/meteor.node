import { DataStations, DataOneStation, DataJson, dataJsonKeys } from '../../dataLoader/dataLoader_interface'

interface UpdateItem {
    [key: string]: any;
    'k': string,
    'v': any,
}

export function checkJson(dataStations: DataStations, filename: string): string | null {
    var meteor = '';
    var ret: string | null;
    try {
        for (const dataOneStation of dataStations) {
            _checkMeteor(meteor, dataOneStation);
            meteor = dataOneStation.meteor;

            _checkInfo(meteor, dataOneStation);
            
            for (const aMesure of dataOneStation.data) {
                _checkJsonOneMesure(meteor, aMesure);
            }
        }
        return null;
    }
    catch (error: any) {
        throw new Error(`Error in file: ${filename}, Error: ${error.message}`);
    }
}

function _checkMeteor(meteor: string, dataOneStation: DataOneStation): void {
    if (dataOneStation.meteor === undefined) {
        throw new Error("meteor is undefined");
    }
    if (meteor != "" && meteor !== dataOneStation.meteor) {
        throw new Error(`meteor is different: ${meteor}/${dataOneStation.meteor}`);
    }
}

function _checkInfo(meteor: string, dataOneStation: DataOneStation): void {
    if (dataOneStation.info === undefined) {
        throw new Error("info is empty");
    }
    if (dataOneStation.info.version === undefined) {
        throw new Error("version is empty");
    }
    if (dataOneStation.info.json_type === undefined) {
        throw new Error("json_type is empty");
    }
    if (dataOneStation.info.version !== 1 && dataOneStation.info.version !== 2) {
        throw new Error(`unsupported version number: ${dataOneStation.info.version}`);
    }
    if (dataOneStation.info.json_type !== "O" && dataOneStation.info.json_type !== "C") {
        throw new Error(`invalid json_type: ${dataOneStation.info.json_type}`);
    }
}

function _checkJsonOneMesure(meteor: string, dataJson: DataJson): void {
    const valeursToAdd: UpdateItem[] = [];
    const extremes_to_add: UpdateItem[] = [];
    var new_val: UpdateItem;
    var new_val_xtreme: UpdateItem;
    const stop_dat_list: string[] = [];
    var tmpDate: Date;
    var tmpStr: string;


    // check dates
    if (dataJson.stop_dat == undefined) {
        throw new Error("missing stop_dat !");
    }

    const tmp_stop_dat = dataJson["stop_dat"];
    if (stop_dat_list.includes(`${tmp_stop_dat}`)) {
        throw new Error(`stop_dat: ${tmp_stop_dat} present twice`);
    }
    stop_dat_list.push(`${tmp_stop_dat}`);

    if (dataJson.duration == undefined) {
        throw new Error("missing duration");
    }


    // check data, loop for each item
    const dataMesure = dataJson.valeurs;
    if (dataMesure == undefined ) {
        throw new Error("missing valeurs key");
    }

    // loop in all keys
    for (const key in dataMesure) {
        if (dataJsonKeys.indexOf(key) === -1) {
            throw new Error(`key ${key} is unknown`);
        }

            const j_value = dataMesure[key];
        // check obs data
        if (key.endsWith("_max") || key.endsWith("_min")) {
            // add a time entry if not present
            if (!dataMesure.hasOwnProperty(key + "_time")) {
                new_val = {
                    'k': key + "_time",
                    'v': tmp_stop_dat,
                } as UpdateItem;
                valeursToAdd.push(new_val);
            } else {
                tmpStr = dataMesure[key + "_time" as string] as string;
                try {
                    tmpDate = new Date(tmpStr);
                } catch (error) {
                    throw new Error(`Invalid date format for "${key}_time": "${tmpStr}"`);
                }
            }
            if (typeof dataMesure[key] !== "number") {
                throw new Error(`key ${key} should be a number. Current value: ${dataMesure[key]}, type: ${typeof dataMesure[key]}`);
            }
        }

        // change xxx_sum into xxx_s
        if (key.endsWith("_sum")) {
            new_val = {
                'k': key.replace("_sum", "_s"),
                'v': dataMesure[key],
            } as UpdateItem;
            valeursToAdd.push(new_val);
        }

        // change xx_duration into xxx_d
        if (key.endsWith("_duration")) {
            new_val = {
                'k': key.replace("_duration", "_d"),
                'v': dataMesure[key],
            } as UpdateItem;
            valeursToAdd.push(new_val);
            if (typeof dataMesure[key] !== "number") {
                throw new Error(`key ${key} should be a number. Current value: ${dataMesure[key]}, type: ${typeof dataMesure[key]}`);
            }
        }

        // for all json_type
        if (
            key.endsWith("_s") ||
            key.endsWith("_avg") ||
            key.endsWith("_max") ||
            key.endsWith("_min")
        ) {
            if (typeof dataMesure[key] !== "number") {
                throw new Error(`key ${key} should be a number. Current value: ${dataMesure[key]}, type: ${typeof dataMesure[key]}`);
            }
        }

        // check date format
        if (key.endsWith("_time")) {
            tmpStr = dataMesure[key + "_time" as string] as string;
            try {
                tmpDate = new Date(tmpStr);
            } catch (error) {
                throw new Error(`Invalid date format for "${key}_time": "${tmpStr}"`);
            }
        }

        //     // change radiation_max and radiation_max_time into radiation_rate_max and radiation_rate_max_time
        //     if (key.includes("radiation_max_time")) {
        //         new_val = {
        //             'k': "radiation_rate_max_time",
        //             'v': j_value,
        //             'k2': "valeurs",
        //         } as UpdateItem;
        //         valeursToAdd.push(new_val);
        //     } else if (key.includes("radiation_max")) {
        //         new_val = {
        //             'k': "radiation_rate_max",
        //             'v': j_value,
        //             'k2': "valeurs",
        //         } as UpdateItem;
        //         valeursToAdd.push(new_val);
        //     }
        // }


        // extremes check
        // const an_extreme: JsonExtreme | undefined = j["extremes"];
        // if (an_extreme !== undefined) {
        //     if (!an_extreme.hasOwnProperty("level")) {
        //         throw new Error("extreme should have a level key");
        //     }

        //     if (an_extreme["level"] !== "D") {
        //         throw new Error("only level=D supported in this version");
        //     }

        //     for (const key in an_extreme) {
        //         const j_value = an_extreme[key];

        //         // rename _sum into _s
        //         if (key.endsWith("_sum")) {
        //             if (!key.endsWith("_s")) {
        //                 new_val_xtreme = {
        //                     'k': key.replace("_sum", "_s"),
        //                     'v': an_extreme[key],
        //                 } as UpdateItem;
        //                 extremes_to_add.push(new_val_xtreme);
        //             }
        //         }

        //         // a xxx_time is required with xxx_max/xxx_min values
        //         if (key.endsWith("_max") || key.endsWith("_min")) {
        //             if (!an_extreme.hasOwnProperty(key + "_time")) {
        //                 throw new Error(`max/min for ${key} does not have a ${key}_time key`);
        //             }
        //         }

        //         // check number format
        //         if (
        //             key.endsWith("_s") ||
        //             key.endsWith("_avg") ||
        //             key.endsWith("_max") ||
        //             key.endsWith("_min")
        //         ) {
        //             if (typeof dataMesure[key] !== "number") {
        //                 throw new Error(`key ${key} should be a number. Current value: ${dataMesure[key]}, type: ${typeof dataMesure[key]}`);
        //             }
        //         }

        //         // check date format
        //         if (key.endsWith("_time")) {
        //             try {
        //                 str_to_datetime(j_value);
        //             } catch (error) {
        //                 throw new Error(`Invalid date format for "${key}": "${j_value}"`);
        //             }
        //         }
        //     }
        // }

        // 'k': key.replace("_sum", "_s"),
        // 'v': dataMesure[key],
        // 'idx': idx,
        // 'k2': "valeurs",
    }
    // add missing key/value
    for (const my_val of valeursToAdd) {
        dataMesure[my_val['k'] as string] = my_val['v'];
    }

    // for (const my_val of extremes_to_add) {
    //     const my_aggregations = j["extremes"];
    //     my_aggregations[my_val["k"]] = my_val["v"];
    // }

    // check ok
}
