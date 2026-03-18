import { GoogleGenerativeAI } from "@google/generative-ai";

/** Server-only Gemini client — NEVER import in client components */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel(modelName: string = "gemini-3.1-pro-preview") {
  const client = getGeminiClient();
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0 },
  });
}
