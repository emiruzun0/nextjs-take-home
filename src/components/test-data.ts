import type { ActivityRow, HourColumn } from "./score-types";

// Two hours and one activity, shared by the component tests.
export const hours: HourColumn[] = [
  { time: "2026-10-21T17:00", dayLabel: "Today", hourLabel: "5 PM", feelsLikeF: 79.1, windMph: 5.7, precipitationChance: 0 },
  { time: "2026-10-21T18:00", dayLabel: "Today", hourLabel: "6 PM", feelsLikeF: 68.4, windMph: 6.2, precipitationChance: 10 },
];

export const soccer: ActivityRow = {
  id: "soccer",
  label: "Soccer",
  cells: [
    { score: 88, reasonLabel: "Too hot", isBest: false },
    { score: 94, reasonLabel: "Great conditions", isBest: true },
  ],
  bestIndex: 1,
};
