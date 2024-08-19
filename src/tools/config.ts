import * as dotenv from "dotenv";

let config_keys = [
    "PG_USER",
    "PG_PASSWORD",
    "PG_HOST",
    "PG_DB",
    "PG_SSL"
]

const config_test_keys = [
    "TEST_VAR1",
    "TEST_VAR2"
]
if (process.env.DOTENV == 'test')
    config_keys = config_test_keys;   

if (process.env.DOTENV == undefined)
    dotenv.config({"path": "config/.env.local"});
else
    dotenv.config({"path": "config/.env." + process.env.DOTENV});

for (let aKey of config_keys)
    if (process.env[aKey] != undefined && process.env[aKey][0] == "$")
        process.env[aKey] = process.env[(process.env[aKey] as string)?.replace('$','')];

// for (let aKey of config_keys)
//     console.log(aKey + ' => ' + process.env[aKey]);
