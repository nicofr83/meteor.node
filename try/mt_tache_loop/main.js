// main.ts
import { Worker } from 'worker_threads';
const NUM_TASKS = 5;
for (let i = 1; i <= NUM_TASKS; i++) {
    const worker = new Worker('./worker.js');
    worker.postMessage(i);
    console.log('Task ' + i + ' sent to worker');
    worker.on('message', (message) => {
        const messageJSON = JSON.parse(message);
        messageJSON['reason'] = 'message';
        console.dir(messageJSON);
    });
    worker.on('error', (error) => {
        console.error(`received error event: ${error}`);
    });
    worker.on('exit', (code) => {
        console.log(`received exit event, task ${code}`);
    });
    worker.on('online', () => {
        console.log(`received onLine event, task ${i}`);
    });
    worker.on('offline', () => {
        console.log(`received offLine event, task ${i}`);
    });
}
//# sourceMappingURL=main.js.map