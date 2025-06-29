import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const helloGeminiTaneto = onRequest(
  {
    region: "asia-northeast1",
    secrets: [geminiApiKey]
  },
  async (req, res) => {
    // Initialize Gemini client with secret
    const apiKey = geminiApiKey.value();
    console.log("API Key available:", !!apiKey, "Length:", apiKey?.length);
    const genAI = new GoogleGenerativeAI(apiKey);
  // CORS header (allow all origins for testing; tighten in production)
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    // Expecting { journalText: string }
    const { journalText = "" } = req.body || {};
    console.log("Received journalText:", journalText);
    
    if (!journalText) {
      res.status(400).json({ error: "journalText is required" });
      return;
    }

    console.log("Initializing model with gemini-1.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Calling generateContent");
    const result = await model.generateContent(journalText);
    
    console.log("Getting response text");
    const text = result.response.text();

    console.log("Success! Responding with message");
    res.json({ message: text });
  } catch (err) {
    console.error("Gemini function error", err);
    console.error("Error details:", {
      name: (err as Error).name,
      message: (err as Error).message,
      stack: (err as Error).stack
    });
    res.status(500).json({ error: "AI processing failed" });
  }
}); 