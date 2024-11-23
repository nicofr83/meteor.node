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
exports.X_Max = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
const entity_js_1 = require("./entity.js");
let X_Max = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = entity_js_1.Entity;
    var X_Max = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            X_Max = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor(myData = {}) {
            if (JSON.stringify(myData) != '{}') {
                super(myData);
            }
            else {
                super({
                    id: undefined,
                    obs_id: undefined,
                    date_local: undefined,
                    poste: undefined,
                    mesure: undefined,
                    max: undefined,
                    max_time: undefined,
                    max_dir: undefined,
                    qa_max: undefined,
                });
            }
            this.setTableName('x_max');
        }
        static async getOne(pgconn, dbOptions = {}) {
            var my_X_Max = new X_Max();
            const X_MaxData = (await my_X_Max.getOneDBData(pgconn, dbOptions));
            my_X_Max = new X_Max(X_MaxData);
            return my_X_Max;
        }
        static async getAll(pgconn, dbOptions = {}) {
            const all_X_Maxs = [];
            var my_X_Max = new X_Max();
            const allData = await my_X_Max.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_X_Max = new X_Max(a_data);
                all_X_Maxs.push(my_X_Max);
            }
            return all_X_Maxs;
        }
        static async liste(pgconn, dbOptions = {}) {
            const all_X_Maxs = [];
            const my_X_Max = new X_Max();
            var sqlRequest = my_X_Max.buildSelectRequest(dbOptions);
            const instance = typedi_1.Container.get(db_pg_js_1.DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }
        async updateMe(pgconn) {
            if (this.getData().id == undefined) {
                throw new Error('X_Max not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, { 'where': 'id = ' + this.getData().id });
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }
        async deleteMe(pgconn) {
            if (this.getData().id == undefined) {
                throw new Error('X_Max not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, { 'where': 'id = ' + this.getData().id });
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
    };
    return X_Max = _classThis;
})();
exports.X_Max = X_Max;
//# sourceMappingURL=x_max.js.map