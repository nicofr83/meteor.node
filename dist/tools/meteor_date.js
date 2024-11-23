"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meteorDate = void 0;
exports.meteorDate = true;
Date.prototype.addHeures = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};
Date.prototype.getMaxDays = function () {
    const m = this.getMonth() + 1;
    if ([1, 3, 5, 7, 8, 10, 12].indexOf(m) != -1) {
        return 31;
    }
    if (this.getFullYear() % 4 == 0 && m == 2) {
        return 29;
    }
    return (this.getMonth() == 2) ? 28 : 30;
};
Date.prototype.UtcToLocalDate = function (deltaTimeZone) {
    return new Date(this.getTime() + deltaTimeZone * 3600 * 1000);
};
Date.prototype.LocalToUtcDate = function (deltaTimeZone) {
    return new Date(this.getTime() - deltaTimeZone * 3600 * 1000);
};
Date.prototype.getNextDate = function (deltaTimeZone, nbDays) {
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
    dtLocal.addHeures(24 * (this.getMaxDays() - 16));
    dtLocalSplits = dtLocal.toJSON().split('-');
    dtLocal = new Date(dtLocalSplits[0] + '-' + dtLocalSplits[1] + '-01T00:00:00.000Z');
    return dtLocal.LocalToUtcDate(deltaTimeZone);
};
//# sourceMappingURL=meteor_date.js.map