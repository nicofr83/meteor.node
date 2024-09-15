import { meteorDate } from './meteor_date.js';

const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;

describe("MeteorDate Tests", () => {
    it("UtcToLocalDate", () => {
        expect(meteorDate).toBe(true);
        var dt = new Date('2024-01-01T00:00:00Z');
        var localDt = dt.UtcToLocalDate(-4);
        expect(localDt.getDate()).toEqual(31);
        expect(localDt.getMonth()+1).toEqual(12);

        dt = new Date('2024-12-31T00:00:00Z');
        localDt = dt.UtcToLocalDate(4);
        expect(localDt.getFullYear()).toEqual(2024);
        expect(localDt.getMonth()+1).toEqual(12);
        expect(localDt.getDate()).toEqual(31);
        expect(localDt.getHours()).toEqual(4);

        dt = new Date('2024-12-31T22:00:00Z');
        localDt = dt.UtcToLocalDate(4);
        expect(localDt.getFullYear()).toEqual(2025);
        expect(localDt.getMonth()+1).toEqual(1);
        expect(localDt.getDate()).toEqual(1);
        expect(localDt.getHours()).toEqual(2);

    }, 70 * SECONDS);
    it("LocalToUtcDate", () => {
        expect(meteorDate).toBe(true);
        var dt = new Date('2024-01-01T00:00:00Z');
        const localDt = dt.LocalToUtcDate(4);
        expect(localDt.getDate()).toEqual(31);
        expect(localDt.getMonth()+1).toEqual(12);
        expect(localDt.getHours()).toEqual(20);
    }, 70 * SECONDS);
    it("addHeures", () => {
        expect(meteorDate).toBe(true);
        var dt = new Date('2024-01-01T00:00:00Z');
        var localDt = dt.addHeures(4);
        expect(localDt.getDate()).toEqual(1);
        expect(localDt.getMonth()+1).toEqual(1);
        expect(localDt.getHours()).toEqual(4);

        dt = new Date('2024-01-01T22:33:44Z');
        localDt = dt.addHeures(4);
        expect(localDt.getMonth()+1).toEqual(1);
        expect(localDt.getDate()).toEqual(2);
        expect(localDt.getHours()).toEqual(2);
        expect(localDt.getMinutes()).toEqual(33);
        expect(localDt.getSeconds()).toEqual(44);
    }, 70 * SECONDS);
    it("getNextSlot 15days", () => {
        expect(meteorDate).toBe(true);
        var dt = new Date('2024-01-01T07:32:15Z');
        console.log(dt.toJSON());

        // 2024-01-01T07:32:15Z => 2024-01-14T20:00:00Z
        var nextDt = dt.getNextSlot(4, 15);
        // console.log(nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(1);
        expect(nextDt.getDate()).toEqual(14);
        expect(nextDt.getHours()).toEqual(20);
        expect(nextDt.getMinutes()).toEqual(0);
        expect(nextDt.getSeconds()).toEqual(0);

        // 2024-01-14T20:00:00Z => 2024-01-31T20:00:00Z
        nextDt = nextDt.getNextSlot(4, 15);
        // console.log(nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(1);
        expect(nextDt.getDate()).toEqual(31);
        expect(nextDt.getHours()).toEqual(20);

        // 2024-01-31T20:00:00Z => 2024-02-14T20:00:00Z
        nextDt = nextDt.getNextSlot(4, 15);
        // console.log(nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(2);
        expect(nextDt.getDate()).toEqual(14);
        expect(nextDt.getHours()).toEqual(20);

        var dt =  new Date('2024-01-01T02:32:15Z');

        // 2024-01-01T02:32:15Z => ...
        nextDt = dt.getNextSlot(4, 15);
        // console.log(dt.toJSON() + ' -> ' + nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(1);
        expect(nextDt.getDate()).toEqual(14);
        expect(nextDt.getHours()).toEqual(20);
        expect(nextDt.getMinutes()).toEqual(0);
        expect(nextDt.getSeconds()).toEqual(0);

        dt = new Date('2024-01-01T22:33:44Z');
        // 2024-01-01T22:33:44Z => 2024-01-31T20:00:00.000Z
        nextDt = dt.getNextSlot(4, 15);
        // console.log(dt.toJSON() + ' -> ' + nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(1);
        expect(nextDt.getDate()).toEqual(31);
        expect(nextDt.getHours()).toEqual(20);
        expect(nextDt.getMinutes()).toEqual(0);
        expect(nextDt.getSeconds()).toEqual(0);
    }, 70 * SECONDS);
    it("getNextSlot 30days", () => {
        expect(meteorDate).toBe(true);
        var dt = new Date('2024-01-01T07:32:15Z');

        // 2024-01-01T07:32:15Z => 2024-01-31T20:00:00.000Z
        var nextDt = dt.getNextSlot(4, 30);
        // console.log(dt.toJSON() + ' => ' +nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(1);
        expect(nextDt.getDate()).toEqual(31);
        expect(nextDt.getHours()).toEqual(20);
        expect(nextDt.getMinutes()).toEqual(0);
        expect(nextDt.getSeconds()).toEqual(0);

        // 2024-01-31T20:00:00.000Z => 2024-02-29T20:00:00.000Z
        dt = nextDt;
        nextDt = nextDt.getNextSlot(4, 30);
        // console.log(dt.toJSON() + ' => ' +nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(2);
        expect(nextDt.getDate()).toEqual(29);
        expect(nextDt.getHours()).toEqual(20);

        // 2024-02-29T20:00:00.000Z => 2024-03-31T20:00:00.000Z
        dt = nextDt;
        nextDt = nextDt.getNextSlot(4, 30);
        // console.log(dt.toJSON() + ' => ' +nextDt.toJSON());
        expect(nextDt.getMonth()+1).toEqual(3);
        expect(nextDt.getDate()).toEqual(31);
        expect(nextDt.getHours()).toEqual(20);
    }, 70 * SECONDS);
});
