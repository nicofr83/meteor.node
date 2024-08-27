import 'reflect-metadata';
import { Container } from 'typedi';
import {DB, DBLock, DBOptions} from "../tools/db";
import pg from 'pg'
import {Entity_INT, EntityData} from './entity_interface'
import {DB_INT} from "../tools/db_interface";

export class Entity implements Entity_INT{
    private data: EntityData;
    private tableName: string;
    private dirtyCols: string[] = [];
    private isDirty = false;        // do not manage transactions...
    private db: DB_INT;

    constructor(myData: any = {} as any) {
        this.tableName = '';
        this.data = myData;
        this.dirtyCols = [];
        this.isDirty = false;
        this.db = Container.get(DB);
    }
    public getData(): EntityData {
        return this.data;
    }
    public setData(newData: EntityData): void {
        if (JSON.stringify(this.data) == '{}') {
            this.data = newData;
            this.dirtyCols = [];
            this.isDirty = true;
            return;
        }
        for (const a_col in newData) {
            const keyData = a_col as string as keyof typeof this.data;
            const keyNewData = a_col as string as keyof typeof newData;
            if (!(this.data as object).hasOwnProperty(keyData) ) {throw new Error('Invalid column name: ' + a_col);}
            this.data[keyData] = newData[keyNewData];
            this.dirtyCols.push(a_col);
        }
        this.isDirty = true;
    }
    public getIsDirty(): boolean {
        return this.isDirty;
    }
    public setIsDirty(newDirtyFlag: boolean): void {
        this.isDirty = newDirtyFlag;
    }
    public getDirtyCols(): string[] {
        return this.dirtyCols;
    }
    public setDirtyCols(newDirtyFlag: boolean): void {
        this.isDirty = newDirtyFlag;
    }
    public getTableName(): string {
        return this.tableName;
    }
    public setTableName(newTableName: string): void {
        this.tableName = newTableName;
    }
    public getColumnsNames(colSpec: string|string[]|undefined) {
        var colName = ''
        if (colSpec == undefined || colSpec.length == 0) {
            for (var colStr in this.data as object) {
                colName += colStr + ', ';
            }
        } else {
            if (typeof colSpec == 'string') {
                colName += colSpec + ', ';
            } else {
                for (var aColName of colSpec) {
                    colName += aColName + ', ';
                }
            }
        }
        return colName.substring(0, colName.length - 2);
    }
    public buildSelectRequest(dbOptions: DBOptions = {} as DBOptions): string {

        // select id, meteor from postes where meteor like 'BAG%' order by id limit 1 for update;
        if (!dbOptions.hasOwnProperty('columns')) {
            dbOptions.columns = undefined;
        }
        var sql = 'select ' + this.getColumnsNames(dbOptions.columns) + ' from ' +  this.tableName;

        if (dbOptions.hasOwnProperty('where') && dbOptions.where) {
            sql += ' where ' + dbOptions.where;
        }

        // order
        if (dbOptions.hasOwnProperty('order') && dbOptions.order) {
            sql += ' order by ' + dbOptions.order;
        }

        // Limit
        if (dbOptions.hasOwnProperty('limit') && dbOptions.limit) {
            sql += ' limit ' + dbOptions.limit;
        }

        // Locking
        if (dbOptions.hasOwnProperty('lock') && dbOptions.lock) {
            switch (dbOptions.lock as unknown as DBLock) {
                case DBLock.NONE:
                    break;
                case DBLock.UPDATE:
                    sql += ' for update';
                    break;
                case DBLock.SKIPLOCKED:
                    sql += ' for update skip locked';
                    break;
                case DBLock.SHARE:
                    sql += ' for share';
                    break;
            }
        }
        return sql;
    }

    public async getOneDBData(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<EntityData> {
        dbOptions['limit'] = 1;
        const sql = this.buildSelectRequest(dbOptions);
        const dataFromSQL = await this.db.execute(pgconn, sql, []);
        return dataFromSQL;
    }
    public async getDBData(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<EntityData[]> {
        const sql = this.buildSelectRequest(dbOptions);
        const dataFromSQL = await this.db.query(pgconn, sql, []);
        return dataFromSQL;
    }

    public async updateAll(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<any[]> {
        if (this.isDirty) {
            if (!dbOptions.hasOwnProperty('where') || !dbOptions.where) {
                throw new Error('updateAll needs a where clause');
            }
            var sql = 'update ' + this.tableName + ' set ';
            var paramIdx = 1;
            const newValues = [];
            for (var a_col of this.dirtyCols) {
                sql += a_col + ' = $' + (paramIdx ++) + ', ';
                // convert a string to a key for the json data object
                const key = a_col as string as keyof typeof this.data;
                newValues.push(this.data[key]);
            }
            sql = sql.substring(0, sql.length - 2) as string;
            sql += ' where id = $' + (paramIdx ++);
            const key = 'id' as string as keyof typeof this.data;
            newValues.push(this.data[key]);
            this.isDirty = false;
        
            // returning
            if (!dbOptions.hasOwnProperty('returning') || !dbOptions.returning) {
                dbOptions.returning = 'id';
            }
            sql += ' returning ' + dbOptions.returning;
            // execute update statement
            const instanceDB = Container.get(DB);
            const returnedCols = await instanceDB.query(pgconn, sql, newValues);
            return returnedCols;
        }
        return [];
    }
    public async deleteAll(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<any[]> {
        if (!dbOptions.hasOwnProperty('where') || !dbOptions.where) {
            throw new Error('deleteAll needs a where clause');
        }

        var sql = 'delete from ' + this.tableName + ' ';
        sql += ' where ' + dbOptions.where;
        // returning
        if (!dbOptions.hasOwnProperty('returning') || !dbOptions.returning) {
            dbOptions.returning = 'id';
        }
        sql += ' returning ' + dbOptions.returning;
        // execute delete statement
        const instanceDB = Container.get(DB);
        const deletedKeys = await instanceDB.query(pgconn, sql);
        return deletedKeys
    }
    public async insertMe(pgconn: pg.Client|undefined): Promise<void> {
        // multiple rows insert
        // const sql = "insert into nico(num, name) values($1, $2) returning *";
        // const values = [[1, 'nico'], [2, 'nico2'], [3, 'nico3']];

        // for await (const a_value of values) {
        //     const ret = await instance.query(pgConn, sql, a_value);
        //     console.dir(ret);
        // }
        var sql = 'insert into ' + this.tableName + '(';
        var sqlEnd = ' values(';
        var paramIdx = 1;
        const newValues = [];
        for (var a_col in this.getData()) {
            if (a_col == 'id') {
                continue;
            }
            sql += a_col + ', ';
            sqlEnd += '$' + (paramIdx ++) + ', ';
            // convert a string to a key for the json data object
            const key = a_col as string as keyof typeof this.data;
            newValues.push(this.data[key]);
        }
        sql = sql.substring(0, sql.length - 2) as string;
        sqlEnd = sqlEnd.substring(0, sqlEnd.length - 2) as string;
        sql += ' ) ' + sqlEnd + ' ) returning *';
        // execute insert statement
        const instanceDB = Container.get(DB);
        const insertedCols = await instanceDB.query(pgconn, sql, newValues);
        this.data = insertedCols[0];
        this.isDirty = false;
        return;
    }
}
