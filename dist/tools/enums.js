"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogType = exports.WorkerState = exports.DBLock = exports.LoadType = exports.DataSource = exports.Code_QA = exports.Aggreg_Type = void 0;
var Aggreg_Type;
(function (Aggreg_Type) {
    Aggreg_Type[Aggreg_Type["NONE"] = 0] = "NONE";
    Aggreg_Type[Aggreg_Type["AVG"] = 1] = "AVG";
    Aggreg_Type[Aggreg_Type["SUM"] = 2] = "SUM";
    Aggreg_Type[Aggreg_Type["MAX"] = 3] = "MAX";
    Aggreg_Type[Aggreg_Type["MIN"] = 4] = "MIN";
})(Aggreg_Type || (exports.Aggreg_Type = Aggreg_Type = {}));
var Code_QA;
(function (Code_QA) {
    Code_QA[Code_QA["UNSET"] = 0] = "UNSET";
    Code_QA[Code_QA["VALIDATED"] = 1] = "VALIDATED";
    Code_QA[Code_QA["UNVALIDATED"] = 9] = "UNVALIDATED";
})(Code_QA || (exports.Code_QA = Code_QA = {}));
var DataSource;
(function (DataSource) {
    DataSource[DataSource["NONE"] = 0] = "NONE";
    DataSource[DataSource["METEOR_OI"] = 1] = "METEOR_OI";
    DataSource[DataSource["METEO_FR"] = 2] = "METEO_FR";
    DataSource[DataSource["OVPF"] = 3] = "OVPF";
})(DataSource || (exports.DataSource = DataSource = {}));
var LoadType;
(function (LoadType) {
    LoadType[LoadType["NONE"] = 0] = "NONE";
    LoadType[LoadType["LOAD_FROM_DUMP"] = 1] = "LOAD_FROM_DUMP";
    LoadType[LoadType["LOAD_FROM_JSON"] = 2] = "LOAD_FROM_JSON";
    LoadType[LoadType["LOAD_FROM_DUMP_THEN_JSON"] = 3] = "LOAD_FROM_DUMP_THEN_JSON";
    LoadType[LoadType["LOAD_CSV_FOR_METEOFR"] = 4] = "LOAD_CSV_FOR_METEOFR";
    LoadType[LoadType["LOAD_CSV_FOR_OVPF"] = 8] = "LOAD_CSV_FOR_OVPF";
})(LoadType || (exports.LoadType = LoadType = {}));
var DBLock;
(function (DBLock) {
    DBLock[DBLock["NONE"] = 1] = "NONE";
    DBLock[DBLock["UPDATE"] = 2] = "UPDATE";
    DBLock[DBLock["SKIPLOCKED"] = 3] = "SKIPLOCKED";
    DBLock[DBLock["SHARE"] = 4] = "SHARE"; // for Share
})(DBLock || (exports.DBLock = DBLock = {}));
var WorkerState;
(function (WorkerState) {
    WorkerState[WorkerState["AVAILABLE"] = 0] = "AVAILABLE";
    WorkerState[WorkerState["RUNNING"] = 1] = "RUNNING";
    WorkerState[WorkerState["STOPPING"] = 2] = "STOPPING";
    WorkerState[WorkerState["STOPPED"] = 3] = "STOPPED";
    WorkerState[WorkerState["RESTARING"] = 4] = "RESTARING";
})(WorkerState || (exports.WorkerState = WorkerState = {}));
var LogType;
(function (LogType) {
    LogType["INFO"] = "INFO";
    LogType["DEBUG"] = "DEBUG";
    LogType["ERROR"] = "ERROR";
    LogType["EXCEPTION"] = "EXCEPTION";
})(LogType || (exports.LogType = LogType = {}));
//# sourceMappingURL=enums.js.map