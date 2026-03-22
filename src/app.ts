import express from 'express';
import cors, { CorsOptions } from 'cors';
import swaggerUI from 'swagger-ui-express';
import { createRequire } from 'node:module';

// Importação de Middlewares e Rotas
import { apiKeyAuth } from "./middleware/apiKeyAuth";
import { ongRoutes } from "./routes/ong";
import { usuarioRoutes } from "./routes/usuario";
import { publicacaoRoutes } from "./routes/publicacao";
import { denunciaRoutes } from "./routes/denuncia";
import { parceiroRoutes } from "./routes/parceiro";

const require = createRequire(import.meta.url);
const swaggerFile = require('../swagger-output.json');

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
app.options('*', cors(corsOptions)); // Sintaxe corrigida para capturar o preflight

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