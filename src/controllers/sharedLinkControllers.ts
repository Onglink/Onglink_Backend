import { Request, Response } from 'express';
import crypto from 'crypto';
import  SharedLink  from '../models/shareLinkModel';

 // Biblioteca nativa do Node (Zero risco)

const generateShareLink = async (req: Request, res: Response) => {
  try {
    const { publicationId, userId, channel } = req.body;

    // Gera um código aleatório de 8 caracteres usando o próprio Node.js
    const shortCode = crypto.randomBytes(4).toString('hex');

    // Usa a URL do Front que está no .env ou um fallback seguro
    // IMPORTANTE: Ajuste o fallback para o seu link real da Vercel se quiser
    const baseUrl = process.env.BASE_URL_FRONT || 'https://onglink.vercel.app'; // Ajuste aqui se souber a URL exata
    
    // Monta a URL
    const shortUrl = `${baseUrl}/post/${publicationId}?ref=${channel}&uid=${userId}&s=${shortCode}`;

    await SharedLink.create({ publicationId, userId, channel, shortCode });

    res.json({ shortUrl });
  } catch (error) {
    console.error("Erro no ShareLink:", error);
    res.status(500).json({ error: "Erro ao gerar link" });
  }
};

module.exports = { generateShareLink };

  export default generateShareLink;