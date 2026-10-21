import { describe, expect, it } from "vitest";
import { formatDay, formatHour, reasonLabel } from "./text";

describe("formatHour", () => {
  it("uses 12-hour time", () => {
    expect(formatHour("2026-10-21T00:00")).toBe("12 AM");
    expect(formatHour("2026-10-21T09:00")).toBe("9 AM");
    expect(formatHour("2026-10-21T12:00")).toBe("12 PM");
    expect(formatHour("2026-10-21T18:00")).toBe("6 PM");
  });
});

describe("formatDay", () => {
  it("compares against the first hour of the forecast", () => {
    expect(formatDay("2026-10-21T23:00", "2026-10-21T17:00")).toBe("Today");
    expect(formatDay("2026-10-22T00:00", "2026-10-21T17:00")).toBe("Tomorrow");
  });
});

describe("reasonLabel", () => {
  it("says what cost the most points, or that conditions are great", () => {
    expect(reasonLabel("TOO_WINDY")).toBe("Too windy");
    expect(reasonLabel(null)).toBe("Great conditions");
  });
});
