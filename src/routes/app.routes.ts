import { Router } from "express";
import { uploadFile } from "../controllers/app.controller.js";

class AppRoutes {
  router = Router();

  constructor() {
    this.router.post("/sendjson", uploadFile as any);
  }
}

export default new AppRoutes().router;
