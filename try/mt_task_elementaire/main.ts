// main.ts
import { Worker } from 'worker_threads';

enum State {
    AVAILABLE = 0,
    RUNNING = 1,
    ERROR = 2
}

var state: State = State.AVAILABLE;
const waiting_list = [1,2,3,4,5] as number[];
var idx = 0;

const worker = new Worker('./worker.js');
var task: number = -1;

function wait_next() {
    if (state == State.AVAILABLE) {
        console.log('wait_next, state: ' + state);
        if (waiting_list.length == 0){
            console.log('all jobs done');
            process.exit(0);
        }
        task = waiting_list.shift() as number;
        state = State.RUNNING;
        console.log('Task ' + task + ' sent to worker');
        worker.postMessage(task);
    }
}

setInterval(() => {
    console.log('time_out, state: ' + state);
    wait_next();
}, 2000)

worker.on('message', (message) => {
    const messageJSON = JSON.parse(message);
    if (messageJSON['message'] == 'Task Done'){
        console.log('Job Done, Task: ' + messageJSON['taskId']);
        state = State.AVAILABLE;
        wait_next();
    } else {
        console.log('Message: ' + JSON.stringify(messageJSON));
    }
});
worker.on('error', (error) => {
    console.error(`received error event: ${error}`);
});
worker.on('exit', (code) => {
    console.log(`received exit event, task ${code}`);
    state = State.AVAILABLE;
    wait_next();
});
worker.on('online', () => {
    console.log(`received onLine event`);
});
worker.on('offline', () => {
    console.log(`received offLine event`);
});
