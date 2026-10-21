// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScoreTable } from "./score-table";
import { hours, soccer } from "./test-data";

afterEach(cleanup);

describe("ScoreTable", () => {
  it("has a column per hour and a feels-like row", () => {
    render(<ScoreTable rows={[soccer]} hours={hours} />);

    const headers = screen.getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers).toEqual(["Hour", "Today5 PM", "Today6 PM"]);

    const feelsLike = screen.getByRole("row", { name: /Feels like/ });
    expect(within(feelsLike).getAllByRole("cell").map((td) => td.textContent)).toEqual(["79°", "68°"]);
  });

  it("has a row of scores per activity, with the best hour marked", () => {
    render(<ScoreTable rows={[soccer, { ...soccer, id: "running", label: "Running" }]} hours={hours} />);

    const row = screen.getByRole("row", { name: /^Soccer/ });
    expect(within(row).getAllByRole("cell").map((td) => td.textContent)).toEqual(["88", "94 best hour"]);
    expect(screen.getByRole("row", { name: /^Running/ })).toBeDefined();
  });
});
