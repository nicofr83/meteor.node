"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runOnceSvc_js_1 = require("../runOnceSvc.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_watch_1 = __importDefault(require("node-watch"));
const jsonLoaderWorker_js_1 = require("./jsonLoaderWorker.js");
class LoadJson extends runOnceSvc_js_1.RunOnceSvc {
    timeOutTimer;
    bRenameTmpFile = false;
    autoLoadDir;
    archiveDir;
    noArchive;
    errorDir;
    lastFileProcessed;
    constructor() {
        super();
        const filePath = __filename.toString().split('/');
        this.name = filePath[filePath.length - 1];
        this.autoLoadDir = process.env.AUTOLOAD || './data/autoload';
        this.archiveDir = process.env.ARCHIVE || './data/archive';
        const tmpNoArch = process.env.NOARCHIVE || 'true';
        this.noArchive = JSON.parse(tmpNoArch);
        this.errorDir = process.env.ERROR || './data/error';
        this.lastFileProcessed = '';
        // other init
        this.timeOutTimer = undefined;
        // after 30 sec rename all *.json.tmp to *.json
        const that = this;
        setTimeout(async () => {
            that.bRenameTmpFile = true;
        }, 30000);
    }
    processFileWithConsole(evt, fileName) {
        console.log(`???? watch will call processFile for ${fileName} with this: ${typeof this}`);
        return this.processFile(evt, fileName);
    }
    async runMe(data) {
        const that = this;
        (0, node_watch_1.default)(that.autoLoadDir, { recursive: true }, await that.processFileWithConsole.bind(this));
        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise((f, reject) => {
            try {
                console.log('first call of setTimer');
                that.setTimer();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    setTimer() {
        if (this.timeOutTimer != undefined) {
            console.log('    setTimer allready set, returning');
            return;
        }
        console.log('==> reactivating the timer in setTimer');
        const that = this;
        this.timeOutTimer = setInterval(async () => {
            console.log('    Timer fired');
            const files = fs.readdirSync(that.autoLoadDir, { recursive: true });
            const tmpFiles = [];
            for await (const aFile of files) {
                if (aFile.lastIndexOf('.json') == aFile.length - 5) {
                    if (await that.processFile('update', that.autoLoadDir + '/' + aFile)) {
                        // NICO: Check the return is escaping the for loop
                        return;
                    }
                    // We need to rename .json.tmp to .json 1 minute after our start
                    // as cleverCloud will allow 2 instances to run during an update...
                    if (that.bRenameTmpFile && aFile.lastIndexOf('.json.tmp') == aFile.length - 9) {
                        tmpFiles.push(aFile);
                    }
                }
                for (const aTmpFile of tmpFiles) {
                    fs.renameSync(aTmpFile, aTmpFile.replace(".json.tmp", ".json"));
                }
            }
        }, 1000);
    }
    async processFile(evt, fileName) {
        console.log(`     processFile called with ${evt} ${fileName}`);
        if (evt == 'remove') {
            return false;
        }
        if (fileName == this.lastFileProcessed) {
            console.log(`    file processed, ${fileName} returning`);
            return false;
        }
        if (fileName.lastIndexOf('.json') != fileName.length - 5) {
            return false;
        }
        this.lastFileProcessed = fileName;
        if (this.timeOutTimer != undefined) {
            clearInterval(this.timeOutTimer);
            this.timeOutTimer = undefined;
            console.log('<== clearInterval in processFile');
        }
        else {
            console.log('    timeOutTimer is undefined in processFile');
        }
        const tmpFileName = fileName.replace('.json', '.json.tmp');
        try {
            // rename can fail if two instances are running
            fs.renameSync(fileName, tmpFileName);
        }
        catch (error) {
            // probably the other instance picked it up
            console.log('       setTimer will be called in catch-processFile, err:' + error.message);
            this.setTimer();
            return false;
        }
        const baseFileName = path.basename(tmpFileName);
        try {
            const jsonLoader = new jsonLoaderWorker_js_1.JsonLoaderWorker();
            console.log('    ---- calling our class with filename: ' + tmpFileName);
            await jsonLoader.processFile(tmpFileName);
            if (!this.noArchive) {
                fs.renameSync(tmpFileName, path.join(this.archiveDir, baseFileName));
            }
            else {
                fs.unlinkSync(tmpFileName);
            }
            return true;
        }
        catch (error) {
            fs.renameSync(tmpFileName, path.join(this.errorDir, baseFileName));
            throw error;
        }
        finally {
            console.log('        setTimer will be called in processFile, end of method');
            this.setTimer();
        }
    }
}
new LoadJson();
//# sourceMappingURL=loadJson.js.map