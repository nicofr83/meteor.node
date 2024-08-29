// worker.ts
import { parentPort } from 'worker_threads';
function performTask(taskId) {
    // Simulate task execution
    setTimeout(() => {
        try {
            console.log(`Task ${taskId} started`);
            if (taskId % 2 === 0) {
                throw new Error('Task ' + taskId + ' failed');
            }
        }
        catch (error) {
            console.error(`Task ${taskId} failed: ${error.message}`);
            parentPort.postMessage(JSON.stringify({ 'message': 'Task ' + taskId + ' failed', 'exc': error.stack }));
            throw error;
        }
        parentPort.postMessage(JSON.stringify({ 'message': 'Task ' + taskId + ' Done' }));
        process.exit(0);
    }, Math.random() * 5000);
    console.log(`Task ${taskId} waiting...`);
}
parentPort.on('message', (taskId) => {
    console.log(`Task ${taskId} activated...`);
    performTask(taskId);
});
//# sourceMappingURL=worker.js.map