import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
});

export async function geminiController(req: Request, res: Response) {
    try {
        // 1. O método retorna um objeto que contém a propriedade 'response'
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "O que é ONGLink?",
            config: {
                systemInstruction: "Onglink, trata-se de uma plataforma...",
            },
        });

        // 2. Acesse o método .text() de dentro do objeto response
        // O SDK garante que 'response' existe no resultado da promessa
        const text = response.text;

        return res.status(200).json({
            success: true,
            data: text
        });

    } catch (error) {
        console.error("Erro no Gemini:", error);
        return res.status(500).json({
            success: false,
            error: "Falha ao processar requisição com IA."
        });
    }
}