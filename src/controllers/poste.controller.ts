import 'reflect-metadata';
import { Container } from 'typedi';
import { PosteMeteor } from '../metier/poste_meteor.js';
import { Request, Response } from "express";

// export function checkMe(req: Request, res: Response): Response{
//     return res.status(200).send({
//       message: 'I am alive!',
//     });
//   };
  
export async function getDumpedPostes(req: Request, res: Response): Promise<Response>{
    return res.status(200).send(await PosteMeteor.getDumpedPostes());
}
