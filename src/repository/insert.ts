import 'reflect-metadata';
import { Container } from 'typedi';
import {DB_PG} from "../tools/db_pg.js";

class insert{
    public async run(): Promise<void> {
        const instance = Container.get(DB_PG);
        const pgConn =  await instance.connect();

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
(async() => {
    const i = new insert();
    await i.run()
    
}) ();
