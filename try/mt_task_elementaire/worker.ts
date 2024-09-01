// worker.ts
import { MessagePort, parentPort } from 'worker_threads';

function performTask(data: object): void {
  const slotId = (data as any)['slotId'];
  const taskId = (data as any)['taskId'];
  console.log(`Task ${(data as any)['taskId']} in slot ${slotId} started`);
  // Simulate task execution
  setTimeout(() => {
    try {
      if ((slotId+1) % 3 == 0) {
        throw new Error('Error in ' + slotId + ', task ' + (data as any)['taskId']);
      }

    } catch (error: any) {
      // console.error(`      Task in slot ${slotId} failed: ${error.message}`);
      (parentPort as MessagePort).postMessage(JSON.stringify(
        {'status': 'Exception', 'slotId': slotId, 'message': error.message, 'exc': error.stack }
      ));
      return;
    }

    (parentPort as MessagePort).postMessage(JSON.stringify(
      { 'status': 'Task Done', 'slotId': slotId, 'dataCB': 'This is for the callback (task: ' + taskId + ')' }
    ));

  }, Math.random() * 2000);
  // console.log(`      Task ${taskId} waiting...`);
}

(parentPort as MessagePort).on('message', (data: object) => {
  // console.log(`      Task ${data} activated...`);
  performTask(data);
});
console.log('     (worker is alive)');
// setInterval(() => {
//   console.log('     (worker is alive)');
// }, 5000);
