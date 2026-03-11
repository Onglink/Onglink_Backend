import 'dotenv/config';
import cors from 'cors';
import express from 'express';
const app = express();
const port = 4000;

// --- CONFIGURAÇÃO DE CORS (Refatorada) ---
// Lista de origens permitidas
const allowedOrigins = [
    'https://onglink.vercel.app', // URL de produção do seu Front-end
    'http://localhost:3000',
    'http://localhost:4000'         // URL de desenvolvimento local (Next.js)
];

const corsOptions = {
    origin: function (origin: any, callback: any) {
        // Permite requisições sem 'origin' (ex: Postman, apps mobile) E 
        // requisições da sua whitelist
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

// Aplica as opções de CORS ANTES de todas as outras rotas
app.use(cors(corsOptions));
app.options(/'*'/, cors(corsOptions));
// ------------------------------------------

// Middleware para parsear JSON
app.use(express.json());


import mongoose from 'mongoose';

// Importando middleware e swagger
import { apiKeyAuth } from "./src/middleware/apiKeyAuth.ts";
import swaggerUI from 'swagger-ui-express';
import swaggerFile from './swagger-output.json' with { type: 'json' };

// Rota do Swagger (Pública, ANTES da autenticação)
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));

import { parceiroRoutes } from "./src/routes/parceiro.ts";
app.use('/api/parceiros', parceiroRoutes);

// Middleware de autenticação (Protege todas as rotas abaixo)
app.use(apiKeyAuth);

const MONGO_URI = process.env.MONGO_URI as string;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Conexão com MongoDB Atlas estabelecida com sucesso!');
        
        // Inicia o servidor Express SOMENTE após a conexão com o banco
        app.listen(port, () => {
            console.log(`🚀 Servidor ONGLINK-DB rodando em http://localhost:${port}`);
        });
    })
    .catch((err:any) => {
        console.error('❌ Erro ao conectar ao MongoDB Atlas:', err.message);
        process.exit(1); 
    });

// Rotas da API
import { ongRoutes } from "./src/routes/ong.ts";
import { usuarioRoutes } from "./src/routes/usuario.ts";
import { publicacaoRoutes } from "./src/routes/publicacao.ts";
import { denunciaRoutes } from "./src/routes/denuncia.ts";
import { assert } from 'node:console';
//const shareLinkRoutes = require('./routes/shareLinkRoutes');


app.use('/api/ongs', ongRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicacoes', publicacaoRoutes);
app.use('/api/denuncia', denunciaRoutes);
app.use('/api/parceiros', parceiroRoutes);
//app.use('/api/share-link', shareLinkRoutes);



// Configuração do CORS
//app.use(cors({
//origin: allowedOrigins,
  //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permite todos os métodos que você usa
  //credentials: true, // Importante se você usa cookies ou sessões
//}));
