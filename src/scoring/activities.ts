// How much rain an activity can handle. See `rainLevel` in score.ts for the
// inches-per-hour thresholds behind light / moderate / heavy.
export type RainTolerance = "none" | "light" | "moderate";

export type ActivityRules = {
  minFeelsLikeF: number;
  maxFeelsLikeF: number;
  maxWindMph: number;
  rainTolerance: RainTolerance;
  // Points lost after sunset. Picnics and cycling really need daylight; the rest
  // are often done under lights, but are still harder to see and easier to trip.
  darkPenalty: number;
};

export type ActivityId = "running" | "cycling" | "walking" | "picnic" | "basketball" | "soccer";

// The rules from DECISIONS.md (decision 8). Change them there first.
export const ACTIVITIES: Record<ActivityId, ActivityRules> = {
  running: { minFeelsLikeF: 40, maxFeelsLikeF: 70, maxWindMph: 15, rainTolerance: "light", darkPenalty: 15 },
  cycling: { minFeelsLikeF: 55, maxFeelsLikeF: 75, maxWindMph: 10, rainTolerance: "none", darkPenalty: 50 },
  walking: { minFeelsLikeF: 40, maxFeelsLikeF: 80, maxWindMph: 20, rainTolerance: "light", darkPenalty: 10 },
  picnic: { minFeelsLikeF: 60, maxFeelsLikeF: 85, maxWindMph: 10, rainTolerance: "none", darkPenalty: 50 },
  basketball: { minFeelsLikeF: 55, maxFeelsLikeF: 80, maxWindMph: 15, rainTolerance: "none", darkPenalty: 10 },
  soccer: { minFeelsLikeF: 45, maxFeelsLikeF: 75, maxWindMph: 20, rainTolerance: "moderate", darkPenalty: 20 },
};

export const ACTIVITY_IDS = Object.keys(ACTIVITIES) as ActivityId[];
