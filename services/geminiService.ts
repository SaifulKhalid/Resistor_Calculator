
import { GoogleGenAI, Type } from "@google/genai";
import { ResistorResult } from "../types";

/**
 * Resizes a base64 image to a target width while maintaining aspect ratio
 */
const resizeImage = async (base64Str: string, targetWidth: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleFactor = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

const prepareBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const analyzeResistorImage = async (base64Image: string): Promise<ResistorResult | null> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("Missing API Key. Please ensure the project environment is configured.");
  }

  // Optimize image size before sending to save bandwidth and improve latency
  const optimizedImage = await resizeImage(base64Image, 800);
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this image of an axial resistor.
    
    1. Identify the first 3 color bands (Digit 1, Digit 2, Multiplier).
    2. Identify standard E-series values to correct for lighting shifts (e.g., if a band looks halfway between Red and Brown, check if it fits a standard value).
    3. Calculate Ohms and formatted value (e.g., 10kΩ).
    4. Provide confidence (0-100).
    
    Return JSON only.
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
                data: prepareBase64(optimizedImage)
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
              description: "The 3 primary color bands"
            },
            resistance_ohms: {
              type: Type.NUMBER
            },
            formatted_value: {
              type: Type.STRING
            },
            confidence: {
              type: Type.NUMBER
            }
          },
          required: ["bands", "resistance_ohms", "formatted_value", "confidence"]
        }
      }
    });

    const text = response.text || "";
    return JSON.parse(text) as ResistorResult;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("429")) {
      throw new Error("Quota exceeded. Please wait a moment before trying again.");
    }
    throw new Error(error.message || "Visual analysis failed.");
  }
};
