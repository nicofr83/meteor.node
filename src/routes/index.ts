import { Application } from "express";
import homeRoutes from "./home.routes.js";
import posteRoutes from "./poste.routes.js";

export default class MyRoutes {
  constructor(app: Application) {
    app.use("/", homeRoutes);
    app.use("/poste", posteRoutes);
  }
}