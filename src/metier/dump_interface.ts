import { PosteMeteor } from './poste_meteor';

export interface dateLimits {
    min: number;
    min_dt: Date;
    max: number;
    max_dt: Date;
}

export interface Dump_INT {
    archiveDateLimits(): Promise<dateLimits>;
    getFromDump(curPoste: PosteMeteor, limits: dateLimits): Promise<{archive: any[], records:any[]}>;
}
