// Input validation for a flight search. Rejects malformed/abusive input BEFORE
// any provider call (OWASP input validation, doc 15). On success it transforms
// into a provider-agnostic NormalizedQuery.
//
// `buildSearchSchema(today)` takes an injectable "today" so the past-date rule is
// deterministically testable; `searchSchema` is the default (real today).

import { z } from "zod";
import type { NormalizedQuery } from "@/domain/providers/provider-port";

const iataCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Enter a 3-letter airport code (e.g. LHR).");

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD.");

export function buildSearchSchema(today: Date = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);

  return z
    .object({
      origin: iataCode,
      destination: iataCode,
      departureDate: dateString,
      returnDate: z.union([dateString, z.literal("")]).optional(),
      adults: z.coerce.number().int().min(1).max(9),
      children: z.coerce.number().int().min(0).max(8),
      infants: z.coerce.number().int().min(0).max(8),
      cabinClass: z.enum(["economy", "premium_economy", "business", "first"]),
    })
    .refine((v) => v.origin !== v.destination, {
      message: "Origin and destination must be different.",
      path: ["destination"],
    })
    .refine((v) => v.departureDate >= todayStr, {
      message: "Departure date can't be in the past.",
      path: ["departureDate"],
    })
    .refine((v) => !v.returnDate || v.returnDate >= v.departureDate, {
      message: "Return date must be on or after the departure date.",
      path: ["returnDate"],
    })
    .refine((v) => v.adults + v.children + v.infants <= 9, {
      message: "Maximum 9 passengers per search.",
      path: ["adults"],
    })
    .refine((v) => v.infants <= v.adults, {
      message: "Each infant must be accompanied by an adult.",
      path: ["infants"],
    })
    .transform(
      (v): NormalizedQuery => ({
        origin: v.origin,
        destination: v.destination,
        departureDate: v.departureDate,
        returnDate: v.returnDate ? v.returnDate : null,
        passengers: { adults: v.adults, children: v.children, infants: v.infants },
        cabinClass: v.cabinClass,
      }),
    );
}

export const searchSchema = buildSearchSchema();
