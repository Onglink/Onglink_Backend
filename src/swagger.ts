import swaggerAutogen from "swagger-autogen";
import fs from "fs";
//import { apiKeyAuth } from "./middleware/apiKeyAuth.ts";
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const doc = {
    info: {
        title: 'API Onglink',
        description: 'Documentação da API usando Swagger',
        version: packageJson.version
    },
    //host: 'localhost:4000',
    schemes: ['http'],
    securityDefinitions: {
        apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: process.env.API_KEY
        },
    },
    security: [{
        apiKeyAuth: []
    }],
    
 
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
    './routes/denuncia.ts',
    './routes/ong.ts', 
    './routes/publicacao.ts', 
    './routes/usuario.ts',
    
]

swaggerAutogen(outputFile, endpointsFiles, doc);