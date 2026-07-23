// Loads/saves a user's PreferenceProfile and maps it into the objects the engine
// consumes (Preferences + HardConstraints). Missing profile → sensible defaults.

import { db } from "@/lib/db";
import type { Preferences } from "@/domain/optimization/preferences";
import { DEFAULT_PREFERENCES } from "@/domain/optimization/preferences";
import type { HardConstraints } from "@/domain/optimization/constraints";
import { DEFAULT_CONSTRAINTS } from "@/domain/optimization/constraints";

/** The editable profile fields (what the /profile form saves). */
export interface ProfileData {
  valueOfTimePerHour: number;
  checkedBagsNeeded: number;
  estimatedBagFee: number;
  perStopPenalty: number;
  redEyePenalty: number;
  comfortWeight: number;
  noRedEye: boolean;
  maxStops: number | null;
}

export interface LoadedProfile {
  preferences: Preferences;
  constraints: HardConstraints;
  data: ProfileData;
  exists: boolean;
}

export function defaultProfileData(): ProfileData {
  return {
    valueOfTimePerHour: DEFAULT_PREFERENCES.valueOfTimePerHour,
    checkedBagsNeeded: DEFAULT_PREFERENCES.checkedBagsNeeded,
    estimatedBagFee: DEFAULT_PREFERENCES.estimatedBagFee,
    perStopPenalty: DEFAULT_PREFERENCES.perStopPenalty,
    redEyePenalty: DEFAULT_PREFERENCES.redEyePenalty,
    comfortWeight: DEFAULT_PREFERENCES.comfortWeight,
    noRedEye: DEFAULT_CONSTRAINTS.noRedEye,
    maxStops: DEFAULT_CONSTRAINTS.maxStops,
  };
}

function toPreferences(d: ProfileData): Preferences {
  return {
    ...DEFAULT_PREFERENCES,
    valueOfTimePerHour: d.valueOfTimePerHour,
    checkedBagsNeeded: d.checkedBagsNeeded,
    estimatedBagFee: d.estimatedBagFee,
    perStopPenalty: d.perStopPenalty,
    redEyePenalty: d.redEyePenalty,
    comfortWeight: d.comfortWeight,
  };
}

export async function loadProfile(clerkId: string): Promise<LoadedProfile> {
  const row = await db.preferenceProfile.findUnique({ where: { clerkId } });
  const data: ProfileData = row
    ? {
        valueOfTimePerHour: row.valueOfTimePerHour,
        checkedBagsNeeded: row.checkedBagsNeeded,
        estimatedBagFee: row.estimatedBagFee,
        perStopPenalty: row.perStopPenalty,
        redEyePenalty: row.redEyePenalty,
        comfortWeight: row.comfortWeight,
        noRedEye: row.noRedEye,
        maxStops: row.maxStops ?? null,
      }
    : defaultProfileData();

  return {
    preferences: toPreferences(data),
    constraints: { noRedEye: data.noRedEye, maxStops: data.maxStops },
    data,
    exists: Boolean(row),
  };
}

export async function saveProfile(clerkId: string, d: ProfileData): Promise<void> {
  await db.preferenceProfile.upsert({
    where: { clerkId },
    create: { clerkId, ...d },
    update: { ...d },
  });
}
