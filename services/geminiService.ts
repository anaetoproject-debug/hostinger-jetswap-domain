
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSwapAdvice(source: string, dest: string, token: string) {
  // The Gemini API call has been temporarily disabled to prevent API key errors.
  return "Optimize your routes with Jet Swap's high-speed engine.";
}

export async function* getChatStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  // The Gemini API call has been temporarily disabled to prevent API key errors.
  yield "The AI chat is temporarily unavailable. Please check back later.";
}
