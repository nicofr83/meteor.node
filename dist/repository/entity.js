"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const db_pg_js_1 = require("../tools/db_pg.js");
const enums_js_1 = require("../tools/enums.js");
class Entity {
    data;
    tableName;
    dirtyCols = [];
    isDirty = false; // do not manage transactions...
    db;
    constructor(myData = {}) {
        this.tableName = '';
        this.data = myData;
        this.dirtyCols = [];
        this.isDirty = false;
        this.db = typedi_1.Container.get(db_pg_js_1.DB_PG);
    }
    getData() {
        return this.data;
    }
    setData(newData) {
        if (JSON.stringify(this.data) == '{}') {
            this.data = newData;
            this.dirtyCols = [];
            this.isDirty = true;
            return;
        }
        for (const a_col in newData) {
            const keyData = a_col;
            const keyNewData = a_col;
            if (!this.data.hasOwnProperty(keyData)) {
                throw new Error('Invalid column name: ' + a_col);
            }
            this.data[keyData] = newData[keyNewData];
            this.dirtyCols.push(a_col);
        }
        this.isDirty = true;
    }
    setOnlyData(newData) {
        this.data = newData;
    }
    getIsDirty() {
        return this.isDirty;
    }
    setIsDirty(newDirtyFlag) {
        this.isDirty = newDirtyFlag;
    }
    getDirtyCols() {
        return this.dirtyCols;
    }
    setDirtyCols(newDirtyFlag) {
        this.isDirty = newDirtyFlag;
    }
    getTableName() {
        return this.tableName;
    }
    setTableName(newTableName) {
        this.tableName = newTableName;
    }
    getColumnsNames(colSpec) {
        var colName = '';
        if (colSpec == undefined || colSpec.length == 0) {
            for (var colStr in this.data) {
                colName += colStr + ', ';
            }
        }
        else {
            if (typeof colSpec == 'string') {
                colName += colSpec + ', ';
            }
            else {
                for (var aColName of colSpec) {
                    colName += aColName + ', ';
                }
            }
        }
        return colName.substring(0, colName.length - 2);
    }
    buildSelectRequest(dbOptions = {}) {
        // select id, meteor from postes where meteor like 'BAG%' order by id limit 1 for update;
        if (!dbOptions.hasOwnProperty('columns')) {
            dbOptions.columns = undefined;
        }
        var sql = 'select ' + this.getColumnsNames(dbOptions.columns) + ' from ' + this.tableName;
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
            switch (dbOptions.lock) {
                case enums_js_1.DBLock.NONE:
                    break;
                case enums_js_1.DBLock.UPDATE:
                    sql += ' for update';
                    break;
                case enums_js_1.DBLock.SKIPLOCKED:
                    sql += ' for update skip locked';
                    break;
                case enums_js_1.DBLock.SHARE:
                    sql += ' for share';
                    break;
            }
        }
        return sql;
    }
    async getOneDBData(pgconn, dbOptions = {}) {
        dbOptions['limit'] = 1;
        const sql = this.buildSelectRequest(dbOptions);
        const dataFromSQL = await this.db.execute(pgconn, sql, []);
        return dataFromSQL;
    }
    async getDBData(pgconn, dbOptions = {}) {
        const sql = this.buildSelectRequest(dbOptions);
        const dataFromSQL = await this.db.query(pgconn, sql, []);
        return dataFromSQL;
    }
    async updateAll(pgconn, dbOptions = {}) {
        if (this.isDirty) {
            if (!dbOptions.hasOwnProperty('where') || !dbOptions.where) {
                throw new Error('updateAll needs a where clause');
            }
            var sql = 'update ' + this.tableName + ' set ';
            var paramIdx = 1;
            const newValues = [];
            for (var a_col of this.dirtyCols) {
                sql += a_col + ' = $' + (paramIdx++) + ', ';
                // convert a string to a key for the json data object
                const key = a_col;
                newValues.push(this.data[key]);
            }
            sql = sql.substring(0, sql.length - 2);
            sql += ' where id = $' + (paramIdx++);
            const key = 'id';
            newValues.push(this.data[key]);
            this.isDirty = false;
            // returning
            if (!dbOptions.hasOwnProperty('returning') || !dbOptions.returning) {
                dbOptions.returning = 'id';
            }
            sql += ' returning ' + dbOptions.returning;
            // execute update statement
            const instanceDB = typedi_1.Container.get(db_pg_js_1.DB_PG);
            const returnedCols = await instanceDB.query(pgconn, sql, newValues);
            return returnedCols;
        }
        return [];
    }
    async deleteAll(pgconn, dbOptions = {}) {
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
        const instanceDB = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const deletedKeys = await instanceDB.query(pgconn, sql);
        return deletedKeys;
    }
    async count(pgconn, dbOptions = {}) {
        const sql = 'select count(*) as count from ' + this.tableName;
        const dataFromSQL = await this.db.execute(pgconn, sql, []);
        return dataFromSQL;
    }
    async insertMe(pgconn) {
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
            sqlEnd += '$' + (paramIdx++) + ', ';
            // convert a string to a key for the json data object
            const key = a_col;
            newValues.push(this.data[key]);
        }
        sql = sql.substring(0, sql.length - 2);
        sqlEnd = sqlEnd.substring(0, sqlEnd.length - 2);
        sql += ' ) ' + sqlEnd + ' ) returning *';
        // execute insert statement
        const instanceDB = typedi_1.Container.get(db_pg_js_1.DB_PG);
        const insertedCols = await instanceDB.query(pgconn, sql, newValues);
        this.data = insertedCols[0];
        this.isDirty = false;
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map