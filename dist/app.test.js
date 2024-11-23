"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import {describe, expect, test} from '@jest/globals';
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const app_js_1 = __importDefault(require("./app.js"));
describe("API server endpoints", () => {
    // GET - List all colors
    it("test alive", async () => {
        const res = await (0, supertest_1.default)(app_js_1.default)
            .get("/check")
            .expect("Content-Type", /json/);
        (0, globals_1.expect)(res.status).toEqual(200);
        (0, globals_1.expect)(res.body.message).toEqual("I am alive!");
    });
    // GET - Invalid path
    it("should return Not Found", async () => {
        const res = await (0, supertest_1.default)(app_js_1.default).get("/INVALID_PATH");
        (0, globals_1.expect)(res.status).toEqual(404);
    });
});
//# sourceMappingURL=app.test.js.map