"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tests/calculator.spec.tx
// Use config/.env.local for tests
process.env.DOTENV = 'test';
require("./config.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
describe("Config Tests", () => {
    it("test lecture d'une clef", () => {
        expect(process.env.TEST_VAR1).toEqual("TEST");
    }, 70 * SECONDS);
    it("test redirection", () => {
        expect(process.env.TEST_VAR2).toEqual(process.env.USER);
    }, 70 * SECONDS);
});
//# sourceMappingURL=config.test.js.map