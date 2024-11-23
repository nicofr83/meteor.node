"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Obs = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
const entity_js_1 = require("./entity.js");
const mesure_meteor_js_1 = require("../metier/mesure_meteor.js");
// import {Code_QA} from '../tools/enums';
let Obs = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = entity_js_1.Entity;
    var Obs = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Obs = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        mAll = [];
        constructor(myData = {}) {
            if (JSON.stringify(myData) != '{}') {
                super(myData);
            }
            else {
                super({
                    id: undefined,
                    date_local: undefined,
                    date_utc: undefined,
                    Obs: undefined,
                    duration: undefined,
                    barometer: undefined,
                    pressure: undefined,
                    in_temp: undefined,
                    out_temp: undefined,
                    dewpoint: undefined,
                    etp: undefined,
                    heatindex: undefined,
                    extra_temp1: undefined,
                    extra_temp2: undefined,
                    extra_temp3: undefined,
                    in_humidity: undefined,
                    out_humidity: undefined,
                    extra_humid1: undefined,
                    extra_humid2: undefined,
                    leaf_temp1: undefined,
                    leaf_temp2: undefined,
                    leaf_wet1: undefined,
                    leaf_wet2: undefined,
                    radiation: undefined,
                    radiation_rate: undefined,
                    uv: undefined,
                    rain: undefined,
                    rain_utc: undefined,
                    rain_rate: undefined,
                    rx: undefined,
                    soil_moist1: undefined,
                    soil_moist2: undefined,
                    soil_moist3: undefined,
                    soil_moist4: undefined,
                    soil_temp1: undefined,
                    soil_temp2: undefined,
                    soil_temp3: undefined,
                    soil_temp4: undefined,
                    voltage: undefined,
                    wind_dir: undefined,
                    wind: undefined,
                    wind_gust_dir: undefined,
                    wind_gust: undefined,
                    wind10: undefined,
                    wind10_dir: undefined,
                    windchill: undefined,
                    hail: undefined,
                    zone_1: undefined,
                    zone_2: undefined,
                    zone_3: undefined,
                    zone_4: undefined,
                    zone_5: undefined,
                    zone_6: undefined,
                    zone_7: undefined,
                    zone_8: undefined,
                    zone_9: undefined,
                    zone_10: undefined,
                    j: undefined,
                    qa_all: undefined,
                    qa_details: undefined,
                    qa_modifications: undefined,
                });
            }
            this.setTableName('obs');
        }
        static async getOne(pgconn, dbOptions = {}) {
            var my_Obs = new Obs();
            const ObsData = (await my_Obs.getOneDBData(pgconn, dbOptions));
            my_Obs = new Obs(ObsData);
            return my_Obs;
        }
        static async getAll(pgconn, dbOptions = {}) {
            const all_Obss = [];
            var my_Obs = new Obs();
            const allData = await my_Obs.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_Obs = new Obs(a_data);
                all_Obss.push(my_Obs);
            }
            return all_Obss;
        }
        static async liste(pgconn, dbOptions = {}) {
            const all_Obss = [];
            const my_Obs = new Obs();
            var sqlRequest = my_Obs.buildSelectRequest(dbOptions);
            const instance = typedi_1.Container.get(db_pg_js_1.DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }
        async getInsertBulkSQL() {
            if (this.mAll.length == 0) {
                this.mAll = await typedi_1.Container.get(mesure_meteor_js_1.MesureMeteor).getListe();
            }
            const sqlBulk = { sql: 'insert into ' + this.getTableName() + '(date_local, date_utc, poste_id, duration, ', nbFields: 4 };
            for (var aMesure of this.mAll) {
                if (aMesure.archive_col == undefined) {
                    continue;
                }
                sqlBulk.sql += aMesure.json_input + ', ';
                sqlBulk.nbFields++;
            }
            sqlBulk.sql = sqlBulk.sql.substring(0, sqlBulk.sql.length - 2);
            sqlBulk.sql += ') ';
            return sqlBulk;
        }
        async updateMe(pgconn) {
            if (this.getData().id == undefined) {
                throw new Error('Obs not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, { 'where': 'id = ' + this.getData().id });
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }
        async deleteMe(pgconn) {
            if (this.getData().id == undefined) {
                throw new Error('Obs not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, { 'where': 'id = ' + this.getData().id });
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
    };
    return Obs = _classThis;
})();
exports.Obs = Obs;
//# sourceMappingURL=obs.js.map