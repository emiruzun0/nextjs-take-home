// What the score components display. The page builds these; components only render them.

export type HourColumn = {
  time: string;
  dayLabel: string;
  hourLabel: string;
  feelsLikeF: number;
  windMph: number;
  precipitationChance: number;
};

export type ScoreCell = {
  score: number;
  reasonLabel: string;
  isBest: boolean;
};

export type ActivityRow = {
  id: string;
  label: string;
  // One cell per HourColumn, in the same order.
  cells: ScoreCell[];
  bestIndex: number | null;
};
