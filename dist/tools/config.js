"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
let config_keys = [
    "PG_USER",
    "PG_PASSWORD",
    "PG_HOST",
    "PG_DB",
    "PG_SSL"
];
const config_test_keys = [
    "TEST_VAR1",
    "TEST_VAR2"
];
if (process.env.DOTENV == 'test')
    config_keys = config_test_keys;
if (process.env.DOTENV == undefined)
    dotenv.config({ "path": "config/.env.local" });
else
    dotenv.config({ "path": "config/.env." + process.env.DOTENV });
for (let aKey of config_keys)
    if (process.env[aKey] != undefined && process.env[aKey][0] == "$")
        process.env[aKey] = process.env[process.env[aKey]?.replace('$', '')];
// for (let aKey of config_keys)
//     console.log(aKey + ' => ' + process.env[aKey]);
//# sourceMappingURL=config.js.map