import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
// import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

// Utility function imports
import { Poste } from '../repository/poste';
import 'reflect-metadata';
import { Container} from 'typedi';
import {Log} from "../tools/log.js";
import { DBOptions } from '../tools/db_interface';

const app = express();
const port = 3000;

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: 'your-username',
  host: 'localhost',
  database: 'your-database',
  password: 'your-password',
  port: 5432,
});

// Set up file upload handling with Multer (file storage configuration)
const upload = multer({ dest: 'tmp/' });

export async function uploadFile(req: Request, res: Response): Promise<Response>{
  const myLog = Container.get(Log) as Log
  let pgClient: any = null;
  let pgQueryResult: any = null;
  let meteor: string | null = null;
  let fileName: string | null = null;

  try {
    let jsonDir = process.env.JSON_AUTOLOAD as string;
    if (jsonDir == undefined) {
      jsonDir = './data/autoload';
    }
    const meteorRequested = req.query.meteor as string;
    fileName = req.query.filename as string;

    // Validate parameters
    if (!meteorRequested || !fileName) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    if (meteorRequested.includes("'") || meteorRequested.includes(";")) {
      return res.status(400).json({ error: 'Invalid meteor' });
    }

    // Handle DB connection
    try {
      pgQueryResult = await Poste.getOne(undefined,
        {
          'columns': ['meteor', 'api_key'],
          'where': "meteor like '" + meteorRequested + "'"
        } as DBOptions);

      if (pgQueryResult== undefined || pgQueryResult.data.meteor == undefined) {
        return res.status(400).json({ error: 'Invalid meteor' });
      }

      meteor = pgQueryResult.data.meteor as string;
      const apiKey = pgQueryResult.data.api_key as string;

      // Validate API key
      if (req.headers['x-api-key'] !== apiKey) {
        return res.status(401).json({ error: 'Invalid Credentials' });
      }

      // Ensure the directory exists
      const dirName = path.join(jsonDir, meteor);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      const fullFilePath = path.join(dirName, fileName);
      console.log(fullFilePath);
      
      // Check if the file already exists
      if (fs.existsSync(fullFilePath)) {
        return res.status(400).json({ error: 'File already exists' });
      }

      const tempFilePath = fullFilePath.replace('.json', '.tmp_json');

      upload.single(tempFilePath)(req, res, (err: any) => {
        console.log('multer callback: ',req.file, req.body)
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        console.dir(req);
        // Rename to final .json extension
        fs.renameSync(tempFilePath, fullFilePath);

        return res.status(200).json({ message: 'File uploaded successfully' });
      });

      // // Save file locally with the temporary name
      // fs.renameSync(req.file.path, tempFilePath);
      return res.status(200).json({ message: 'exit before file uploaded' });

    } catch (error: any) {
      // Handle DB connection errors
      myLog.exception("upload_file", error);
      return res.status(500).json({ error: error.message });
    } finally {
      if (pgClient) {
        pgClient.release();
      }
    }
  } catch (error: any) {
    // Catching other errors
    myLog.exception('uploadFile', error, { meteor, fileName });
    return res.status(500).json({ error: error.message });
  }
};


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