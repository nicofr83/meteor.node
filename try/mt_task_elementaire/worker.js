// worker.ts
import { parentPort } from 'worker_threads';
function performTask(data) {
    const slotId = data['slotId'];
    const taskId = data['taskId'];
    console.log(`Task ${data['taskId']} in slot ${slotId} started`);
    // Simulate task execution
    setTimeout(() => {
        try {
            if ((slotId + 1) % 3 == 0) {
                throw new Error('Error in ' + slotId + ', task ' + data['taskId']);
            }
        }
        catch (error) {
            // console.error(`      Task in slot ${slotId} failed: ${error.message}`);
            parentPort.postMessage(JSON.stringify({ 'status': 'Exception', 'slotId': slotId, 'message': error.message, 'exc': error.stack }));
            return;
        }
        parentPort.postMessage(JSON.stringify({ 'status': 'Task Done', 'slotId': slotId, 'dataCB': 'This is for the callback (task: ' + taskId + ')' }));
    }, Math.random() * 2000);
    // console.log(`      Task ${taskId} waiting...`);
}
parentPort.on('message', (data) => {
    // console.log(`      Task ${data} activated...`);
    performTask(data);
});
console.log('     (worker is alive)');
// setInterval(() => {
//   console.log('     (worker is alive)');
// }, 5000);
//# sourceMappingURL=worker.js.map