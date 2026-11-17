import { Request, Response } from 'express';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export const geminiController = async (req: Request, res: Response) => {
  try {
    const { mensagem, historico } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: "A mensagem é obrigatória." });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GOOGLE_API_KEY não configurada no servidor." });
    }

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.8-flash",
      apiKey,
      maxRetries: 1, // Evita que o LangChain fique preso tentando por mais de 60s
    });

    const instrucaoSistema = new SystemMessage(`
      Você é o Assistente Virtual Oficial da plataforma Onglink. 
      Sua missão é ajudar usuários e visitantes com dúvidas sobre a plataforma, ONGs e assistência social.
      Seja educado, claro e direto. Se não souber algo, diga que está em treinamento.
    `);

    const mensagensChat: any[] = [instrucaoSistema];

    if (historico && Array.isArray(historico)) {
      historico.forEach((msg: any) => {
        if (msg.role === 'usuario') {
          mensagensChat.push(new HumanMessage(msg.content));
        } else if (msg.role === 'bot') {
          mensagensChat.push(new AIMessage(msg.content));
        }
      });
    }

    mensagensChat.push(new HumanMessage(mensagem));

    const response = await model.invoke(mensagensChat);

    return res.status(200).json({
      sucesso: true,
      resposta: response.content
    });

  } catch (error: any) {
    console.error("DETALHE DO ERRO:", error.response?.data || error.message);
    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({
        error: "Limite diário de mensagens da IA atingido. Tente novamente mais tarde.",
        detalhe: error.message
      });
    }
    return res.status(500).json({ 
      error: "Erro ao processar com a IA.",
      detalhe: error.message 
    });
  }
};