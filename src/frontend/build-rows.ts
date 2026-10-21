import type { ActivityRow, HourColumn } from "@/components/score-types";
import { ACTIVITIES, type ActivityId } from "@/scoring/activities";
import { bestHour, scoreHour } from "@/scoring/score";
import type { HourlyWeather } from "@/shared/weather";
import { ACTIVITY_LABELS, formatDay, formatHour, reasonLabel } from "./text";

// Turns the forecast into what the score components display: one column per
// hour and one row of scores per selected activity.
export function buildRows(
  hours: HourlyWeather[],
  activities: ActivityId[],
): { columns: HourColumn[]; rows: ActivityRow[] } {
  const firstTime = hours[0]?.time ?? "";

  const columns = hours.map((hour) => ({
    time: hour.time,
    dayLabel: formatDay(hour.time, firstTime),
    hourLabel: formatHour(hour.time),
    feelsLikeF: hour.feelsLikeF,
    windMph: hour.windMph,
    precipitationChance: hour.precipitationChance,
  }));

  const rows = activities.map((id) => {
    const scores = hours.map((hour) => scoreHour(ACTIVITIES[id], hour));
    const best = bestHour(scores);
    const bestIndex = best ? scores.indexOf(best) : null;

    return {
      id,
      label: ACTIVITY_LABELS[id],
      cells: scores.map((s, i) => ({
        score: s.score,
        reasonLabel: reasonLabel(s.reason),
        isBest: i === bestIndex,
      })),
      bestIndex,
    };
  });

  return { columns, rows };
}
