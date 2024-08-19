// tests/calculator.spec.tx
// Use config/.env.local for tests
process.env.DOTENV = 'test'
import "../../../src/tools/config";
console.log("TEST_VAR1: ", process.env.TEST_VAR1);
console.log("TEST_VAR2: ", process.env.TEST_VAR2);

describe("Config Tests", () => {
    console.log('test started')
    it("test lecture d'une clef", () => {
        expect(process.env.TEST_VAR1).toEqual("TEST");
    });
    it("test redirection", () => {
        expect(process.env.TEST_VAR2).toEqual(process.env.USER);
    });
});

