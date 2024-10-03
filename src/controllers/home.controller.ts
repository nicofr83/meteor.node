import { Request, Response } from "express";

export function checkMe(req: Request, res: Response): Response{
    return res.status(200).send({
      message: 'I am alive!',
    });
};
  
export async function checkMeAsync(req: Request, res: Response): Promise<Response>{
    return res.status(200).send({
        message: 'I am alive (async)!',
    });
};
  