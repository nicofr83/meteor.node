"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const poste_controller_js_1 = require("../controllers/poste.controller.js");
class PosteRoutes {
    router = (0, express_1.Router)();
    constructor() {
        this.router.get("/getDumpedPostes", poste_controller_js_1.getDumpedPostes);
    }
}
exports.default = new PosteRoutes().router;
//# sourceMappingURL=poste.routes.js.map