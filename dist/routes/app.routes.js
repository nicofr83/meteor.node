"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_controller_js_1 = require("../controllers/app.controller.js");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/'); // Specify the directory for storing uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Generate unique filenames
    }
});
// Set up file upload handling with Multer (file storage configuration)
const upload = (0, multer_1.default)({ storage });
class AppRoutes {
    router = (0, express_1.Router)();
    constructor() {
        this.router.post("/sendjson", upload.single('file'), app_controller_js_1.uploadFile);
    }
}
exports.default = new AppRoutes().router;
//# sourceMappingURL=app.routes.js.map