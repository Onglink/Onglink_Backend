//const mongoose = require('mongoose')
//const Schema = mongoose.Schema

// --- 1. Sub-Schema para Endereço ---
const enderecoSchema = new Schema({
    numeroEnd: { type: String, required: true },
    complemento: { type: String },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    estado: {
        type: String,
        required: true,

    },
    cep: { type: String, required: true },
    rua: { type: String, required: true }
}, { _id: false, strict: true }); // Adicionado strict: true para subdocumento

// --- 2. Sub-Schema para Redes Sociais ---
const redeSocialSchema = new Schema({
    instagram: { type: String, required: true },
    facebook: { type: String, required: true },
    site: { type: String, required: true }
}, { _id: false, strict: true });

// --- 3. Schema Principal da ONG ---
const ongSchema = new Schema({

    razaoSocial: { type: String, required: true },
    nomeFantasia: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true }, // CNPJ é único
    cpf: { type: String, required: true },
    repLegal: { type: String, required: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Email deve ser único

    // Sub-documentos
    endereco: { type: enderecoSchema, required: true },
    redeSocial: { type: redeSocialSchema, required: true },

    // Outros Campos
    logo: { type: String, required: true },
    descricao: { type: String, required: true },
    dataFund: { type: Date, required: true },
    causaSocial: { type: String, required: true },

    // Arrays
    arquivosLegais: {
        type: [String],
        required: true
    },
    imagens: {
        type: [String],
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true, // Garante que a ONG tenha pelo menos 1 usuário atribuído ao ser criada
    }],
    situacaoCadastral:{
        type: String,
        enum: ['em analise', 'aprovada', 'rejeitada'],
        default: 'em analise'
    }
},

    {

        strict: true,
        timestamps: true, // Adiciona automaticamente 'createdAt' e 'updatedAt'


    });

module.exports = mongoose.model('Ong', ongSchema)