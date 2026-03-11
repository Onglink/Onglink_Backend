import mongoose, {model} from "mongoose";
const Schema_publi = mongoose.Schema


// --- 1. Schema Principal de publicação ---
const publicacaoSchema = new Schema_publi({
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

const Publicacao = model('Publicacao', publicacaoSchema, 'publicacoes');
export default Publicacao;