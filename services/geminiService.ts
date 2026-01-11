
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GardenConfig, DEFAULT_CONFIG } from '../types';

export const generateGardenConfig = async (prompt: string): Promise<GardenConfig> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found, returning default config.");
    return DEFAULT_CONFIG;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      theme: {
        type: Type.OBJECT,
        properties: {
          primaryColor: { type: Type.STRING, description: "Hex color for main petals (e.g. Silk White, Deep Blue)" },
          secondaryColor: { type: Type.STRING, description: "Hex color for accents (e.g. Gold, Silver)" },
          stemColor: { type: Type.STRING, description: "Hex color for the wire/stem structure" },
          backgroundColor: { type: Type.STRING, description: "Hex color for the dreamscape background" },
          bloomIntensity: { type: Type.NUMBER, description: "Intensity of the glow effect (1.5 to 4.0)" },
          metalness: { type: Type.NUMBER, description: "Material metalness (0.0 to 1.0)" },
          roughness: { type: Type.NUMBER, description: "Material roughness (0.0 to 1.0)" },
        },
        required: ["primaryColor", "secondaryColor", "stemColor", "backgroundColor", "bloomIntensity", "metalness", "roughness"]
      },
      flowerCount: { type: Type.INTEGER, description: "Number of flowers (15 to 60)" },
      wildness: { type: Type.NUMBER, description: "Chaos factor (0.0 to 1.0)" },
      heightScale: { type: Type.NUMBER, description: "Vertical scale (0.8 to 2.5)" },
      name: { type: Type.STRING, description: "A poetic name for this garden" },
      description: { type: Type.STRING, description: "Short description of the visual mood" }
    },
    required: ["theme", "flowerCount", "wildness", "heightScale", "name", "description"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a configuration for a 3D digital garden inspired by 'Chan Hua' (Traditional Chinese Silk Wrapped Flowers) and 'Dreamcore' aesthetics.
      
      User Prompt: "${prompt}"

      Visual Style Guidelines:
      - The look is 'Gaussian Splatting' particles, glittering, and ethereal.
      - Colors should be elegant (e.g., Deep Blues, Golds, Pearl Whites, Black).
      - If prompt is vague, default to a 'Royal Klein Blue & Gold' theme.
      - High bloom intensity.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as GardenConfig;
  } catch (error) {
    console.error("Failed to generate garden config:", error);
    return DEFAULT_CONFIG;
  }
};
