
import { GoogleGenAI, Type } from "@google/genai";
import { ResistorResult } from "../types";

/**
 * Clean base64 string for API
 */
const prepareBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const analyzeResistorImage = async (base64Image: string): Promise<ResistorResult | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `
    You are an expert in electronics and computer vision.
    You are analyzing an image captured from a smartphone camera.
    The image shows a single axial resistor, intentionally aligned horizontally from left to right.

    TASK
    Detect the resistor in the image.
    Identify the first three color bands from left to right.
    Ignore tolerance completely.
    Calculate the resistance value using the standard 4-band resistor color code:
    Band 1 = first digit
    Band 2 = second digit
    Band 3 = multiplier

    IMPORTANT RULES
    Assume only one resistor is present.
    If colors are unclear due to lighting or blur, still make the best possible estimate.
    Do NOT guess band order randomly — assume left-to-right orientation.
    Use standard resistor colors only:
    Black, Brown, Red, Orange, Yellow, Green, Blue, Violet, Grey, White, Gold, Silver.

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
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bands: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of the first three band colors"
            },
            resistance_ohms: {
              type: Type.NUMBER,
              description: "Calculated numeric value in Ohms"
            },
            formatted_value: {
              type: Type.STRING,
              description: "Human-readable value (e.g., 10kΩ)"
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score from 0 to 100"
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
