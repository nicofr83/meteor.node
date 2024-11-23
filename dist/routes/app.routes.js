"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_controller_js_1 = require("../controllers/app.controller.js");
class AppRoutes {
    router = (0, express_1.Router)();
    constructor() {
        this.router.post("/sendjson", app_controller_js_1.uploadFile);
    }
}
exports.default = new AppRoutes().router;
//# sourceMappingURL=app.routes.js.map