const mongoose = require('mongoose')
const Schema = mongoose.Schema


// --- 1. Schema Principal de publicação ---
const publicacaoSchema = new Schema({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    imagem:[{type: String, required: true}],
    criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required:true
  }
},


{ 
    strict: true, 
    timestamps: true 
});

module.exports = mongoose.model('Publicacao', publicacaoSchema, 'publicacoes')