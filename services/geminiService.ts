
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFashionAssistantResponse = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      systemInstruction: "You are a luxury fashion consultant. Help users find brands, understand styles, and manage their wardrobe. Keep answers elegant, concise, and helpful.",
    },
  });
  return response.text;
};

export const parseWardrobeItem = async (input: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse this wardrobe item description into a structured JSON: "${input}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, description: "One of: Tops, Bottoms, Outerwear, Shoes, Accessories" },
          color: { type: Type.STRING },
          brand: { type: Type.STRING }
        },
        required: ["name", "category", "color"]
      },
      systemInstruction: "Extract clothing item details from user text. If brand is mentioned, extract it. Otherwise leave empty.",
    },
  });
  try {
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
};
