const mongoose = require('mongoose')
const Schema = mongoose.Schema


// --- 1. Schema Principal de usuário ---
const userSchema = new Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase:true, trim:true }, // Email deve ser único
    status:{type: String, enum:['user','admin','ong'], default:'user'},
    senha:{type:String, required: true, select: false},
    assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ong',
    default: null, // Opcional, será preenchido na validação
  }
},


{ 
    strict: true, 
    timestamps: true 
});

module.exports = mongoose.model('Usuario', userSchema)