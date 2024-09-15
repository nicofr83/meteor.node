import { PosteMeteor } from './poste_meteor';
import { meteorDate} from '../tools/meteor_date';

export interface dateLimits {
    first_pass: boolean;
    stop: boolean

    arch_min: number;           // archive min
    arch_min_dt: Date;    // current Date to process

    arch_max: number;           // archive max
    arch_max_dt: Date;    // current Date to process

    min: number;                // current min to process
    min_dt: Date;         // current Date to process

    max: number;                // current max to process
    max_dt: Date;         // current Date to process
}

export interface Dump_INT {
    archiveDateLimits(): Promise<dateLimits>;
    getFromDump(curPoste: PosteMeteor, limits: dateLimits): Promise<{archive: any[], records:any[]}>;
}
