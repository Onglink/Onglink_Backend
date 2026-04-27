import { Request, Response } from 'express';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GOOGLE_API_KEY
});

export const geminiController = async (req: Request, res: Response) => {
  try {
    // Agora esperamos receber a nova mensagem E o histórico da conversa
    const { mensagem, historico } = req.body; 

    if (!mensagem) {
      return res.status(400).json({ error: "A mensagem é obrigatória." });
    }

    // Define a "Personalidade" do assistente
    const instrucaoSistema = new SystemMessage(`
      Você é o Assistente Virtual Oficial da plataforma Onglink. 
      Sua missão é ajudar usuários e visitantes com dúvidas sobre a plataforma, ONGs e assistência social.
      Seja educado, claro e direto. Se não souber algo, diga que está em treinamento.
    `);

    // Inicia o array de mensagens com a instrução de sistema
    const mensagensChat: any[] = [instrucaoSistema];

    // Se o frontend enviou um histórico, nós o reconstruímos para a IA lembrar da conversa
    if (historico && Array.isArray(historico)) {
      historico.forEach((msg: any) => {
        if (msg.role === 'usuario') {
          mensagensChat.push(new HumanMessage(msg.content));
        } else if (msg.role === 'bot') {
          mensagensChat.push(new AIMessage(msg.content));
        }
      });
    }

    // Adiciona a pergunta atual do usuário no final do array
    mensagensChat.push(new HumanMessage(mensagem));

    // Envia o contexto inteiro (Sistema + Histórico + Nova Mensagem) para o Gemini
    const response = await model.invoke(mensagensChat);

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