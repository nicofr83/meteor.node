// worker.ts
import { MessagePort, parentPort } from 'worker_threads';

function performTask(taskId: number): void {
  // Simulate task execution
  setTimeout(() => {
    try {
      console.log(`Task ${taskId} started`);
      if (taskId % 2 === 0) {
        throw new Error('Task ' + taskId + ' failed');
      }
    } catch (error: any) {
      console.error(`Task ${taskId} failed: ${error.message}`);
      (parentPort as MessagePort).postMessage(JSON.stringify(
        { 'message': 'Task ' + taskId + ' failed', 'exc': error.stack }
      ));
      throw error;
    }
    (parentPort as MessagePort).postMessage(JSON.stringify(
      { 'message': 'Task ' + taskId + ' Done'}
    ));
    process.exit(0);
  }, Math.random() * 5000);
  console.log(`Task ${taskId} waiting...`);
}

(parentPort as MessagePort).on('message', (taskId: number) => {
  console.log(`Task ${taskId} activated...`);
  performTask(taskId);
});
