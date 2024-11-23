"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
class insert {
    async run() {
        const instance = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const pgConn = await instance.connect();
        const sql = "insert into nico(num, name) values($1, $2) returning *";
        const values = [[1, 'nico'], [2, 'nico2'], [3, 'nico3']];
        // for await (const a_value of values) {
        //     const ret = await instance.query(pgConn, sql, a_value);
        //     console.dir(ret);
        // }
        const ret = await instance.query(pgConn, sql, values);
        // console.dir(ret);
    }
}
(async () => {
    const i = new insert();
    await i.run();
})();
//# sourceMappingURL=insert.js.map