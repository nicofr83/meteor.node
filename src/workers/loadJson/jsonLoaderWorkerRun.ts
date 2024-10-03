import {JsonLoaderWorker} from './jsonLoaderWorker';

setTimeout(async () => {
    const jsonLoader = new JsonLoaderWorker();
    await jsonLoader.loadJsonFile('/Users/nico/projects/meteor.node/data/json/obs.MTG280.2022-07-10T10-10.json');
}, 0);
