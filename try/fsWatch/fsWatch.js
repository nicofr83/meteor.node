"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
fs.watch(".", function (eventType, filename) {
    var files = fs.readdirSync(".");
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var aFile = files_1[_i];
        console.dir(aFile);
    }
    // console.dir(eventType);
    // console.dir(filename);
    // console.log('======================');
    // fs.rename(filename, filename.replace(".py", ".newpy"), () => {
    //     console.log;
    // });
});
setInterval(function () {
    console.log('    timeout');
}, 5000);
