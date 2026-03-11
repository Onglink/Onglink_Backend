import { Request, Response, NextFunction } from 'express';
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-api-key']

    if(!key || key != process.env.API_KEY){
        return res.status(403).json({message:'API key inválida ou ausente'})
    }

    next();
}