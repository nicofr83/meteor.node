import { Application } from "express";
import homeRoutes from "./home.routes";
import posteRoutes from "./poste.routes";

export default class MyRoutes {
  constructor(app: Application) {
    app.use("/", homeRoutes);
    app.use("/poste", posteRoutes);
  }
}