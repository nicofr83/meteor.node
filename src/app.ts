import express, { Application, Request, Response } from "express";
import * as bodyParser from 'body-parser';
import * as dotenv from "dotenv"
import MyRoutes from "./routes/index"

const app: Application = express();

dotenv.config()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

new MyRoutes(app);

export default app;
