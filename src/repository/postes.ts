import 'reflect-metadata';
import { Service, Container } from 'typedi';
import {DB, DBOptions} from "../tools/db";
import pg from 'pg'

export enum Data_Source{
    NONE = 0,
    METEOR_OI = 1,
    METEO_FR = 2,
    OVPF = 3
}

export enum Load_Type{
    NONE = 0,
    LOAD_FROM_DUMP = 1,
    LOAD_FROM_JSON = 2,
    LOAD_FROM_DUMP_THEN_JSON = 3,
    LOAD_CSV_FOR_METEOFR = 4,
    LOAD_CSV_FOR_OVPF = 8
}
export interface PosteData {
        [key: string]: any;
        id: bigint|undefined;
        meteor: string|undefined;
        delta_timezone: number | undefined;
        data_source: Data_Source | undefined;
        load_type: Load_Type | undefined;
        api_key: string | undefined;
        type: string | undefined;
        altitude: number | undefined;
        lat: number | undefined;
        long: number | undefined;
        info: string | undefined;
        stop_date: Date | undefined;
        last_obs_date_local: Date | undefined;
        last_obs_id: number | undefined;
        last_json_date_local: Date | undefined;
        info_sync: number | undefined;
}

@Service( )
export class Poste {
    private tableName = 'postes';
    private data : PosteData = {
        id: undefined,
        meteor: undefined,
        delta_timezone: undefined,
        data_source: undefined,
        load_type: undefined,
        api_key: undefined,
        type: undefined,
        altitude: undefined,
        lat: undefined,
        long: undefined,
        info: undefined,
        stop_date: undefined,
        last_obs_date_local: undefined,
        last_obs_id: undefined,
        last_json_date_local: undefined,
        info_sync: undefined
    }
    private dirtyCols: string[] = [];
    private is_dirty = false;

    public getData(): PosteData {
        return this.data;
    }
    public setData(newData: PosteData): void {
        for (var a_col in newData) {
            this.data[a_col] = newData[a_col];
            this.dirtyCols.push(a_col);
        }
        this.is_dirty = true;
    }
    public static async getOne(pgconn: pg.Client, id: number, dbOptions: DBOptions = DBOptions.NONE): Promise<Poste> {
        const tmp_pst = new Poste()
        const sql = tmp_pst.buildSelectRequest('id = $id', '', 1, dbOptions);
        tmp_pst.data = await Container.get(DB).execute(pgconn, sql, [id]);
        return tmp_pst;
    }

    public static async getAll(pgconn: pg.Client, id: number, dbOptions: DBOptions = DBOptions.NONE): Promise<Poste[]> {
        const all_postes: Poste[] = [];
        const tmp_pst = new Poste()
        var sql = tmp_pst.buildSelectRequest('id = $id', '', 1, dbOptions);

        const instance = Container.get(DB);
        const allData = await instance.query(pgconn, sql, [id]);
        for (const a_data of allData) {
            const tmp_pst = new Poste()
            tmp_pst.data = a_data;
            all_postes.push(tmp_pst);
        }
        return all_postes;
    }

    public static async liste(pgconn: pg.Client, id: number, dbOptions: DBOptions = DBOptions.NONE): Promise<PosteData[]> {
        const all_postes: Poste[] = [];
        const tmp_pst = new Poste()
        var sql = tmp_pst.buildSelectRequest('id = $id', '', 1, dbOptions);

        const instance = Container.get(DB);
        const allData = await instance.query(pgconn, sql, [id]);
        return allData;
    }
    
    public async save(pgconn: pg.Client): Promise<void> {
        if (this.is_dirty) {
            var sql = 'update ' + this.tableName + ' set ';
            for (var a_col in this.dirtyCols) {
                sql += a_col + ' = $' + (this.dirtyCols.indexOf(a_col) + 1) + ', ';
            }
            sql = sql.substring(0, sql.length - 1) as string;
            sql += ' where id = $' + (this.dirtyCols.length + 1);
            const instance = Container.get(DB);
            await instance.execute(pgconn, sql, this.dirtyCols);
        }
    }
    public buildSelectRequest(where: string = '', order: string = '', limit: number = 0, dbOptions: DBOptions = DBOptions.NONE): string {
        var sql = 'select ';
        for (var a_col in this.getData()) {
            sql += a_col + ', ';
        }
        sql = sql.substring(0, sql.length - 1);
        sql += ' from ' +  this.tableName;

        if (dbOptions == DBOptions.LOCK) {
            sql += ' for update';
        }

        if (where.length > 0) {
            sql += ' where ' + where;
        }
        if (order.length > 0) {
            sql += ' order by ' + order;
        }
        if (limit > 0) {
            sql += ' limit ' + limit;
        }
        return sql;
    }
}