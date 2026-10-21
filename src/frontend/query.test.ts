import { describe, expect, it } from "vitest";
import { ACTIVITY_IDS } from "@/scoring/activities";
import { parseQuery, toggleActivity, toHref } from "./query";

describe("parseQuery", () => {
  it("shows every activity as cards when the URL only has a city", () => {
    expect(parseQuery({ city: " Austin " })).toEqual({ city: "Austin", placeId: null, activities: ACTIVITY_IDS, view: "cards" });
  });

  it("keeps known activities in the usual order and drops unknown ones", () => {
    expect(parseQuery({ activities: "soccer,skiing,running" }).activities).toEqual(["running", "soccer"]);
  });

  it("treats an empty activities param as all switched off", () => {
    expect(parseQuery({ activities: "" }).activities).toEqual([]);
  });

  it("reads a picked place's ID and ignores anything that isn't one", () => {
    expect(parseQuery({ city: "Paris", place: "4717560" }).placeId).toBe(4717560);
    expect(parseQuery({ place: "abc" }).placeId).toBeNull();
    expect(parseQuery({ place: "-3" }).placeId).toBeNull();
  });

  it("falls back to cards for an unknown view", () => {
    expect(parseQuery({ view: "chart" }).view).toBe("cards");
  });
});

describe("toHref", () => {
  it("leaves defaults out of the URL", () => {
    expect(toHref({ city: "Austin", placeId: null, activities: ACTIVITY_IDS, view: "cards" })).toBe("/?city=Austin");
    expect(toHref({ city: "", placeId: null, activities: ACTIVITY_IDS, view: "cards" })).toBe("/");
  });

  it("writes activities with readable commas", () => {
    expect(toHref({ city: "Austin", placeId: null, activities: ["running", "soccer"], view: "table" })).toBe(
      "/?city=Austin&activities=running,soccer&view=table",
    );
  });

  it("keeps a picked place next to the city name", () => {
    expect(toHref({ city: "Paris", placeId: 4717560, activities: ACTIVITY_IDS, view: "cards" })).toBe(
      "/?city=Paris&place=4717560",
    );
  });

  it("round-trips through parseQuery", () => {
    const query = { city: "New York", placeId: 5128581, activities: ["walking" as const], view: "table" as const };
    const params = Object.fromEntries(new URLSearchParams(toHref(query).slice(2)));
    expect(parseQuery(params)).toEqual(query);
  });
});

describe("toggleActivity", () => {
  it("switches one activity off and back on in the usual order", () => {
    const all = { city: "Austin", placeId: null, activities: ACTIVITY_IDS, view: "cards" as const };
    const withoutCycling = toggleActivity(all, "cycling");
    expect(withoutCycling.activities).not.toContain("cycling");
    expect(toggleActivity(withoutCycling, "cycling").activities).toEqual(ACTIVITY_IDS);
  });
});
