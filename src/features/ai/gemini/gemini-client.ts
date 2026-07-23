// Server-only Gemini client factory. The key is read from the environment and MUST
// stay server-side — never NEXT_PUBLIC_.

import { GoogleGenAI } from "@google/genai";

let cached: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add a free Google AI Studio key to .env.local (and to Vercel env vars for deploys).",
    );
  }
  if (!cached) cached = new GoogleGenAI({ apiKey });
  return cached;
}

// Overridable so we can move to a newer Flash model without a code change.
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
