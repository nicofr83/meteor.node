import express, { Application, Request, Response } from "express";
import * as bodyParser from 'body-parser';
import * as dotenv from "dotenv"

const app: Application = express();

dotenv.config()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/check', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'I am alive!',
  });
});

app.post('/post', async (req: Request, res: Response): Promise<Response> => {
  console.log(req.body);
  return res.status(200).send({
    message: 'Hello World from post!',
  });
});

export default app;
