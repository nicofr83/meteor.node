import { PosteMeteor } from '../../../src/metier/poste_meteor';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

// getDumpedPostes(): Promise<string>
describe("Poste_Metier Tests", () => {

    it("test getDumpedPostes", async () => {
        const listePostes = await PosteMeteor.getDumpedPostes();
        expect (listePostes.length).toBeGreaterThan(1);
    }, 70 * SECONDS);

});
