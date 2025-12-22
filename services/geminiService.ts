import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PrivacyRiskAssessment } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzePrivacyRisk = async (text: string): Promise<PrivacyRiskAssessment> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock analysis.");
    return {
      riskLevel: 'LOW',
      warnings: ['API Key missing - Mock Analysis'],
      safeToPost: true,
      source: 'LOCAL'
    };
  }

  try {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        riskLevel: {
          type: Type.STRING,
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: "The privacy risk level of the content."
        },
        warnings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of specific privacy concerns (PII, location, sentiment)."
        },
        safeToPost: {
          type: Type.BOOLEAN,
          description: "Whether the content is recommended for posting."
        }
      },
      required: ['riskLevel', 'warnings', 'safeToPost']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following social media post draft for privacy and security risks. 
      Identify Personally Identifiable Information (PII), precise location data, financial info, or emotionally vulnerable content that could be exploited.
      
      Draft: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a strict Privacy & Security Officer for a confidential network. Your job is to prevent data leaks and user exploitation."
      }
    });

    const result = JSON.parse(response.text || '{}');
    return { ...result, source: 'AI' } as PrivacyRiskAssessment;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      riskLevel: 'MEDIUM',
      warnings: ['AI Analysis failed, proceed with caution.'],
      safeToPost: true,
      source: 'LOCAL'
    };
  }
};