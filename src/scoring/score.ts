import type { HourlyWeather } from "@/shared/weather";
import type { ActivityRules, RainTolerance } from "./activities";

// Like the backend's error codes, reasons are codes. The frontend picks the words.
export type Reason =
  | "THUNDERSTORM"
  | "TOO_COLD"
  | "TOO_HOT"
  | "TOO_WINDY"
  | "RAIN"
  | "RAIN_LIKELY"
  | "DARK"
  | "LATE_NIGHT";

export type HourScore = {
  time: string;
  score: number;
  // The factor that cost the most points, or null for a perfect hour.
  reason: Reason | null;
};

// Points lost per °F outside an activity's ideal range.
const POINTS_PER_DEGREE_F = 3;

// Sleep hours (11 PM to 6 AM) are less enjoyable for every activity, lit or not.
const LATE_NIGHT_PENALTY = 20;

type RainLevel = "dry" | "light" | "moderate" | "heavy";

// Points lost for each rain level, by how much rain the activity tolerates.
const RAIN_PENALTY: Record<RainTolerance, Record<RainLevel, number>> = {
  none: { dry: 0, light: 50, moderate: 80, heavy: 100 },
  light: { dry: 0, light: 0, moderate: 40, heavy: 80 },
  moderate: { dry: 0, light: 0, moderate: 0, heavy: 50 },
};

// WMO weather codes 95, 96 and 99 are thunderstorms.
const THUNDERSTORM_CODES = new Set([95, 96, 99]);

// Each mph over the limit costs more the further over it is: a little over is
// mild, far over makes the activity miserable. 5 over → −20, 10 over → −50.
export function windPenalty(mphOver: number): number {
  const first = Math.min(Math.max(mphOver, 0), 5);
  const second = Math.min(Math.max(mphOver - 5, 0), 5);
  const rest = Math.max(mphOver - 10, 0);
  return first * 4 + second * 6 + rest * 8;
}

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
  const level = rainLevel(hour.precipitationIn);

  const penalties: [Reason, number][] = [
    ["TOO_COLD", Math.max(0, coldBy) * POINTS_PER_DEGREE_F],
    ["TOO_HOT", Math.max(0, hotBy) * POINTS_PER_DEGREE_F],
    ["TOO_WINDY", windPenalty(windyBy)],
    ["RAIN", RAIN_PENALTY[rules.rainTolerance][level]],
    // Activities that can't take any rain also lose points when rain is likely,
    // since you'd have to plan around it: 60% chance costs 30 points. Only for
    // dry hours: if it's already raining, the RAIN penalty covers it. Rounded
    // down so a 1% chance doesn't become the "reason" for a perfect score.
    [
      "RAIN_LIKELY",
      rules.rainTolerance === "none" && level === "dry" ? Math.floor(hour.precipitationChance / 2) : 0,
    ],
    ["DARK", hour.isDay ? 0 : rules.darkPenalty],
    ["LATE_NIGHT", isLateNight(hour.time) ? LATE_NIGHT_PENALTY : 0],
  ];

  const total = penalties.reduce((sum, [, points]) => sum + points, 0);
  const [worstReason, worstPoints] = penalties.reduce((worst, p) => (p[1] > worst[1] ? p : worst));

  return {
    time: hour.time,
    score: Math.max(0, Math.round(100 - total)),
    reason: worstPoints > 0 ? worstReason : null,
  };
}

// "2026-10-22T02:00" → true. Times are local to the city.
function isLateNight(time: string): boolean {
  const hour = Number(time.slice(11, 13));
  return hour >= 23 || hour < 6;
}

// The highest-scoring hour. On a tie, the earliest one wins.
export function bestHour(scores: HourScore[]): HourScore | null {
  return scores.reduce<HourScore | null>(
    (best, s) => (best === null || s.score > best.score ? s : best),
    null,
  );
}
