import { Router } from "express";
import { checkMe } from "../controllers/home.controller.js";

class HomeRoutes {
  router = Router();

  constructor() {
    this.router.get("/check", checkMe);
  }
}

export default new HomeRoutes().router;
