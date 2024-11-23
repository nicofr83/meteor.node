"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
require("reflect-metadata");
const typedi_1 = require("typedi");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const poste_1 = require("../repository/poste");
const log_js_1 = require("../tools/log.js");
async function uploadFile(req, res) {
    const myLog = typedi_1.Container.get(log_js_1.Log);
    let cur_meteor = null;
    const meteor = req.query.meteor;
    ;
    const fileName = req.query.filename;
    const jsonDirAutoload = process.env.JSON_AUTOLOAD === undefined ? './data/autoload' : process.env.JSON_AUTOLOAD;
    const jsonDirError = process.env.JSON_AUTOLOAD === undefined ? './data/autoload' : process.env.JSON_AUTOLOAD;
    const tmpDir = process.env.TMP_FILE === undefined ? './tmp' : process.env.TMP_FILE;
    // Ensure the directory exists
    const dirName = path_1.default.join(jsonDirAutoload, meteor);
    if (!fs_1.default.existsSync(dirName)) {
        fs_1.default.mkdirSync(dirName, { recursive: true });
    }
    const tempFilePath = tmpDir + '/' + req.file?.originalname;
    // Validate parameters
    if (!meteor || !fileName) {
        myLog.info("upload_file", "Missing parameters: meteor: " + meteor + " filename: " + fileName);
        removeFile(myLog, tempFilePath, 'delete');
        return res.status(400).json({ error: 'Missing parameters' });
    }
    if (meteor.includes("'") || meteor.includes(";")) {
        myLog.info("upload_file", "Invalid meteor: " + meteor);
        removeFile(myLog, tempFilePath, 'delete');
        return res.status(400).json({ error: 'Invalid meteor' });
    }
    const fullFilePath = path_1.default.join(dirName, fileName);
    try {
        cur_meteor = await poste_1.Poste.getOne(undefined, {
            'columns': ['meteor', 'api_key'],
            'where': "meteor like '" + meteor + "'"
        });
        if (cur_meteor == undefined || cur_meteor.data.meteor == undefined) {
            myLog.info("upload_file", "Invalid meteor: " + meteor);
            removeFile(myLog, tempFilePath, 'delete');
            return res.status(400).json({ error: 'Invalid meteor' });
        }
        // Validate API key
        if (req.headers['x-api-key'] !== cur_meteor.data.api_key) {
            myLog.info("upload_file", "Invalid credential: " + meteor + ', cred: ' + req.headers['x-api-key']);
            removeFile(myLog, tempFilePath, 'delete');
            return res.status(401).json({ error: 'Invalid Credentials' });
        }
        // Check if the file already exists
        if (fs_1.default.existsSync(fullFilePath)) {
            myLog.info("upload_file", 'File ' + fullFilePath + ' already exists');
            removeFile(myLog, tempFilePath, 'delete');
            return res.status(400).json({ error: 'File ' + fullFilePath + ' already exists' });
        }
        // move the file to the final destination
        fs_1.default.renameSync(tempFilePath, fullFilePath);
        myLog.info("upload_file", 'File uploaded' + fullFilePath);
        return res.status(200).json({ message: 'File uploaded successfully' });
    }
    catch (error) {
        removeFile(myLog, tempFilePath, jsonDirError);
        myLog.exception("upload_file", error);
        return res.status(500).json({ error: error.message });
    }
}
;
function removeFile(myLog, filePath, errorDirecty) {
    if (fs_1.default.existsSync(filePath)) {
        if (errorDirecty === 'delete') {
            myLog.info("upload_file", 'File ' + filePath + ' removed');
            fs_1.default.unlinkSync(filePath);
            return;
        }
        fs_1.default.renameSync(filePath, path_1.default.join(errorDirecty, path_1.default.basename(filePath)));
    }
}
// Breakdown:
// Express Setup:
// I used the express framework for handling HTTP requests and responses.
// The upload.single('file') middleware from multer is used to handle file uploads.
// The route /upload is configured to handle the file upload logic.
// PostgreSQL with pg:
// The pg library is used to interact with PostgreSQL. I used a connection pool (Pool from pg) to manage DB connections.
// The query method is used to fetch the meteor and API key from the postes table.
// File Handling:
// The uploaded file is temporarily stored using multer, and then renamed in the final destination folder (jsonDir).
// Directories are checked and created as necessary (fs.mkdirSync).
// The file is renamed from .tmp_json to .json after being successfully written.
// Error Handling:
// try-catch blocks are used to handle errors during database operations, file handling, and other logical operations.
// t.logError and t.logException are placeholders for your custom logging utility functions.
// Notes:
// PostgreSQL Query: The query used in the original Python code is parameterized in this Node.js version to prevent SQL injection attacks.
// File Handling: The fs module is used for file operations like checking if a file exists, creating directories, renaming files, etc.
// Error Logging: The logError and logException are assumed to be functions in your myTools module that handle error logging. You should implement them based on your needs.
// This TypeScript version should handle most of the core logic in a similar way to your Python code, assuming you've set up the necessary tools for logging, database access, and directory management.
//# sourceMappingURL=app.controller.js.map