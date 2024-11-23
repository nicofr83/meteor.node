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
exports.DB_MYSQL = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_1 = require("./db");
const promise_1 = __importDefault(require("mysql2/promise"));
let DB_MYSQL = (() => {
    let _classDecorators = [(0, typedi_1.Service)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = db_1.DB;
    var DB_MYSQL = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DB_MYSQL = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        pool;
        constructor() {
            super();
            this.pool = new Array(5);
        }
        async connect(dbName = undefined) {
            var tmpPool = undefined;
            try {
                var varIdx = -1;
                if (process.env.MYSQL_DB != undefined && process.env.MYSQL_DB?.indexOf('?') != -1) {
                    dbName = process.env.MYSQL_DB;
                }
                varIdx = (dbName == undefined) ? -1 : this.pool.findIndex((P) => { return (P == undefined) ? false : P.dbName == dbName; });
                if (varIdx != -1) {
                    return await this.pool[varIdx].pool.getConnection();
                }
                tmpPool = promise_1.default.createPool({
                    host: process.env.MYSQL_HOST ? process.env.MYS_HOST : 'localhost',
                    user: process.env.MYSQL_USER ? process.env.MYS_USER : 'nico',
                    password: process.env.MYSQL_PASSWORD ? process.env.MYS_PASSWORD : 'Funiculi',
                    database: dbName ? dbName : 'BBF015',
                    port: Number(process.env.MYSQL_PORT ? process.env.MYS_PORT : 3306),
                    waitForConnections: true,
                    connectionLimit: 10,
                    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
                    idleTimeout: 100000, // idle connections timeout, in milliseconds, the default value 60000
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0
                });
                this.pool.push({ dbName: dbName, pool: tmpPool });
            }
            catch (err) {
                this.myLog.exception('db_mysql', err);
            }
            const myConn = await tmpPool.getConnection();
            await myConn.execute('SET time_zone = "+00:00"');
            return myConn;
        }
        async executeSQL(myConn, sql, values, rowsAsArray = false) {
            // console.log('mysqk.exec: ' + sql);
            const [rows, fields] = await myConn.query({
                sql,
                values,
                rowsAsArray
            });
            if (rows == undefined) {
                return [];
            }
            return rows;
        }
        async disconnect(myConn) {
            if (!myConn) {
                throw new Error('No connection to database');
            }
            // console.log('I am disconnecting!');
            myConn.release();
        }
    };
    return DB_MYSQL = _classThis;
})();
exports.DB_MYSQL = DB_MYSQL;
//# sourceMappingURL=db_mysql.js.map