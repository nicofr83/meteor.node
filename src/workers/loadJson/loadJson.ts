import { RunOnceSvc } from '../runOnceSvc.js';
import * as fs from "fs";
import * as path from "path";
import watch from "node-watch";
import { JsonLoader } from "./jsonLoader.js";

class LoadJson extends RunOnceSvc {
    private timeOutTimer: NodeJS.Timeout|undefined;
    private bRenameTmpFile = false;
    private autoLoadDir: string;
    private archiveDir: string;
    private noArchive: boolean;
    private errorDir: string;
    private lastFileProcessed: string;

    constructor() {
        super();
        const filePath = __filename.toString().split('/');
        this.name =filePath[filePath.length - 1];
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
        setTimeout( async () => {
            that.bRenameTmpFile = true;
        }, 30000);
    }

    public processFileWithConsole(evt: string, fileName: string) {
        console.log(`???? watch will call processFile for ${fileName} with this: ${typeof this}`);
        return this.processFile(evt, fileName);
    }
    public async runMe(data: any): Promise<object|undefined> {
        const that = this;
        watch(that.autoLoadDir, {recursive: true}, await that.processFileWithConsole.bind(this));

        // this.log(LogType.INFO, `in SvcTest : ${JSON.stringify(data)}`);
        return new Promise<object|undefined>((f, reject) => {
            try {
                console.log('first call of setTimer');
                that.setTimer();

            } catch(error: any) {
                reject(error);
            }
        });
    }
    private setTimer() {
        if (this.timeOutTimer != undefined) {
            console.log('    setTimer allready set, returning');
            return;
        }
        console.log('==> reactivating the timer in setTimer');
        const that = this;
        this.timeOutTimer = setInterval( async () => {
            console.log('    Timer fired');

            const files = fs.readdirSync(that.autoLoadDir, {recursive: true}) as string[];
            const tmpFiles = [] as string[];

            for await (const aFile of files){
                if (aFile.lastIndexOf('.json') == aFile.length - 5) {
                    if (await that.processFile('update', that.autoLoadDir + '/' + aFile)){
// NICO: Check the return is escaping the for loop
                        return;
                    }
                    // We need to rename .json.tmp to .json 1 minute after our start
                    // as cleverCloud will allow 2 instances to run during an update...
                    if (that.bRenameTmpFile && aFile.lastIndexOf('.json.tmp') == aFile.length - 9) {
                        tmpFiles.push(aFile);
                    } 
                }
                for (const aTmpFile of tmpFiles){
                    fs.renameSync(aTmpFile, aTmpFile.replace(".json.tmp", ".json"));
                }
            }
        }, 1000);
    }

    public async processFile(evt: string, fileName: string): Promise<boolean> {
        console.log(`     processFile called with ${evt} ${fileName}`);
        if (evt == 'remove'){
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
        } else {
            console.log('    timeOutTimer is undefined in processFile');
        }
        const tmpFileName = fileName.replace('.json', '.json.tmp');
        try {
            // rename can fail if two instances are running
            fs.renameSync(fileName, tmpFileName);
        } catch(error: any) {
            // probably the other instance picked it up
            console.log('       setTimer will be called in catch-processFile, err:' + error.message);
            this.setTimer();
            return false;
        }

        const baseFileName = path.basename(tmpFileName);
        try {
            const jsonLoader = new JsonLoader();
            console.log('    ---- calling our class with filename: ' + tmpFileName);
            await jsonLoader.processFile(tmpFileName)

            if (!this.noArchive) {
                fs.renameSync(tmpFileName, path.join(this.archiveDir, baseFileName));
            } else {
                fs.unlinkSync(tmpFileName);
            }
            return true;
        } catch(error){
            fs.renameSync(tmpFileName, path.join(this.errorDir, baseFileName));
            throw error;
        } finally {
            console.log('        setTimer will be called in processFile, end of method');
            this.setTimer();
        }
    }
}
new LoadJson();
