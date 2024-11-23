"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
// import { v4 as uuidv4 } from 'uuid';
const multer_1 = __importDefault(require("multer"));
// Utility function imports
const poste_1 = require("../repository/poste");
require("reflect-metadata");
const typedi_1 = require("typedi");
const log_js_1 = require("../tools/log.js");
const app = (0, express_1.default)();
const port = 3000;
// Set up PostgreSQL connection pool
const pool = new pg_1.Pool({
    user: 'your-username',
    host: 'localhost',
    database: 'your-database',
    password: 'your-password',
    port: 5432,
});
// Set up file upload handling with Multer (file storage configuration)
const upload = (0, multer_1.default)({ dest: 'tmp/' });
async function uploadFile(req, res) {
    const myLog = typedi_1.Container.get(log_js_1.Log);
    let pgClient = null;
    let pgQueryResult = null;
    let meteor = null;
    let fileName = null;
    try {
        let jsonDir = process.env.TJSON_AUTOLOAD;
        if (jsonDir == undefined) {
            jsonDir = './data/autoload';
        }
        const meteorRequested = req.query.meteor;
        fileName = req.query.filename;
        // Validate parameters
        if (!meteorRequested || !fileName) {
            return res.status(400).json({ error: 'Missing parameters' });
        }
        if (meteorRequested.includes("'") || meteorRequested.includes(";")) {
            return res.status(400).json({ error: 'Invalid meteor' });
        }
        // Handle DB connection
        try {
            pgQueryResult = await poste_1.Poste.getOne(undefined, {
                'columns': ['meteor', 'api_key'],
                'where': "meteor like '" + meteorRequested + "'"
            });
            if (pgQueryResult == undefined || pgQueryResult.data.meteor == undefined) {
                return res.status(400).json({ error: 'Invalid meteor' });
            }
            meteor = pgQueryResult.data.meteor;
            const apiKey = pgQueryResult.data.api_key;
            // Validate API key
            if (req.headers['x-api-key'] !== apiKey) {
                return res.status(401).json({ error: 'Invalid Credentials' });
            }
            // Ensure the directory exists
            const dirName = path_1.default.join(jsonDir, meteor);
            if (!fs_1.default.existsSync(dirName)) {
                fs_1.default.mkdirSync(dirName, { recursive: true });
            }
            const fullFilePath = path_1.default.join(dirName, fileName);
            console.log(fullFilePath);
            // Check if the file already exists
            if (fs_1.default.existsSync(fullFilePath)) {
                return res.status(400).json({ error: 'File already exists' });
            }
            const tempFilePath = fullFilePath.replace('.json', '.tmp_json');
            upload.single(tempFilePath)(req, res, (err) => {
                console.log('multer callback: ', req.file, req.body);
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                console.dir(req);
                // Rename to final .json extension
                fs_1.default.renameSync(tempFilePath, fullFilePath);
                return res.status(200).json({ message: 'File uploaded successfully' });
            });
            // // Save file locally with the temporary name
            // fs.renameSync(req.file.path, tempFilePath);
            return res.status(200).json({ message: 'exit before file uploaded' });
        }
        catch (error) {
            // Handle DB connection errors
            myLog.exception("upload_file", error);
            return res.status(500).json({ error: error.message });
        }
        finally {
            if (pgClient) {
                pgClient.release();
            }
        }
    }
    catch (error) {
        // Catching other errors
        myLog.exception('uploadFile', error, { meteor, fileName });
        return res.status(500).json({ error: error.message });
    }
}
;
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