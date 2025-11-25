// controllers/shareLinkController.js

const { nanoid } = require('nanoid');
const SharedLink = require('../models/SharedLink');

// Função que gera o link e salva no banco
const generateShareLink = async (req, res) => {
  const { publicationId, userId, channel } = req.body;

  // Gera um código curto único
  const shortCode = nanoid(8);

  // Monta a URL final
  const shortUrl = `${process.env.BASE_URL}/p/${publicationId}?ref=${channel}&uid=${userId}&s=${shortCode}`;

  // Salva no banco
  await SharedLink.create({ publicationId, userId, channel, shortCode });

  // Retorna o link gerado
  res.json({ shortUrl });
};

module.exports = { generateShareLink };