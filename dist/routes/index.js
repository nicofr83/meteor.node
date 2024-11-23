"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const home_routes_js_1 = __importDefault(require("./home.routes.js"));
const poste_routes_js_1 = __importDefault(require("./poste.routes.js"));
const app_routes_js_1 = __importDefault(require("./app.routes.js"));
class MyRoutes {
    constructor(app) {
        app.use("/", home_routes_js_1.default);
        app.use("/poste", poste_routes_js_1.default);
        app.use("/app", app_routes_js_1.default);
    }
}
exports.default = MyRoutes;
//# sourceMappingURL=index.js.map