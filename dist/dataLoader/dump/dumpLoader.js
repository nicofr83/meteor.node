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
exports.DumpLoader = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const meteor_date_js_1 = require("../../tools/meteor_date.js");
const db_mysql_js_1 = require("../../tools/db_mysql.js");
const mesure_meteor_js_1 = require("../../metier/mesure_meteor.js");
const dataLoader_js_1 = require("../dataLoader.js");
const dataLoader_interface_js_1 = require("../dataLoader_interface.js");
let DumpLoader = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = dataLoader_js_1.DataLoader;
    var DumpLoader = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DumpLoader = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        meteor;
        curPoste;
        deltaTimezone = 0;
        last_obs_date_utc;
        dbMysql = typedi_1.Container.get(db_mysql_js_1.DB_MYSQL);
        myMesure = typedi_1.Container.get(mesure_meteor_js_1.MesureMeteor);
        // private mAll: MesureItem[] = [];
        constructor() {
            super();
            this.curPoste = undefined;
            this.meteor = undefined;
            if (meteor_date_js_1.meteorDate != true) {
                throw new Error('meteorDate is not loaded');
            }
        }
        setStation(meteor, cur_poste) {
            this.meteor = meteor;
            this.curPoste = cur_poste;
            if (this.curPoste === undefined) {
                throw new Error('Station ' + meteor + ' non trouvée');
            }
            this.deltaTimezone = this.curPoste.getData().delta_timezone;
            // last_obs_date_utc est la last_obs_date_local en UTC
            this.last_obs_date_utc = this.curPoste.getData().last_obs_date_local;
            if (this.last_obs_date_utc != undefined) {
                this.last_obs_date_utc = this.last_obs_date_utc.LocalToUtcDate(this.deltaTimezone);
            }
        }
        async archiveDateLimits() {
            if (this.curPoste === undefined) {
                throw new Error('Station name is undefined');
            }
            var myConn = undefined;
            var ret = [];
            try {
                myConn = await this.dbMysql.connect(this.meteor);
                ret = await this.dbMysql.executeSQL(myConn, 'select ' +
                    'true as first_pass, ' +
                    'false as stop, ' +
                    'min(datetime) -1 as min, ' +
                    'min(datetime) -1 as arch_min, ' +
                    'min(from_unixtime(datetime - 1)) as min_dt, ' +
                    'min(from_unixtime(datetime - 1)) as arch_min_dt, ' +
                    'max(datetime) as max, ' +
                    'max(datetime) as arch_max, ' +
                    'max(from_unixtime(datetime)) as max_dt, ' +
                    'max(from_unixtime(datetime)) as arch_max_dt ' +
                    'from archive', []);
            }
            finally {
                if (myConn != undefined) {
                    this.dbMysql.disconnect(myConn);
                    myConn = undefined;
                }
            }
            this.myLog.debug('archiveDateLimits', `global limits: from: ${ret[0].min_dt} to: ${ret[0].max_dt}`);
            return ret[0];
        }
        async getFromDump(limits) {
            var ret = { archive: [], records: [] };
            this.mAll = await this.myMesure.getListe();
            ret.archive = await this.loadArchiveData(this.mAll, limits);
            ret.records = await this.loadRecordsData(this.mAll, limits);
            return ret;
        }
        async getFirstSlot() {
            var dl = await this.archiveDateLimits();
            dl.first_pass == true;
            return this.getNextSlot(dl);
        }
        getNextSlot(prevLimits, nbDays = 30) {
            if (prevLimits.stop) {
                return prevLimits;
            }
            if (prevLimits.first_pass == true) {
                prevLimits.first_pass = false;
                prevLimits.max = prevLimits.min;
                prevLimits.max_dt = prevLimits.min_dt;
                if (this.last_obs_date_utc != undefined) {
                    if (this.last_obs_date_utc > prevLimits.min_dt) {
                        prevLimits.max_dt = this.last_obs_date_utc;
                        prevLimits.max = Math.floor(this.last_obs_date_utc.getTime() / 1000);
                    }
                }
            }
            // set the min as the previous max
            prevLimits.min = prevLimits.max;
            prevLimits.min_dt = prevLimits.max_dt;
            prevLimits.max_dt = prevLimits.max_dt.getNextDate(this.deltaTimezone, nbDays);
            prevLimits.max = Math.floor(prevLimits.max_dt.getTime() / 1000);
            return prevLimits;
        }
        async loadArchiveData(mAll, limits) {
            var archData = [];
            var myConn = undefined;
            const sql_archive = this.loadArchiveSQL(mAll, limits);
            try {
                myConn = await this.dbMysql.connect(this.meteor);
                archData = await this.dbMysql.executeSQL(myConn, sql_archive, [], true);
            }
            finally {
                if (myConn != undefined) {
                    this.dbMysql.disconnect(myConn);
                    myConn = undefined;
                }
            }
            return archData;
        }
        async loadRecordsData(mAll, dateLimits) {
            var recData = [];
            var myConn = undefined;
            try {
                myConn = await this.dbMysql.connect(this.meteor);
                for (const aMesure of mAll) {
                    if (aMesure.archive_table == undefined || (aMesure.min == false && aMesure.max == false)) {
                        continue;
                    }
                    const sql_minmax = this.loadRecordSQL(aMesure, dateLimits);
                    const recMinMax = await this.dbMysql.executeSQL(myConn, sql_minmax, [], true);
                    var recDataTmp = [...recData, ...recMinMax];
                    recData = recDataTmp;
                    recDataTmp = [];
                }
            }
            catch (error) {
                throw new Error('loadRecordsData: ' + error);
            }
            finally {
                if (myConn != undefined) {
                    this.dbMysql.disconnect(myConn);
                    myConn = undefined;
                }
                return recData;
            }
        }
        addMesureValueToRecords(dumpData) {
            const date_local_key = dataLoader_interface_js_1.DumpArchiveIdx.date_local;
            for (const anArchiveData of dumpData.archive) {
                const obs_id = anArchiveData[dataLoader_interface_js_1.DumpArchiveIdx.obs_id];
                for (const aMesure of this.mAll) {
                    if (aMesure.archive_table == undefined || (aMesure.min == false && aMesure.max == false)) {
                        continue;
                    }
                    var json_input_key = aMesure.json_input;
                    const obs_date = new Date(anArchiveData[date_local_key]);
                    const obs_value = anArchiveData[dataLoader_interface_js_1.DumpArchiveIdx[json_input_key]];
                    if ((aMesure.allow_zero == false && obs_value == 0) || obs_value == undefined) {
                        continue;
                    }
                    dumpData.records.push([
                        new Date(obs_date.setHours(0, 0, 0, 0)),
                        Number(aMesure.id),
                        this.curPoste?.getData().id,
                        obs_id,
                        0,
                        aMesure.min == true ? obs_value : undefined,
                        aMesure.min == true ? obs_date : undefined,
                        aMesure.max == true ? obs_value : undefined,
                        aMesure.max == true ? obs_date : undefined,
                        undefined,
                        // (113, 'gust dir',        'wind_gust_dir',   'windGustDir',      'skip',       null,     false,   false,    0,      false,    true,  'wind_max_dir',        '{}'),
                        // (114, 'gust',            'wind_gust',       'windGust',         'wind',       113,      false,   true,     3,       true,    true,      'wind_max',
                    ]);
                }
            }
        }
        loadArchiveSQL(mAll, limits) {
            // we add a column with null value to store obs_id to be used in x_min/x_max tables to link to obs table
            var sql = 'select' +
                ' from_unixtime(datetime + 3600 * ' + this.curPoste.getData().delta_timezone + ') as date_local,' +
                ' from_unixtime(datetime) as date_utc,' +
                ' ' + this.curPoste?.getData().id + ' as poste_id,' +
                ' `interval` as duration, ';
            for (const mItem of mAll) {
                // console.log(mItem.name);
                if (mItem.archive_col != undefined) {
                    sql += `${mItem.archive_col} as ${mItem.json_input}, `;
                }
            }
            sql += `null from archive `;
            sql += `where datetime > ${limits.min} and datetime <= ${limits.max} order by datetime`;
            return sql;
        }
        // select from_unixtime(datetime + 3600 * 4) as date_local, from_unixtime(datetime) as date_utc, 35 as poste_id, `interval` as duration from archive limit 10;
        loadRecordSQL(aMesure, limits) {
            var removeZeroValue = '';
            if (aMesure.allow_zero == false) {
                if (aMesure.min) {
                    removeZeroValue = 'and min != 0 ';
                }
                if (aMesure.max) {
                    removeZeroValue = 'and max != 0 ';
                }
            }
            return 'select DATE_FORMAT(from_unixtime(datetime + 3600 * ' + this.curPoste.getData().delta_timezone + '), \'%Y-%m-%d\') as date_local, ' +
                aMesure.id + ' as mid, ' +
                this.curPoste?.getData().id + ' as pid, ' +
                'null as value, ' +
                '0, ' + // QA.UNSET
                (aMesure.min ? 'min, ' : 'null, ') +
                (aMesure.min ? 'from_unixtime(mintime + 3600 * ' + this.curPoste.getData().delta_timezone + '), ' : 'null, ') +
                (aMesure.max ? 'max, ' : 'null, ') +
                (aMesure.max ? 'from_unixtime(maxtime + 3600 * ' + this.curPoste.getData().delta_timezone + '), ' : 'null, ') +
                (aMesure.is_wind == false ? 'null' : 'max_dir') + ' as max_dir ' +
                'from archive_day_' + aMesure.archive_col + ' ' +
                'where dateTime > ' + limits.min + ' and dateTime <= ' + limits.max + ' ' +
                removeZeroValue +
                'order by date_local';
        }
    };
    return DumpLoader = _classThis;
})();
exports.DumpLoader = DumpLoader;
//# sourceMappingURL=dumpLoader.js.map