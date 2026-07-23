// Validation for profile edits. Bounds keep weights sane and can't break a search.

import { z } from "zod";

export const profileSchema = z.object({
  valueOfTimePerHour: z.number().int().min(0).max(500),
  checkedBagsNeeded: z.number().int().min(0).max(5),
  estimatedBagFee: z.number().int().min(0).max(500),
  perStopPenalty: z.number().int().min(0).max(500),
  redEyePenalty: z.number().int().min(0).max(500),
  comfortWeight: z.number().int().min(0).max(500),
  noRedEye: z.boolean(),
  maxStops: z.number().int().min(0).max(3).nullable(),
});
