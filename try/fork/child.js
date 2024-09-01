process.on('message', (msg) => {
    console.log('Message from parent:', msg);
    console.log("child: NICO :" + process.env.NICO);
});
let counter = 0;
setInterval(() => {
    process.send({ counter: counter++ });
    if (counter > 5) {
        process.exit();
    }
}, 1000);
export {};
//# sourceMappingURL=child.js.map