import { Router } from "express";
import { getDumpedPostes } from "../controllers/poste.controller.js";

class PosteRoutes {
  router = Router();

  constructor() {
    this.router.get("/getDumpedPostes", getDumpedPostes);
  }
}

export default new PosteRoutes().router;
