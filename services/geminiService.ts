import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWorldData = async (prompt?: string): Promise<GenerationResponse> => {
  try {
    const userPrompt = prompt || "Industrial warehouse interior";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a level designer for a game. Create a visual theme for an enclosed empty warehouse or factory floor (50x100 meters).
      
      Theme idea: "${userPrompt}".
      
      Return a JSON with:
      - Name & Description
      - Visuals:
        - groundColor (Hex, usually concrete greys, dark floors, or industrial colors)
        - skyColor (Hex, represents the ambient light or ceiling tint)
        - gridColor (Hex, structural beams or floor markings)
        - partColor (Hex, accents)
        - fogDensity (0.01 to 0.04)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            visuals: {
              type: Type.OBJECT,
              properties: {
                groundColor: { type: Type.STRING },
                skyColor: { type: Type.STRING },
                gridColor: { type: Type.STRING },
                partColor: { type: Type.STRING },
                fogDensity: { type: Type.NUMBER },
              },
              required: ["groundColor", "skyColor", "gridColor", "fogDensity", "partColor"]
            }
          },
          required: ["name", "description", "visuals"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");
    
    return JSON.parse(jsonText) as GenerationResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      name: "Connection Error",
      description: "Defaulting to warehouse.",
      visuals: {
        groundColor: "#808080",
        skyColor: "#222222",
        gridColor: "#555555",
        partColor: "#cccccc",
        fogDensity: 0.02
      }
    };
  }
};