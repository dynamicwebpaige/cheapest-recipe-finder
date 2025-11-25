import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { SearchResult, Coordinates, GroundingChunk } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export interface GeminiResponse {
  data: SearchResult | null;
  groundingLinks: { title: string; uri: string }[];
  rawText: string;
}

export const fetchRecipeSources = async (
  recipe: string,
  location: Coordinates
): Promise<GeminiResponse> => {
  try {
    const prompt = `I am located at Latitude: ${location.lat}, Longitude: ${location.lng}.
    I want to make: "${recipe}".
    Find the cheapest places nearby to buy the necessary ingredients.
    Return the output in the specified JSON format inside a code block.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // We cannot use responseMimeType: 'application/json' with tools, so we rely on the prompt.
      },
    });

    const text = response.text || "";
    let parsedData: SearchResult | null = null;
    
    // Attempt to extract JSON from code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
      }
    } else {
        // Fallback: try to parse the whole text if it looks like JSON
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
             console.warn("Could not find JSON block in response");
        }
    }

    // Extract Grounding Metadata
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const groundingLinks = groundingChunks
      .map((chunk: GroundingChunk) => {
        if (chunk.web) {
          return { title: chunk.web.title, uri: chunk.web.uri };
        }
        return null;
      })
      .filter((link): link is { title: string; uri: string } => link !== null);

    return {
      data: parsedData,
      groundingLinks,
      rawText: text,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
