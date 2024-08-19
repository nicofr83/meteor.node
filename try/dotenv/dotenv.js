"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var config_keys = [
    "MY_TEST",
    "MY_TEST2"
];
dotenv.config({ "path": "./.env.clever" });
for (var _i = 0, config_keys_1 = config_keys; _i < config_keys_1.length; _i++) {
    var aKey = config_keys_1[_i];
    if (process.env[aKey] != undefined && process.env[aKey][0] == "$")
        process.env[aKey] = process.env[(_a = process.env[aKey]) === null || _a === void 0 ? void 0 : _a.replace('$', '')];
}
for (var _b = 0, config_keys_2 = config_keys; _b < config_keys_2.length; _b++) {
    var aKey = config_keys_2[_b];
    console.log(aKey + ' => ' + process.env[aKey]);
}
