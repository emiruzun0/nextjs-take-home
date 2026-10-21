import type { ActivityId } from "@/scoring/activities";
import type { Reason } from "@/scoring/score";
import type { Location } from "@/shared/weather";

// All user-facing wording for codes coming from the backend and scoring lives here.

export const ACTIVITY_LABELS: Record<ActivityId, string> = {
  running: "Running",
  cycling: "Cycling",
  walking: "Walking",
  picnic: "Picnic",
  basketball: "Basketball",
  soccer: "Soccer",
};

export const REASON_LABELS: Record<Reason, string> = {
  THUNDERSTORM: "Thunderstorm",
  TOO_COLD: "Too cold",
  TOO_HOT: "Too hot",
  TOO_WINDY: "Too windy",
  RAIN: "Rain",
  RAIN_LIKELY: "Rain likely",
  DARK: "Dark out",
  LATE_NIGHT: "Late at night",
};

export function reasonLabel(reason: Reason | null): string {
  return reason === null ? "Great conditions" : REASON_LABELS[reason];
}

// "Paris, Texas, United States". Skips the region when it repeats the city
// name ("Istanbul, Istanbul").
export function placeLabel(location: Location): string {
  const region = location.region === location.name ? null : location.region;
  return [location.name, region, location.country].filter(Boolean).join(", ");
}

// "2026-10-21T18:00" → "6 PM". Times are already in the city's local time.
export function formatHour(time: string): string {
  const hour = Number(time.slice(11, 13));
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour % 12 || 12} ${suffix}`;
}

// "Today" or "Tomorrow", relative to the first hour in the forecast.
export function formatDay(time: string, firstTime: string): string {
  return time.slice(0, 10) === firstTime.slice(0, 10) ? "Today" : "Tomorrow";
}
