
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Removed global instantiation to follow the guideline of creating a new instance right before use
// for up-to-date API key retrieval.

export const getFinancialAdvice = async (currentTotal: number, target: number, isCouple: boolean, isPremium: boolean = false) => {
  try {
    // Fix: Using named parameter and direct process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = isPremium ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const premiumContext = isPremium ? "Como usuário PREMIUM, forneça uma análise técnica detalhada com estratégias de investimento de baixo risco para o valor já acumulado." : "Dê 3 dicas curtas e motivadoras.";
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `O usuário está economizando dinheiro. Progresso atual: R$ ${currentTotal} de R$ ${target}. ${isCouple ? 'É um plano para casal.' : 'É um plano individual.'} ${premiumContext} Responda em português.`,
      config: {
        temperature: isPremium ? 0.4 : 0.7,
      }
    });
    // Fix: Accessing .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Mantenha o foco nos seus objetivos financeiros! Cada real guardado é um passo rumo à sua liberdade.";
  }
};

export const generateCustomPlan = async (target: number, months: number = 12) => {
  try {
    // Fix: Using named parameter and direct process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um plano de economia progressiva para atingir R$ ${target} em ${months} meses. Os valores mensais devem ser crescentes para começar fácil e terminar com desafio. Responda apenas o JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            values: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Array com exatamente 12 valores numéricos que somam o objetivo."
            }
          },
          required: ["values"]
        }
      }
    });

    // Fix: Accessing .text property directly
    const data = JSON.parse(response.text || '{}');
    return data.values as number[];
  } catch (error) {
    console.error("Error generating plan:", error);
    return null;
  }
};
