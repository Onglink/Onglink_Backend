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

// import swaggerFile from '../swagger-output.json' with { type: 'json' }
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
//app.options('/(.*)', cors(corsOptions)); // Sintaxe corrigida para capturar o preflight

// Middleware para parsear JSON
app.use(express.json());

// --- ROTAS PÚBLICAS ---
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
// Protege todas as rotas abaixo
app.use(apiKeyAuth);

// --- ROTAS PRIVADAS ---
app.use('/api/ongs', ongRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicacoes', publicacaoRoutes);
app.use('/api/denuncia', denunciaRoutes);
app.use('/api/parceiros', parceiroRoutes); // Rota duplicada foi unificada aqui
//app.use('/api/share-link', shareLinkRoutes);

// Exporta o app configurado para ser usado no server.ts
export default app;