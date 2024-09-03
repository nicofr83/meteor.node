import express, { Application} from "express";
import bodyParser from 'body-parser'
import dotenv from "dotenv"
import MyRoutes from "./routes/index.js"

const app: Application = express();

dotenv.config({path: './config/.env.local'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

new MyRoutes(app);

export default app;
