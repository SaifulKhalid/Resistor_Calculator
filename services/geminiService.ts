
import { GoogleGenAI, Type } from "@google/genai";
import { ResistorResult } from "../types";

/**
 * Clean base64 string for API
 */
const prepareBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const analyzeResistorImage = async (base64Image: string): Promise<ResistorResult | null> => {
  // Directly use process.env.API_KEY as per the strict structural guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an expert in electronics and computer vision.
    You are analyzing an image captured from a smartphone camera.

    TASK:
    Identify the 4-band axial resistor in the image.
    Determine the first 3 color bands from left-to-right (Digit 1, Digit 2, Multiplier).
    Calculate the total resistance in Ohms (Ω).

    EXPERT GUIDANCE:
    - Band 1: First significant figure.
    - Band 2: Second significant figure.
    - Band 3: Multiplier (Power of 10).
    - Axial resistors usually follow standard series (E12, E24). Use context to refine ambiguous colors (e.g., Red vs. Orange).
    - Ignore the tolerance band (Gold, Silver, or Brown on the far right).

    Respond in valid JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: prepareBase64(base64Image)
              }
            }
          ]
        }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 4000 }, // Enable reasoning to resolve visual ambiguities
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bands: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of the first three color band names"
            },
            resistance_ohms: {
              type: Type.NUMBER,
              description: "Total resistance in ohms"
            },
            formatted_value: {
              type: Type.STRING,
              description: "Human-readable value (e.g., 4.7kΩ)"
            },
            confidence: {
              type: Type.NUMBER,
              description: "AI confidence level (0-100)"
            }
          },
          required: ["bands", "resistance_ohms", "formatted_value", "confidence"]
        }
      }
    });

    const text = response.text || "";
    try {
      return JSON.parse(text) as ResistorResult;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text);
      return null;
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Specialized error handling for potential project/key availability issues
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("System configuration error. The expert vision service is currently unavailable.");
    }
    throw error;
  }
};
