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
exports.JsonLoaderWorker = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const log_js_1 = require("../../tools/log.js");
const jsonLoader_js_1 = require("../../dataLoader/json/jsonLoader.js");
const fs_1 = __importDefault(require("fs"));
const jsonValidator_1 = require("./jsonValidator");
let JsonLoaderWorker = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var JsonLoaderWorker = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            JsonLoaderWorker = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        myLog;
        dataSations;
        jsonLoader;
        constructor() {
            this.myLog = typedi_1.Container.get(log_js_1.Log);
            this.jsonLoader = typedi_1.Container.get(jsonLoader_js_1.JsonLoader);
            this.dataSations = [];
        }
        async processFile(filename) {
            this.myLog.info('jsonLoader', `processFile: ${filename}`);
            // this.dataLoader.load(this.dataSations);
        }
        async loadJsonFile(filename) {
            fs_1.default.readFile(filename, 'utf-8', (err, fileData) => {
                if (err) {
                    this.myLog.error('jsonLoader', err);
                    throw new Error(`error reading file: ${filename}`);
                }
                this.dataSations = JSON.parse(fileData);
                (0, jsonValidator_1.checkJson)(this.dataSations, filename);
                this.myLog.debug('jsonLoader', `data loaded from: ${filename}`);
                return this.dataSations;
            });
        }
    };
    return JsonLoaderWorker = _classThis;
})();
exports.JsonLoaderWorker = JsonLoaderWorker;
//# sourceMappingURL=jsonLoaderWorker.js.map