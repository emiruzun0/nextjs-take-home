import type { HourlyWeather } from "@/shared/weather";
import type { ActivityRules, RainTolerance } from "./activities";

// Like the backend's error codes, reasons are codes. The frontend picks the words.
export type Reason = "THUNDERSTORM" | "TOO_COLD" | "TOO_HOT" | "TOO_WINDY" | "RAIN" | "RAIN_LIKELY" | "DARK";

export type HourScore = {
  time: string;
  score: number;
  // The factor that cost the most points, or null for a perfect hour.
  reason: Reason | null;
};

// Points lost per unit outside an activity's ideal range.
const POINTS_PER_DEGREE_F = 3;
const POINTS_PER_MPH = 4;
const DARK_PENALTY = 50;

type RainLevel = "dry" | "light" | "moderate" | "heavy";

// Points lost for each rain level, by how much rain the activity tolerates.
const RAIN_PENALTY: Record<RainTolerance, Record<RainLevel, number>> = {
  none: { dry: 0, light: 50, moderate: 80, heavy: 100 },
  light: { dry: 0, light: 0, moderate: 40, heavy: 80 },
  moderate: { dry: 0, light: 0, moderate: 0, heavy: 50 },
};

// WMO weather codes 95, 96 and 99 are thunderstorms.
const THUNDERSTORM_CODES = new Set([95, 96, 99]);

// Inches per hour, using the US National Weather Service thresholds.
export function rainLevel(inches: number): RainLevel {
  if (inches <= 0) return "dry";
  if (inches < 0.1) return "light";
  if (inches <= 0.3) return "moderate";
  return "heavy";
}

export function scoreHour(rules: ActivityRules, hour: HourlyWeather): HourScore {
  if (THUNDERSTORM_CODES.has(hour.weatherCode)) {
    return { time: hour.time, score: 0, reason: "THUNDERSTORM" };
  }

  const coldBy = rules.minFeelsLikeF - hour.feelsLikeF;
  const hotBy = hour.feelsLikeF - rules.maxFeelsLikeF;
  const windyBy = hour.windMph - rules.maxWindMph;

  const penalties: [Reason, number][] = [
    ["TOO_COLD", Math.max(0, coldBy) * POINTS_PER_DEGREE_F],
    ["TOO_HOT", Math.max(0, hotBy) * POINTS_PER_DEGREE_F],
    ["TOO_WINDY", Math.max(0, windyBy) * POINTS_PER_MPH],
    ["RAIN", RAIN_PENALTY[rules.rainTolerance][rainLevel(hour.precipitationIn)]],
    // Activities that can't take any rain also lose points when rain is likely,
    // since you'd have to plan around it: 60% chance costs 30 points.
    ["RAIN_LIKELY", rules.rainTolerance === "none" ? hour.precipitationChance / 2 : 0],
    ["DARK", rules.needsDaylight && !hour.isDay ? DARK_PENALTY : 0],
  ];

  const total = penalties.reduce((sum, [, points]) => sum + points, 0);
  const [worstReason, worstPoints] = penalties.reduce((worst, p) => (p[1] > worst[1] ? p : worst));

  return {
    time: hour.time,
    score: Math.max(0, Math.round(100 - total)),
    reason: worstPoints > 0 ? worstReason : null,
  };
}

// The highest-scoring hour. On a tie, the earliest one wins.
export function bestHour(scores: HourScore[]): HourScore | null {
  return scores.reduce<HourScore | null>(
    (best, s) => (best === null || s.score > best.score ? s : best),
    null,
  );
}
