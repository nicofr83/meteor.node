import * as fs from "fs";

fs.watch(".", (eventType:any, filename:string) => {
    const files = fs.readdirSync("./*.json");
    for (const aFile of files) {
        console.dir(aFile);
    }
    // console.dir(eventType);
    // console.dir(filename);
    // console.log('======================');
    // fs.rename(filename, filename.replace(".py", ".newpy"), () => {
    //     console.log;
    // });
});
setInterval( () => {
    console.log('    timeout');
}, 5000);
