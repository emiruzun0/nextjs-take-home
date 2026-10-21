import { describe, expect, it } from "vitest";
import { ACTIVITY_IDS } from "@/scoring/activities";
import { parseQuery, toggleActivity, toHref } from "./query";

describe("parseQuery", () => {
  it("shows every activity as cards when the URL only has a city", () => {
    expect(parseQuery({ city: " Austin " })).toEqual({ city: "Austin", activities: ACTIVITY_IDS, view: "cards" });
  });

  it("keeps known activities in the usual order and drops unknown ones", () => {
    expect(parseQuery({ activities: "soccer,skiing,running" }).activities).toEqual(["running", "soccer"]);
  });

  it("treats an empty activities param as all switched off", () => {
    expect(parseQuery({ activities: "" }).activities).toEqual([]);
  });

  it("falls back to cards for an unknown view", () => {
    expect(parseQuery({ view: "chart" }).view).toBe("cards");
  });
});

describe("toHref", () => {
  it("leaves defaults out of the URL", () => {
    expect(toHref({ city: "Austin", activities: ACTIVITY_IDS, view: "cards" })).toBe("/?city=Austin");
    expect(toHref({ city: "", activities: ACTIVITY_IDS, view: "cards" })).toBe("/");
  });

  it("writes activities with readable commas", () => {
    expect(toHref({ city: "Austin", activities: ["running", "soccer"], view: "table" })).toBe(
      "/?city=Austin&activities=running,soccer&view=table",
    );
  });

  it("round-trips through parseQuery", () => {
    const query = { city: "New York", activities: ["walking" as const], view: "table" as const };
    const params = Object.fromEntries(new URLSearchParams(toHref(query).slice(2)));
    expect(parseQuery(params)).toEqual(query);
  });
});

describe("toggleActivity", () => {
  it("switches one activity off and back on in the usual order", () => {
    const all = { city: "Austin", activities: ACTIVITY_IDS, view: "cards" as const };
    const withoutCycling = toggleActivity(all, "cycling");
    expect(withoutCycling.activities).not.toContain("cycling");
    expect(toggleActivity(withoutCycling, "cycling").activities).toEqual(ACTIVITY_IDS);
  });
});
