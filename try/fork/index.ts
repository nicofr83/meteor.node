import { fork } from'child_process';

const forked = fork('child.js');

forked.on('message', (msg: any) => {
  console.log('Message from child', msg);
});
forked.on('exit', (code: any) => {
  console.log('Child process exited with code', code);
});
forked.on('error', (err: any) => {
    console.log('Child process error', err);
    });

console.log("index: NICO :" + process.env.NICO)
forked.send('hello world');