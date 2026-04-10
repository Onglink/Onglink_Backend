import { Request, Response, NextFunction } from 'express';
import {logger} from '../logger/logger-winston';

 export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start= Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            metodo: req.method,
      rota: req.originalUrl,
      status: res.statusCode,
      duracao_ms: duration,
      ip: req.ip,
      userAgent: req.get('user-agent') // Navegador/App que fez a requisição
    };
    // Decide o nível do log baseado no status HTTP
    if (res.statusCode >= 500) {
      logger.error(`[${req.method}] ${req.originalUrl} - ERRO SERVIDOR`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`[${req.method}] ${req.originalUrl} - ERRO CLIENTE`, logData);
    } else {
      logger.info(`[${req.method}] ${req.originalUrl} - SUCESSO`, logData);
    }
  });

  // O next() é OBRIGATÓRIO. Ele manda a requisição seguir em frente para a rota.
  next(); 
};


