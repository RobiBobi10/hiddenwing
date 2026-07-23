// Gemini implementation of AiPort. Uses structured JSON output for parsing (so the
// shape is reliable) and a grounded text prompt for explanations.

import { Type } from "@google/genai";
import type { AiPort, ParsedTripRequest, ExplainInput } from "@/domain/ai/ai-port";
import type { CabinClass } from "@/domain/providers/provider-port";
import { getGeminiClient, GEMINI_MODEL } from "./gemini-client";
import { intakeSystem, EXPLAIN_SYSTEM } from "./prompts";

const CABINS: CabinClass[] = ["economy", "premium_economy", "business", "first"];

const tripSchema = {
  type: Type.OBJECT,
  properties: {
    origin: { type: Type.STRING },
    destination: { type: Type.STRING },
    departureDate: { type: Type.STRING },
    returnDate: { type: Type.STRING },
    adults: { type: Type.INTEGER },
    children: { type: Type.INTEGER },
    infants: { type: Type.INTEGER },
    cabinClass: { type: Type.STRING, enum: CABINS as unknown as string[] },
    interpretation: { type: Type.STRING },
  },
  required: [
    "origin",
    "destination",
    "departureDate",
    "returnDate",
    "adults",
    "children",
    "infants",
    "cabinClass",
    "interpretation",
  ],
};

export class GeminiAdapter implements AiPort {
  readonly name = "gemini";

  async parseTripRequest(text: string, today: string): Promise<ParsedTripRequest> {
    const ai = getGeminiClient();
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: text,
      config: {
        systemInstruction: intakeSystem(today),
        responseMimeType: "application/json",
        responseSchema: tripSchema,
        temperature: 0,
      },
    });

    const p = JSON.parse(res.text ?? "{}") as Record<string, unknown>;
    const cabin = String(p.cabinClass ?? "economy") as CabinClass;

    return {
      origin: String(p.origin ?? "").toUpperCase().trim(),
      destination: String(p.destination ?? "").toUpperCase().trim(),
      departureDate: String(p.departureDate ?? "").trim(),
      returnDate: p.returnDate ? String(p.returnDate).trim() : null,
      adults: Number(p.adults ?? 1),
      children: Number(p.children ?? 0),
      infants: Number(p.infants ?? 0),
      cabinClass: CABINS.includes(cabin) ? cabin : "economy",
      interpretation: String(p.interpretation ?? "").trim(),
    };
  }

  async explain(input: ExplainInput): Promise<string> {
    const ai = getGeminiClient();
    const facts = {
      route: `${input.query.origin} -> ${input.query.destination}`,
      tripType: input.query.returnDate ? "return" : "one-way",
      currency: input.currency,
      pick: {
        airline: input.best.owner,
        price: input.best.price,
        stops: input.best.stops,
        durationMinutes: input.best.durationMinutes,
        comfortScore: input.best.comfortScore,
        reasons: input.best.reasons,
        breakdown: input.best.breakdown,
      },
      cheapestPrice: input.cheapestPrice,
    };

    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Here are the exact numbers:\n${JSON.stringify(facts)}\n\nExplain why this pick is the best value for this traveller.`,
      config: { systemInstruction: EXPLAIN_SYSTEM, temperature: 0.3 },
    });

    return (res.text ?? "").trim();
  }
}
