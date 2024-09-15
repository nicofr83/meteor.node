"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Date.prototype.UtcToLocalDate = function (deltaTimeZone) {
    return new Date(this.getTime() + deltaTimeZone * 3600 * 1000);
};
Date.prototype.LocalToUtcDate = function (deltaTimeZone) {
    return new Date(this.getTime() - deltaTimeZone * 3600 * 1000);
};
Date.prototype.getNextSlot = function (deltaTimeZone, nbDays) {
    return new Date(this.getTime() - deltaTimeZone * 3600 * 1000);
};
