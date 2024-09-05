import {JsonLoader} from './jsonLoader';

setTimeout(async () => {
    const jsonLoader = new JsonLoader();
    await jsonLoader.loadJsonFile('/Users/nico/projects/meteor.node/data/json/obs.MTG280.2022-07-10T10-10.json');
}, 0);
