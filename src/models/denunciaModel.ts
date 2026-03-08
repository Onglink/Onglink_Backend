//const mongoose = require('mongoose')
//const Schema = mongoose.Schema

const denunciaSchema = new Schema({
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

module.exports = mongoose.model("Denuncia", denunciaSchema);