"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonLoaderWorker_1 = require("./jsonLoaderWorker");
setTimeout(async () => {
    const jsonLoader = new jsonLoaderWorker_1.JsonLoaderWorker();
    await jsonLoader.loadJsonFile('/Users/nico/projects/meteor.node/data/json/obs.MTG280.2022-07-10T10-10.json');
}, 0);
//# sourceMappingURL=jsonLoaderWorkerRun.js.map