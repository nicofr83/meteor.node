import { fork } from 'child_process';
const forked = fork('child.js');
forked.on('message', (msg) => {
    console.log('Message from child', msg);
});
forked.on('exit', (code) => {
    console.log('Child process exited with code', code);
});
forked.on('error', (err) => {
    console.log('Child process error', err);
});
console.log("index: NICO :" + process.env.NICO);
forked.send('hello world');
//# sourceMappingURL=index.js.map