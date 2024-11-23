"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const poste_meteor_js_1 = require("./poste_meteor.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
// getDumpedPostes(): Promise<string>
describe("Poste_Metier Tests", () => {
    it("test getDumpedPostes", async () => {
        const listePostes = await poste_meteor_js_1.PosteMeteor.getDumpedPostes();
        expect(listePostes.length).toBeGreaterThan(1);
    }, 70 * SECONDS);
});
//# sourceMappingURL=poste_meteor.test.js.map