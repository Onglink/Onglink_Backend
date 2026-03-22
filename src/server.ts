import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app'; 

const port = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI as string;

// Conexão com o Banco de Dados e Inicialização do Servidor
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Conexão com MongoDB Atlas estabelecida com sucesso!');
        
        // Inicia o servidor Express SOMENTE após a conexão com o banco
        app.listen(port, () => {
            console.log(`🚀 Servidor ONGLINK-DB rodando em http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('❌ Erro ao conectar ao MongoDB Atlas:', err.message);
        process.exit(1); 
    });