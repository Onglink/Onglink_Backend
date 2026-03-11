const mongoose_publi = require('mongoose')
const Schema_publi = mongoose_publi.Schema


// --- 1. Schema Principal de publicação ---
const publicacaoSchema = new Schema_publi({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    imagem:[{type: String, required: true}],
    criadoPor: {
    type: mongoose_publi.Schema.Types.ObjectId,
    ref: 'Usuario',
    required:true
  }
},


{ 
    strict: true, 
    timestamps: true 
});

module.exports = mongoose_publi.model('Publicacao', publicacaoSchema, 'publicacoes')