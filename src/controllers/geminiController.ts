import { Request, Response } from 'express';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const model = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GOOGLE_API_KEY
});

export const geminiController = async (req: Request, res: Response) => {
  try {
    const { mensagem } = req.body; // Pega o texto enviado pelo usuário

    if (!mensagem) {
      return res.status(400).json({ error: "A mensagem é obrigatória." });
    }

    const response = await model.invoke(mensagem);

    return res.status(200).json({
      sucesso: true,
      resposta: response.content
    });

  } catch (error: any) {
    console.error("DETALHE DO ERRO:", error.response?.data || error.message);
   return res.status(500).json({ 
    error: "Erro ao processar com a IA.",
    detalhe: error.message 
  });
  }
};