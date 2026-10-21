import { describe, expect, it } from "vitest";
import type { HourlyWeather } from "@/shared/weather";
import { buildRows } from "./build-rows";

function hour(time: string, overrides: Partial<HourlyWeather> = {}): HourlyWeather {
  return {
    time,
    feelsLikeF: 60,
    windMph: 5,
    precipitationIn: 0,
    precipitationChance: 0,
    weatherCode: 0,
    isDay: true,
    ...overrides,
  };
}

describe("buildRows", () => {
  const hours = [
    hour("2026-10-21T17:00", { precipitationIn: 0.05 }),
    hour("2026-10-21T18:00"),
    hour("2026-10-22T08:00"),
  ];

  it("labels each hour with its day and time", () => {
    const { columns } = buildRows(hours, ["picnic"]);
    expect(columns.map((c) => `${c.dayLabel} ${c.hourLabel}`)).toEqual(["Today 5 PM", "Today 6 PM", "Tomorrow 8 AM"]);
  });

  it("builds one row per selected activity and marks its best hour", () => {
    const { rows } = buildRows(hours, ["picnic", "soccer"]);

    expect(rows.map((r) => r.label)).toEqual(["Picnic", "Soccer"]);
    // Light rain at 5 PM ruins the picnic, so 6 PM is its best hour.
    expect(rows[0]?.cells.map((c) => c.score)).toEqual([50, 100, 100]);
    expect(rows[0]?.cells[0]?.reasonLabel).toBe("Rain");
    expect(rows[0]?.bestIndex).toBe(1);
    // Soccer doesn't mind light rain, so the earliest hour wins the tie.
    expect(rows[1]?.bestIndex).toBe(0);
  });

  it("returns no rows when no activities are selected", () => {
    expect(buildRows(hours, []).rows).toEqual([]);
  });
});
