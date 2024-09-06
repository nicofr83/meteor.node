import 'reflect-metadata';
import { Service, Container} from 'typedi';
import {DB_PG } from "../tools/db_pg.js";
import { DBOptions, dbConn } from "../tools/db_interface.js";
import {Entity} from "./entity.js";
import {Incident_INT, IncidentData} from './incident_interface.js';

@Service({ transient: true })
export class Incident extends Entity implements Incident_INT{

    constructor(myData:IncidentData = {} as IncidentData ) {
        if (JSON.stringify(myData) != '{}') {
            super(myData);
        } else {
            super(
                {
                    id: undefined,
                    date_utc: undefined,
                    source: undefined,
                    level: undefined,
                    reason: undefined,
                    details: undefined,
                    active: undefined,
                } as IncidentData);
            }
            this.setTableName('incidents');
        }
        public static async getOne(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Incident> {
            var my_Incident = new Incident()
            const IncidentData = (await my_Incident.getOneDBData(pgconn, dbOptions)) as IncidentData;
            my_Incident = new Incident(IncidentData);
            return my_Incident;
        }

        public static async getAll(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<Incident[]> {
            const all_Incidents: Incident[] = [];
            var my_Incident = new Incident()
            const allData = await my_Incident.getDBData(pgconn, dbOptions);
            for (const a_data of allData) {
                my_Incident = new Incident(a_data as IncidentData);
                all_Incidents.push(my_Incident);
            }
            return all_Incidents;
        }

        public static async liste(pgconn: dbConn|undefined, dbOptions: DBOptions = {} as DBOptions): Promise<IncidentData[]> {
            const all_Incidents: Incident[] = [];
            const my_Incident = new Incident();
            var sqlRequest = my_Incident.buildSelectRequest(dbOptions);

            const instance = Container.get(DB_PG);
            const allData = await instance.query(pgconn, sqlRequest);
            return allData;
        }

        public async updateMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Incident not loaded, then cannot updateMe');
            }
            const updatedIds = await this.updateAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (updatedIds.length == 0) {
                return undefined;
            }
            return updatedIds[0];
        }

        public async deleteMe(pgconn: dbConn|undefined): Promise<number|undefined>{
            if (this.getData().id == undefined) {
                throw new Error('Incident not loaded, then cannot deleteMe');
            }
            const deletedIds = await this.deleteAll(pgconn, {'where': 'id = ' + this.getData().id} as DBOptions);
            if (deletedIds.length == 0) {
                return undefined;
            }
            return deletedIds[0];
        }
}
