import mongoose, {model} from 'mongoose';
const Schema_denuncia = mongoose.Schema

const denunciaSchema = new Schema_denuncia({
    tipoDenuncia: {
        type: String,
        enum: [
            'Conteudo sensível',
            'Conteúdo sexual',
            'Conteúdo violento ou repulsivo',
            'incitação ao ódio',
            'Desinformação',
            'Abuso infantil'
        ],
        required: true
    },

    motivo: { type: String, required: true },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publicacao',
        required: true,
    }],
},
    {
        strict: true,
        timestamps: true, // Adiciona automaticamente 'createdAt' e 'updatedAt'

    })

const Denuncia = model("Denuncia", denunciaSchema);
export default Denuncia;