
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSwapAdvice(source: string, dest: string, token: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short (max 20 words) witty tip or interesting fact about swapping ${token} from ${source} to ${dest} in a crypto context. Return ONLY plain text. Do not use any asterisks (*) or markdown formatting.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text?.replace(/\*/g, '') || "Seamless bridging at jet speed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Optimize your routes with Jet Swap's high-speed engine.";
  }
}

export async function* getChatStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    // Correctly await the stream promise to get the async iterable
    const response = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are Jet Support, the official AI assistant for Jet Swap. 
        Jet Swap is a high-performance cross-chain bridge and DEX aggregator. 
        Key info:
        - Supports: Ethereum, Arbitrum, Optimism, Base, Polygon.
        - Core values: Speed, security, and minimal slippage.
        - Personality: Professional, helpful, slightly futuristic/high-tech.
        - Keep answers concise and focused on Web3/bridging topics.
        - IMPORTANT: Do NOT use any Markdown formatting. Do NOT use asterisks (*) for bolding, italics, or lists. Return strictly plain text.`,
        temperature: 0.8,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        // Post-process to strip any remaining asterisks just in case
        yield chunk.text.replace(/\*/g, '');
      }
    }
  } catch (error) {
    console.error("Chat Error:", error);
    yield "I'm having a bit of trouble connecting to the Jet Network. Please try again in a moment.";
  }
}
