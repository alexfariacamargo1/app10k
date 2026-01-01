
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Serviço de integração com a IA Gemini.
 * Note: O aviso 'node-domexception' é um alerta do ecossistema Node e não afeta este código no navegador.
 */

export const getFinancialAdvice = async (currentTotal: number, target: number, isCouple: boolean, isPremium: boolean = false) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = isPremium ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const premiumContext = isPremium 
      ? "Como usuário PREMIUM, forneça uma análise técnica detalhada com estratégias de investimento de baixo risco para o valor já acumulado." 
      : "Dê 3 dicas curtas e motivadoras de economia.";
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `O usuário está economizando dinheiro. Progresso atual: R$ ${currentTotal} de R$ ${target}. ${isCouple ? 'É um plano para casal.' : 'É um plano individual.'} ${premiumContext} Responda em português.`,
      config: {
        temperature: isPremium ? 0.4 : 0.7,
      }
    });

    return response.text || "Continue poupando para alcançar seus sonhos!";
  } catch (error) {
    // Usamos o tratamento nativo do navegador para erros
    console.error("Erro na consultoria de IA:", error instanceof Error ? error.message : "Erro desconhecido");
    return "Mantenha o foco nos seus objetivos financeiros! Cada real guardado é um passo rumo à sua liberdade.";
  }
};

export const generateCustomPlan = async (target: number, months: number = 12) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um plano de economia progressiva para atingir R$ ${target} em ${months} meses. Os valores mensais devem ser crescentes para começar fácil e terminar com desafio. Responda apenas o JSON puro.`,
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

    const data = JSON.parse(response.text || '{"values": []}');
    return data.values as number[];
  } catch (error) {
    console.error("Erro ao gerar plano customizado:", error instanceof Error ? error.message : "Erro desconhecido");
    return null;
  }
};