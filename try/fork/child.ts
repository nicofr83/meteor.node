process.on('message', (msg: any) => {
    console.log('Message from parent:', msg);
    console.log("child: NICO :" + process.env.NICO)

  });
  
  let counter = 0;
  
  setInterval(() => {
    (process as any).send({ counter: counter++ });
    if (counter > 5){
        process.exit();
    }
  }, 1000);
