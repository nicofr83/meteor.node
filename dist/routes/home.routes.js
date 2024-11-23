"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const home_controller_js_1 = require("../controllers/home.controller.js");
class HomeRoutes {
    router = (0, express_1.Router)();
    constructor() {
        this.router.get("/check", home_controller_js_1.checkMe);
        this.router.get("/checkAsync", home_controller_js_1.checkMeAsync);
    }
}
exports.default = new HomeRoutes().router;
//# sourceMappingURL=home.routes.js.map