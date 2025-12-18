
import { GoogleGenAI, Type } from "@google/genai";
import { ResistorResult } from "../types";

/**
 * Clean base64 string for API
 */
const prepareBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const analyzeResistorImage = async (base64Image: string): Promise<ResistorResult | null> => {
  const apiKey = process.env.API_KEY;

  // Deployment guard to help users debug environment variable issues
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("Missing API_KEY. Please ensure the 'API_KEY' environment variable is set in your deployment dashboard.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a world-class senior electronics engineer and computer vision expert.
    Analyze this smartphone image of an axial resistor.

    TASK:
    1. Identify the first 3 color bands (Significant Digit 1, Significant Digit 2, Multiplier).
    2. Ignore the 4th band (Tolerance, usually Gold, Silver, or Brown on the far right).
    3. Calculate the total resistance in Ohms (Ω).
    4. Provide a human-readable formatted value (e.g., 10kΩ, 470Ω).

    EXPERT KNOWLEDGE:
    - If the resistor is vertical, read from top to bottom.
    - If horizontal, read from left to right.
    - Differentiate carefully between Brown/Red/Orange and Blue/Violet in varying light.
    - Validate the final value against standard E12/E24 resistor series.

    Respond in valid JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model is required for high-precision visual component analysis
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
        thinkingConfig: { thinkingBudget: 16000 }, // High budget for deep reasoning on color spectrums
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bands: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The identified 3 color bands from start to multiplier"
            },
            resistance_ohms: {
              type: Type.NUMBER,
              description: "The final numeric resistance value"
            },
            formatted_value: {
              type: Type.STRING,
              description: "The formatted string value (e.g., '1.5kΩ')"
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence percentage (0-100) based on visual clarity"
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
    console.error("Gemini Expert Analysis Error:", error);
    if (error?.message?.includes("API_KEY_INVALID")) {
      throw new Error("The provided API key is invalid or has expired.");
    }
    throw error;
  }
};
