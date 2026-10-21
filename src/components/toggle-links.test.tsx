// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToggleLinks } from "./toggle-links";

afterEach(cleanup);

describe("ToggleLinks", () => {
  it("links to the next URL and marks the selected option", () => {
    render(
      <ToggleLinks
        label="Layout"
        options={[
          { label: "Cards", href: "/?city=Austin", selected: true },
          { label: "Table", href: "/?city=Austin&view=table", selected: false },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Layout" });
    const cards = screen.getByRole("link", { name: "Cards" });
    const table = screen.getByRole("link", { name: "Table" });

    expect(nav.contains(cards)).toBe(true);
    expect(cards.getAttribute("aria-current")).toBe("true");
    expect(table.getAttribute("aria-current")).toBeNull();
    expect(table.getAttribute("href")).toBe("/?city=Austin&view=table");
  });
});
