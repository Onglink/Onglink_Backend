const mongoose_denuncia = require('mongoose')
const Schema_denuncia = mongoose_denuncia.Schema

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
        type: mongoose_denuncia.Schema.Types.ObjectId,
        ref: 'Publicacao',
        required: true,
    }],
},
    {
        strict: true,
        timestamps: true, // Adiciona automaticamente 'createdAt' e 'updatedAt'

    })

module.exports = mongoose_denuncia.model("Denuncia", denunciaSchema);