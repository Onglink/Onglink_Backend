import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "process.env.GEMINI_API_KEY"
});

export async function geminiController() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}
