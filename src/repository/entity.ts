import 'reflect-metadata';
import { Container } from 'typedi';
import {DB, DBLock, DBOptions} from "../tools/db";
import pg from 'pg'
import {Entity_INT} from './entity_interface'
import {DB_INT} from "../tools/db_interface";

export class Entity<T> implements Entity_INT<T>{
    private data: T;
    private tableName: string;
    private dirtyCols: string[] = [];
    private isDirty = false;
    private db: DB_INT;

    constructor(myData: any = {} as any) {
        this.tableName = '';
        this.data = myData;
        this.dirtyCols = [];
        this.isDirty = false;
        this.db = Container.get(DB);
    }
    public getData(): T {
        return this.data;
    }
    public setData(newData: T): void {
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
    public async getOneDBData(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<T> {
        dbOptions['limit'] = 1;
        const sql = this.buildSelectRequest(dbOptions);
        const dataFromSQL = await this.db.execute(pgconn, sql, []);
        return dataFromSQL;
    }
    public async getDBData(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<T[]> {
        const sql = this.buildSelectRequest(dbOptions);
        const dataFromSQL = await this.db.query(pgconn, sql, []);
        return dataFromSQL;
    }

    public async update(pgconn: pg.Client|undefined): Promise<void> {
        if (this.isDirty) {
            var sql = 'update ' + this.tableName + ' set ';
            var paramIdx = 1;
            var newValues = [];
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
            const instance = Container.get(DB);
            await instance.execute(pgconn, sql, newValues);
        }
    }
    public async delete(pgconn: pg.Client|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<number[]> {
        if (!dbOptions.hasOwnProperty('where') ) {throw new Error('where clause missing in delete statement');}

        var sql = 'delete from ' + this.tableName + ' ';
        sql += ' where ' + dbOptions.where + ' returning id';
        const instance = Container.get(DB);
        const deletedKeys = await instance.query(pgconn, sql);
        return deletedKeys
    }
}
