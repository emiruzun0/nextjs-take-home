// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACTIVITY_IDS } from "@/scoring/activities";
import type { Location } from "@/shared/weather";
import { CitySearch } from "./city-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const paris = (id: number, region: string, country: string): Location => ({
  id,
  name: "Paris",
  region,
  country,
  latitude: 0,
  longitude: 0,
});

const query = { city: "", placeId: null, activities: ACTIVITY_IDS, view: "table" as const };

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        ok: true,
        data: [paris(2988507, "Île-de-France Region", "France"), paris(4717560, "Texas", "United States")],
      }),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  push.mockClear();
});

describe("CitySearch", () => {
  it("suggests places while typing and opens the one that's clicked", async () => {
    render(<CitySearch query={query} />);
    fireEvent.change(screen.getByRole("combobox", { name: "City" }), { target: { value: "Par" } });

    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "Paris, Île-de-France Region, France",
      "Paris, Texas, United States",
    ]);
    expect(fetch).toHaveBeenCalledWith("/api/cities?q=Par", expect.anything());

    fireEvent.click(screen.getByRole("option", { name: "Paris, Texas, United States" }));
    // Keeps the layout from the current URL.
    expect(push).toHaveBeenCalledWith("/?city=Paris&place=4717560&view=table");
  });

  it("can be used with the keyboard", async () => {
    render(<CitySearch query={query} />);
    const input = screen.getByRole("combobox", { name: "City" });
    fireEvent.change(input, { target: { value: "Paris" } });
    await screen.findAllByRole("option");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: "Paris, Texas, United States" }).getAttribute("aria-selected")).toBe(
      "true",
    );

    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/?city=Paris&place=4717560&view=table");
  });

  it("doesn't search for fewer than 2 characters", async () => {
    render(<CitySearch query={query} />);
    fireEvent.change(screen.getByRole("combobox", { name: "City" }), { target: { value: "P" } });

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("doesn't open suggestions that arrive after the form was submitted", async () => {
    render(<CitySearch query={query} />);
    const input = screen.getByRole("combobox", { name: "City" });
    fireEvent.change(input, { target: { value: "Austin" } });
    fireEvent.submit(input.closest("form")!);

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
