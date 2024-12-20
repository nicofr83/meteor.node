import { Router } from "express";
import { uploadFile } from "../controllers/app.controller.js";
import multer from "multer";

const tmpDir = process.env.TMP_FILE === undefined ? './tmp' : process.env.TMP_FILE;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir) // Specify the directory for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Generate unique filenames
  }
});

// Set up file upload handling with Multer (file storage configuration)
const upload = multer({ storage });

class AppRoutes {
  router = Router();

  constructor() {
    this.router.post("/sendjson", upload.single('file'), uploadFile as any);
  }
}

export default new AppRoutes().router;
