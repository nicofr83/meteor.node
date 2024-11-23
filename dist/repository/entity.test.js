"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_js_1 = require("./entity.js");
const enums_js_1 = require("../tools/enums.js");
const SECONDS = process.env.VSCODE_DEBUGGING === 'true' ? 1000 : 0;
class EntityClass extends entity_js_1.Entity {
    constructor(myData = {}) {
        super(myData);
    }
}
describe("Entity test", () => {
    it("getColumnsName string", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        const col1 = myEnt.getColumnsNames('col1');
        expect(col1).toEqual('col1');
    }, 70 * SECONDS);
    it("getColumnsName string[]", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        const col1 = myEnt.getColumnsNames(['col1', 'col2']);
        expect(col1).toEqual('col1, col2');
    }, 70 * SECONDS);
    it("buildSelectRequest", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest();
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable');
    }, 70 * SECONDS);
    it("buildSelectRequest columns option", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'columns': ['col1', 'col2'] });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable');
    }, 70 * SECONDS);
    it("buildSelectRequest where option", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'where': 'col1 = 1' });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable where col1 = 1');
    }, 70 * SECONDS);
    it("buildSelectRequest order option", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'order': 'col1' });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable order by col1');
    }, 70 * SECONDS);
    it("buildSelectRequest lock option-NONE", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'lock': enums_js_1.DBLock.NONE });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable');
    }, 70 * SECONDS);
    it("buildSelectRequest lock option-UPDATE", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'lock': enums_js_1.DBLock.UPDATE });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable for update');
    }, 70 * SECONDS);
    it("buildSelectRequest lock option-SKIPLOCKED", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'lock': enums_js_1.DBLock.SKIPLOCKED });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable for update skip locked');
    }, 70 * SECONDS);
    it("buildSelectRequest lock option-SHARE", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'lock': enums_js_1.DBLock.SHARE });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable for share');
    }, 70 * SECONDS);
    it("buildSelectRequest limit", () => {
        const myEnt = new EntityClass({ 'col1': undefined, 'col2': undefined });
        myEnt.setTableName('myTable');
        const sql1 = myEnt.buildSelectRequest({ 'limit': 10 });
        // console.log(sql1);
        expect(sql1).toEqual('select col1, col2 from myTable limit 10');
    }, 70 * SECONDS);
});
//# sourceMappingURL=entity.test.js.map