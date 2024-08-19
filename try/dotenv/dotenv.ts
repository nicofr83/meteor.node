import * as dotenv from "dotenv";

const config_keys = [
    "MY_TEST",
    "MY_TEST2"
]

dotenv.config({"path": "./.env.clever"});

for (let aKey of config_keys)
    if (process.env[aKey] != undefined && process.env[aKey][0] == "$")
        process.env[aKey] = process.env[(process.env[aKey] as string)?.replace('$','')];

for (let aKey of config_keys)
    console.log(aKey + ' => ' + process.env[aKey]);

