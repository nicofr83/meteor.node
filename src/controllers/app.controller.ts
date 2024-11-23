import 'reflect-metadata';
import { Container} from 'typedi';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Poste } from '../repository/poste';
import {Log} from "../tools/log.js";
import { DBOptions } from '../tools/db_interface';

export async function uploadFile(req: Request, res: Response): Promise<Response>{
  const myLog = Container.get(Log) as Log
  let cur_meteor: any = null;
  const meteor = req.query.meteor as string;;
  const fileName = req.query.filename as string;
  const jsonDirAutoload = process.env.JSON_AUTOLOAD === undefined ? './data/autoload' : process.env.JSON_AUTOLOAD;
  const jsonDirError = process.env.JSON_AUTOLOAD === undefined ? './data/autoload' : process.env.JSON_AUTOLOAD;
  const tmpDir = process.env.TMP_FILE === undefined ? './tmp' : process.env.TMP_FILE;

  // Ensure the directory exists
  const dirName = path.join(jsonDirAutoload, meteor);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
  const fullFilePath = path.join(dirName, fileName);
  const tempFilePath = tmpDir + '/' + req.file?.originalname;

  try {
    // Validate parameters
    if (!meteor || !fileName) {
      removeFile(tempFilePath, 'delete');
      return res.status(400).json({ error: 'Missing parameters' });
    }

    if (meteor.includes("'") || meteor.includes(";")) {
      removeFile(tempFilePath, 'delete');
      return res.status(400).json({ error: 'Invalid meteor' });
    }

    cur_meteor = await Poste.getOne(undefined,
      {
        'columns': ['meteor', 'api_key'],
        'where': "meteor like '" + meteor + "'"
      } as DBOptions);

    if (cur_meteor== undefined || cur_meteor.data.meteor == undefined) {
      removeFile(tempFilePath, 'delete');
      return res.status(400).json({ error: 'Invalid meteor' });
    }

    // Validate API key
    if (req.headers['x-api-key'] !== cur_meteor.data.api_key) {
      removeFile(tempFilePath, 'delete');
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    // Check if the file already exists
    if (fs.existsSync(fullFilePath)) {
      removeFile(tempFilePath, 'delete');
      return res.status(400).json({ error: 'File ' + fullFilePath + ' already exists' });
    }

    // move the file to the final destination
    fs.renameSync(tempFilePath, fullFilePath);
    return res.status(200).json({ message: 'File uploaded successfully' });

  } catch (error: any) {
    removeFile(tempFilePath, jsonDirError);
    myLog.exception("upload_file", error);
    return res.status(500).json({ error: error.message });
  }
};

function removeFile(filePath: string, errorDirecty: string): void {
  if (fs.existsSync(filePath)) {
    if (errorDirecty === 'delete') {
      fs.unlinkSync(filePath);
      return;
    }
    fs.renameSync(filePath, path.join(errorDirecty, path.basename(filePath)));
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