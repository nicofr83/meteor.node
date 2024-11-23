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
exports.Incident = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
const entity_js_1 = require("./entity.js");
let Incident = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = entity_js_1.Entity;
    var Incident = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Incident = _classThis = _classDescriptor.value;
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
                    date_utc: undefined,
                    source: undefined,
                    level: undefined,
                    reason: undefined,
                    details: undefined,
                    active: undefined,
                });
            }
            this.setTableName('incidents');
        }
        static async getOne(pgconn, dbOptions = {}) {
            var my_Incident = new Incident();
            const IncidentData = (await my_Incident.getOneDBData(pgconn, dbOptions));
            my_Incident = new Incident(IncidentData);
            return my_Incident;
        }
        static async getAll(pgconn, dbOptions = {}) {
            const all_Incidents = [];
            var my_Incident = new Incident();
            const allData = await my_Incident.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_Incident = new Incident(a_data);
                all_Incidents.push(my_Incident);
            }
            return all_Incidents;
        }
        static async liste(pgconn, dbOptions = {}) {
            const all_Incidents = [];
            const my_Incident = new Incident();
            var sqlRequest = my_Incident.buildSelectRequest(dbOptions);
            const instance = typedi_1.Container.get(db_pg_js_1.DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }
        async updateMe(pgconn) {
            if (this.getData().id == undefined) {
                throw new Error('Incident not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, { 'where': 'id = ' + this.getData().id });
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }
        async deleteMe(pgconn) {
            if (this.getData().id == undefined) {
                throw new Error('Incident not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, { 'where': 'id = ' + this.getData().id });
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
    };
    return Incident = _classThis;
})();
exports.Incident = Incident;
//# sourceMappingURL=incident.js.map