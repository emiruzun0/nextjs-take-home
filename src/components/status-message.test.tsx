// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusMessage } from "./status-message";

afterEach(cleanup);

describe("StatusMessage", () => {
  it("announces the title and any extra content", () => {
    render(
      <StatusMessage title="The weather service isn't responding right now.">
        <button type="button">Try again</button>
      </StatusMessage>,
    );

    const status = screen.getByRole("status");
    expect(status.textContent).toContain("The weather service isn't responding right now.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeDefined();
  });
});
