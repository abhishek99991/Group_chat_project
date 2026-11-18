
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// Convert Gemini response into a JavaScript object
const parseGeminiResponse = (text) => {
  const cleanedText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedText);
};

// 1. Predictive typing suggestions
const getPredictiveSuggestions = async (message, tone = "casual") => {
  const prompt = `
You are an AI assistant for a group chat application.

Generate exactly 3 short, relevant suggestions to continue the user's message.

User's current message: "${message}"
Preferred communication tone: "${tone}"

Rules:
- Suggestions must continue the user's sentence naturally.
- Keep each suggestion concise.
- Be relevant to the message context.
- Do not repeat the entire message.
- Return only valid JSON in this format:

{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return parseGeminiResponse(response.text);
};

// 2. Smart replies to incoming messages
const getSmartReplies = async (
  incomingMessage,
  tone = "casual"
) => {
  const prompt = `
You are an AI assistant for a group chat application.

Generate exactly 3 short replies to the following incoming message.

Incoming message: "${incomingMessage}"
Preferred communication tone: "${tone}"

Rules:
- Replies must be natural and relevant.
- Keep replies short.
- Do not assume facts that are not provided.
- Provide different possible responses.
- Keep the content respectful and appropriate.
- Return only valid JSON in this format:

{
  "replies": ["reply 1", "reply 2", "reply 3"]
}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return parseGeminiResponse(response.text);
};

module.exports = {
  getPredictiveSuggestions,
  getSmartReplies,
};
