
export enum Aggreg_Type{
    NONE = 0,
    AVG = 1,
    SUM = 2,
    MAX = 3,
    MIN = 4
    }

export enum Code_QA {
    UNSET = 0,
    VALIDATED = 1,
    UNVALIDATED = 9
}
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
export enum DBLock{
    NONE = 1,
    UPDATE = 2,     // For Update
    SKIPLOCKED = 3, // For Update Skip Locked
    SHARE = 4       // for Share
}