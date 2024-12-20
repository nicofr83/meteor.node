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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_PG = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_1 = require("./db");
const pg_1 = __importDefault(require("pg"));
let DB_PG = (() => {
    let _classDecorators = [(0, typedi_1.Service)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = db_1.DB;
    var DB_PG = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DB_PG = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        pool;
        constructor() {
            // this.myLog.debug('DB_PG constructor', 'new connection');
            super();
            this.pool = new pg_1.default.Pool({
                user: process.env.POSTGRESQL_ADDON_USER ? process.env.POSTGRESQL_ADDON_USER : 'postgres',
                password: process.env.POSTGRESQL_ADDON_PASSWORD ? process.env.POSTGRESQL_ADDON_PASSWORD : '',
                host: process.env.POSTGRESQL_ADDON_HOST ? process.env.POSTGRESQL_ADDON_HOST : 'localhost',
                port: parseInt(process.env.POSTGRESQL_ADDON_PORT ? process.env.POSTGRESQL_ADDON_PORT : '5432'),
                database: process.env.POSTGRESQL_ADDON_DB ? process.env.POSTGRESQL_ADDON_DB : 'climato'
            });
        }
        async connect(dbName = undefined) {
            if (dbName != undefined && dbName != this.pool.options.database) {
                throw new Error('Database name mismatch');
            }
            // console.log('I am connecting!');
            const client = await this.pool.connect();
            return client;
        }
        async executeSQL(pgconn, sql, values) {
            const ret = (await pgconn.query(sql, values));
            if (ret == undefined) {
                return [];
            }
            return ret.rows;
        }
        async disconnect(pgconn) {
            if (!pgconn) {
                throw new Error('No connection to database');
            }
            // console.log('I am disconnecting!');
            pgconn.release();
        }
    };
    return DB_PG = _classThis;
})();
exports.DB_PG = DB_PG;
//# sourceMappingURL=db_pg.js.map