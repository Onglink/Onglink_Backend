// models/SharedLink.js

const mongoose = require('mongoose');

// Define o esquema do documento que será salvo no MongoDB
const sharedLinkSchema = new mongoose.Schema({
  publicationId: String,     // ID da publicação que será compartilhada
  userId: String,            // ID do usuário que está compartilhando
  channel: String,           // Canal de compartilhamento (whatsapp, email, etc.)
  shortCode: String,         // Código curto gerado para o link
  createdAt: {               // Data de criação do link
    type: Date,
    default: Date.now
  }
});

// Exporta o modelo para ser usado em outras partes do projeto
module.exports = mongoose.model('SharedLink', sharedLinkSchema);