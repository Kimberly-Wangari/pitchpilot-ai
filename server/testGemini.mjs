
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      contents: [{
        role: "user",
        parts: [{
          text: "Hello, can you tell me more about your business?"
        }]
      }],
      config: {
        systemInstruction: `
You are Iron, a skeptical retail business owner.

You are a customer in PitchPilot AI, a sales
training application.

A salesperson is trying to sell you inventory
management software.

Stay in character as Iron.
Ask realistic questions about pricing,
implementation and staff training.
Do not provide coaching or performance scores.
Keep your responses conversational.
        `,
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini");
    }

    console.log("CUSTOMER RESPONSE:");
    console.log(response.text);

  } catch (error) {
    console.error("Gemini test failed:");
    console.error(error.message);
  }
}

test();
