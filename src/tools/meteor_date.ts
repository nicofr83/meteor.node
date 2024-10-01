export const meteorDate:boolean = true;

declare global {
    interface Date 
    {
        addHeures(h: number): Date;
        getMaxDays(): number;
        UtcToLocalDate(deltaTimeZone: number): Date;
        LocalToUtcDate(deltaTimeZone: number): Date;
        getNextDate(deltaTimeZone: number, nbDays: number): Date;
    }
}

Date.prototype.addHeures = function(h: number): Date {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}
Date.prototype.getMaxDays = function(): number {
    const m = this.getMonth() + 1;
    if ([1, 3, 5, 7, 8, 10, 12].indexOf(m) != -1) {
        return 31;
    }
    if (this.getFullYear() % 4 == 0 && m == 2) {
        return 29;
    }
    return (this.getMonth() == 2) ? 28 : 30;
}

Date.prototype.UtcToLocalDate = function(deltaTimeZone: number) {
    return new Date(this.getTime() + deltaTimeZone * 3600 * 1000)
}

Date.prototype.LocalToUtcDate = function(deltaTimeZone: number) {
    return new Date(this.getTime() - deltaTimeZone * 3600 * 1000);
}

Date.prototype.getNextDate = function(deltaTimeZone: number, nbDays: number) {
    var dtLocal = new Date(this.UtcToLocalDate(deltaTimeZone).toJSON());

    dtLocal.addHeures(24 * nbDays);

    while (dtLocal.getDate() >= 30) {
        dtLocal.addHeures(24);
    }
    var dtLocalSplits = dtLocal.toJSON().split('-');

    if (dtLocal.getDate() <= 2) {
        dtLocal = new Date(dtLocalSplits[0] + '-' + dtLocalSplits[1] + '-01T00:00:00.000Z');
        return dtLocal.LocalToUtcDate(deltaTimeZone);
    }

    if (dtLocal.getDate() <= 16) {
        dtLocal = new Date(dtLocalSplits[0] + '-' + dtLocalSplits[1] + '-15T00:00:00.000Z');
        return dtLocal.LocalToUtcDate(deltaTimeZone);
    }

    dtLocal.addHeures(24*(this.getMaxDays() - 16));
    dtLocalSplits = dtLocal.toJSON().split('-');
    dtLocal = new Date(dtLocalSplits[0] + '-' + dtLocalSplits[1] + '-01T00:00:00.000Z');
    return dtLocal.LocalToUtcDate(deltaTimeZone);
}
