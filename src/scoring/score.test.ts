import { describe, expect, it } from "vitest";
import type { HourlyWeather } from "@/shared/weather";
import { ACTIVITIES, ACTIVITY_IDS } from "./activities";
import { bestHour, rainLevel, scoreHour } from "./score";

// A mild, dry, calm afternoon that's inside every activity's ideal range.
function hour(overrides: Partial<HourlyWeather> = {}): HourlyWeather {
  return {
    time: "2026-10-21T18:00",
    feelsLikeF: 60,
    windMph: 5,
    precipitationIn: 0,
    precipitationChance: 0,
    weatherCode: 0,
    isDay: true,
    ...overrides,
  };
}

describe("scoreHour", () => {
  it("gives every activity 100 in ideal weather", () => {
    for (const id of ACTIVITY_IDS) {
      expect(scoreHour(ACTIVITIES[id], hour())).toEqual({ time: "2026-10-21T18:00", score: 100, reason: null });
    }
  });

  it("lets soccer go on in light rain but ruins a picnic and the basketball court", () => {
    const lightRain = hour({ precipitationIn: 0.05 });
    expect(scoreHour(ACTIVITIES.soccer, lightRain).score).toBe(100);
    expect(scoreHour(ACTIVITIES.picnic, lightRain)).toMatchObject({ score: 50, reason: "RAIN" });
    expect(scoreHour(ACTIVITIES.basketball, lightRain)).toMatchObject({ score: 50, reason: "RAIN" });
  });

  it("only hurts soccer in heavy rain", () => {
    expect(scoreHour(ACTIVITIES.soccer, hour({ precipitationIn: 0.2 })).score).toBe(100);
    expect(scoreHour(ACTIVITIES.soccer, hour({ precipitationIn: 0.5 }))).toMatchObject({ score: 50, reason: "RAIN" });
  });

  it("scores every activity 0 in a thunderstorm", () => {
    for (const id of ACTIVITY_IDS) {
      expect(scoreHour(ACTIVITIES[id], hour({ weatherCode: 95 }))).toMatchObject({ score: 0, reason: "THUNDERSTORM" });
    }
  });

  it("takes 3 points per degree outside the range", () => {
    // Running is ideal from 40°F; 30°F is 10 degrees too cold.
    expect(scoreHour(ACTIVITIES.running, hour({ feelsLikeF: 30 }))).toMatchObject({ score: 70, reason: "TOO_COLD" });
    // Running is ideal up to 70°F; 80°F is 10 degrees too hot.
    expect(scoreHour(ACTIVITIES.running, hour({ feelsLikeF: 80 }))).toMatchObject({ score: 70, reason: "TOO_HOT" });
  });

  it("takes 4 points per mph over the wind limit", () => {
    // Cycling allows 10 mph; 15 mph is 5 over.
    expect(scoreHour(ACTIVITIES.cycling, hour({ windMph: 15 }))).toMatchObject({ score: 80, reason: "TOO_WINDY" });
  });

  it("lowers picnic and cycling at night, but not the others", () => {
    const night = hour({ isDay: false });
    expect(scoreHour(ACTIVITIES.picnic, night)).toMatchObject({ score: 50, reason: "DARK" });
    expect(scoreHour(ACTIVITIES.cycling, night)).toMatchObject({ score: 50, reason: "DARK" });
    expect(scoreHour(ACTIVITIES.running, night).score).toBe(100);
    expect(scoreHour(ACTIVITIES.basketball, night).score).toBe(100);
  });

  it("counts the chance of rain only for activities that can't take any rain", () => {
    const likelyRain = hour({ precipitationChance: 60 });
    expect(scoreHour(ACTIVITIES.picnic, likelyRain)).toMatchObject({ score: 70, reason: "RAIN_LIKELY" });
    expect(scoreHour(ACTIVITIES.soccer, likelyRain).score).toBe(100);
  });

  it("adds penalties together and reports the biggest one", () => {
    // Cycling: 5 mph over (-20) and 10°F too cold (-30).
    expect(scoreHour(ACTIVITIES.cycling, hour({ windMph: 15, feelsLikeF: 45 }))).toMatchObject({
      score: 50,
      reason: "TOO_COLD",
    });
  });

  it("never goes below 0", () => {
    expect(scoreHour(ACTIVITIES.picnic, hour({ feelsLikeF: 0 })).score).toBe(0);
  });
});

describe("rainLevel", () => {
  it("uses the National Weather Service thresholds", () => {
    expect(rainLevel(0)).toBe("dry");
    expect(rainLevel(0.09)).toBe("light");
    expect(rainLevel(0.1)).toBe("moderate");
    expect(rainLevel(0.3)).toBe("moderate");
    expect(rainLevel(0.31)).toBe("heavy");
  });
});

describe("bestHour", () => {
  it("picks the highest score, and the earliest hour on a tie", () => {
    const scores = [
      { time: "17:00", score: 60, reason: null },
      { time: "18:00", score: 90, reason: null },
      { time: "19:00", score: 90, reason: null },
    ];
    expect(bestHour(scores)?.time).toBe("18:00");
  });

  it("returns null when there are no hours", () => {
    expect(bestHour([])).toBeNull();
  });
});
