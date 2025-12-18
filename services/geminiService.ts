
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

  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("Missing API_KEY. Please ensure the 'API_KEY' environment variable is set in your Vercel Project Settings.");
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
    - Axial resistors follow standard E12/E24 values. Use this to clarify ambiguous colors.
    - If the resistor is vertical, read from top to bottom.
    - If horizontal, read from left to right.
    - Differentiate carefully between Brown/Red/Orange in varying light.

    Respond in valid JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Switched to Flash to avoid Pro model quota limits (429 errors)
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
        thinkingConfig: { thinkingBudget: 8000 }, // Flash-optimized reasoning budget
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bands: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The identified 3 color bands"
            },
            resistance_ohms: {
              type: Type.NUMBER,
              description: "Numeric resistance value"
            },
            formatted_value: {
              type: Type.STRING,
              description: "Formatted value (e.g., '1.5kΩ')"
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence percentage (0-100)"
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
    console.error("Gemini Error:", error);
    
    // Friendly error for Rate Limiting / Quota
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("The AI service is currently at capacity or quota-limited. Please wait 15-30 seconds and try again.");
    }
    
    if (error?.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key. Please verify your environment variables.");
    }
    
    throw new Error(error.message || "An error occurred during visual analysis.");
  }
};
