import express from 'express';
import cors, { CorsOptions } from 'cors';
import swaggerUI from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
// import { createRequire } from 'node:module';

// Importação de Middlewares e Rotas

import { apiKeyAuth } from "./middleware/apiKeyAuth.js";
import { ongRoutes } from "./routes/ong.js";
import { usuarioRoutes } from "./routes/usuario.js";
import { publicacaoRoutes } from "./routes/publicacao.js";
import { denunciaRoutes } from "./routes/denuncia.js";
import { parceiroRoutes } from "./routes/parceiro.js";
import { geminiRoutes } from "./routes/geminiRoutes.js";

//import swaggerFile from '../swagger-output.json' with { type: 'json'};

import { Request, Response, NextFunction } from 'express'; // se já não tiver importado
import { logger } from './logger/logger-winston.js';

import { loggerMiddleware } from './middleware/loggerMiddleware.js';

// const require = createRequire(import.meta.url);
// const swaggerFile = require('../swagger-output.json');

// --- LEITURA DO SWAGGER ---
// Faz a leitura síncrona do JSON na raiz do projeto
const swaggerFile = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'swagger-output.json'), 'utf-8')
);


const app = express();

// --- CONFIGURAÇÃO DE CORS ---
const allowedOrigins = [
    'https://onglink.vercel.app', 
    'http://localhost:3000',
    'http://localhost:4000' 
];

const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permite todos os métodos que você usa
    credentials: true,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // Sintaxe corrigida para capturar o preflight

// Middleware para parsear JSON
app.use(express.json());

//middlerware de log
app.use(loggerMiddleware);

// --- ROTAS PÚBLICAS ---
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));
app.use('/api/gemini', geminiRoutes);
// Rota dedicada para manter o servidor acordado
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
// Protege todas as rotas abaixo
app.use(apiKeyAuth);

// --- ROTAS PRIVADAS ---
app.use('/api/ongs', ongRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicacoes', publicacaoRoutes);
app.use('/api/denuncia', denunciaRoutes);
app.use('/api/parceiros', parceiroRoutes);
 
//app.use('/api/share-link', shareLinkRoutes);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`[ERRO NÃO TRATADO] ${req.method} ${req.originalUrl}`, {
        erro_mensagem: err.message,
        stack: err.stack,
        body: req.body
    });

    res.status(500).json({ erro: "Erro interno do servidor" });
});
// Exporta o app configurado para ser usado no server.ts
export default app;