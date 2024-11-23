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
exports.MesureMeteor = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const mesure_js_1 = require("../repository/mesure.js");
let MesureMeteor = (() => {
    let _classDecorators = [(0, typedi_1.Service)({ transient: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = mesure_js_1.Mesure;
    var MesureMeteor = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MesureMeteor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor(data = undefined) {
            super(data);
        }
        async getListe() {
            var fixedMesures = [];
            const mesures = (await mesure_js_1.Mesure.liste(undefined, { 'order': 'id' }));
            for (const aMesure of mesures) {
                var tmp_dir_idx = undefined;
                if (aMesure.field_dir != undefined) {
                    for (var dir_idx = 0; dir_idx < mesures.length; dir_idx++) {
                        if (mesures[dir_idx].id == aMesure.field_dir) {
                            tmp_dir_idx = dir_idx;
                            break;
                        }
                    }
                }
                fixedMesures.push({
                    id: aMesure.id,
                    name: aMesure.name,
                    json_input: aMesure.json_input,
                    json_input_bis: aMesure.json_input_bis,
                    archive_col: aMesure.archive_col,
                    archive_table: (aMesure.archive_table == null && aMesure.archive_table != 'skip') ? aMesure.name : undefined,
                    field_dir: aMesure.field_dir,
                    max: aMesure.max,
                    min: aMesure.min,
                    agreg_type: aMesure.agreg_type,
                    is_wind: aMesure.is_wind,
                    allow_zero: aMesure.allow_zero,
                    convert: aMesure.convert,
                    j: aMesure.j,
                    dir_idx: Number(tmp_dir_idx),
                });
            }
            return fixedMesures;
        }
    };
    return MesureMeteor = _classThis;
})();
exports.MesureMeteor = MesureMeteor;
//# sourceMappingURL=mesure_meteor.js.map