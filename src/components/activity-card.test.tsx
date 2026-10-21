// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ActivityCard } from "./activity-card";
import { hours, soccer } from "./test-data";

afterEach(cleanup);

describe("ActivityCard", () => {
  it("leads with the best hour, its score, reason and weather", () => {
    render(<ActivityCard row={soccer} hours={hours} />);

    const card = screen.getByRole("region", { name: "Soccer" });
    expect(within(card).getByText(/Best: Today 6 PM/).textContent).toBe("Best: Today 6 PM · 94 · Great conditions");
    expect(within(card).getByText(/Feels/).textContent).toBe("Feels 68°F · wind 6 mph · 10% rain");
  });

  it("shows every hour with its score and feels-like temperature, and marks the best one", () => {
    render(<ActivityCard row={soccer} hours={hours} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["5 PM8879°", "6 PM9468°best hour"]);
  });

  it("leaves out the best-hour line when there are no hours", () => {
    render(<ActivityCard row={{ ...soccer, cells: [], bestIndex: null }} hours={[]} />);

    expect(screen.queryByText(/Best:/)).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
