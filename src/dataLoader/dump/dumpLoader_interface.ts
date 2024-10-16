import { PosteMeteor } from '../../metier/poste_meteor';
import { DumpArchive, DumpArray} from '../dataLoader_interface.js';
import { MesureItem} from '../../metier/mesure_meteor_interface.js';
import { DataLoader_INT } from '../dataLoader_interface.js';

export interface dateLimits {
    first_pass: boolean;
    stop: boolean

    arch_min: number;     // archive min
    arch_min_dt: Date;    // current Date to process

    arch_max: number;     // archive max
    arch_max_dt: Date;    // current Date to process

    min: number;          // current min to process
    min_dt: Date;         // current Date to process

    max: number;          // current max to process
    max_dt: Date;         // current Date to process
}

export interface DumpLoader_INT extends DataLoader_INT{
    setStation(meteor: string, cur_poste: PosteMeteor): void ;
    archiveDateLimits(): Promise<dateLimits>;
    getFromDump(limits: dateLimits): Promise<DumpArray>;
    getFirstSlot(): Promise<dateLimits>;
    getNextSlot(prevLimits: dateLimits, nbDays?: number): dateLimits;
    loadArchiveData(mAll: MesureItem[], limits: dateLimits): Promise<DumpArchive[]>;
    loadRecordsData(mAll: MesureItem[], limits: dateLimits): Promise<any[]>;
    loadArchiveSQL(mAll: MesureItem[], limits: dateLimits): string;
    loadRecordSQL(aMesure: MesureItem, limits: dateLimits): string;
    addMesureValueToRecords(dumpData: DumpArray) : void;
} 
