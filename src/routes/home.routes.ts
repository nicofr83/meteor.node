import { Router } from "express";
import { checkMe, checkMeAsync, home } from "../controllers/home.controller.js";

class HomeRoutes {
  router = Router();

  constructor() {
    this.router.get("/", home as any);
    this.router.get("/check", checkMe as any);
    this.router.get("/checkAsync", checkMeAsync as any);
  }
}

export default new HomeRoutes().router;
