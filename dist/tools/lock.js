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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lock = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const EventObj = __importStar(require("events"));
const EventEmitter = EventObj.EventEmitter;
let Lock = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var Lock = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Lock = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        myLock;
        lockGoal;
        reasonLocked;
        eventEmitter;
        constructor() {
            this.myLock = false;
            this.eventEmitter = new EventEmitter();
            this.reasonLocked = '';
            this.lockGoal = '';
        }
        setGoal(goal) {
            this.lockGoal = goal;
        }
        async acquire(reason, timeout = 500) {
            return new Promise((f, reject) => {
                try {
                    // If nobody has the lock, take it and resolve immediately
                    if (!this.myLock) {
                        // Safe because JS doesn't interrupt you on synchronous operations,
                        // so no need for compare-and-swap or anything like that.
                        this.myLock = true;
                        this.reasonLocked = reason;
                        return f(true);
                    }
                    const myTimeOut = setTimeout(() => {
                        this.eventEmitter.removeListener("release", tryAcquire);
                        console.warn("lock timeout(" + this.lockGoal + "), locked for " + this.reasonLocked + ", new lock for " + reason);
                        //   this.myLock = true;
                        //   console.log("lock " + this.lockGoal + " aquired by brute force for " + reason);
                        //   this.reasonLocked = reason;
                        return f(false);
                    }, timeout);
                    // Otherwise, wait until somebody releases the lock and try again
                    const tryAcquire = () => {
                        if (!this.myLock) {
                            clearTimeout(myTimeOut);
                            this.eventEmitter.removeListener("release", tryAcquire);
                            this.myLock = true;
                            this.reasonLocked = reason;
                            return f(true);
                        }
                    };
                    this.eventEmitter.on("release", tryAcquire);
                }
                catch {
                    return false;
                }
            });
        }
        isLocked() {
            return this.myLock;
        }
        release() {
            // Release the lock immediately
            this.myLock = false;
            this.reasonLocked = "";
            setImmediate(() => this.eventEmitter.emit("release"));
        }
    };
    return Lock = _classThis;
})();
exports.Lock = Lock;
//# sourceMappingURL=lock.js.map