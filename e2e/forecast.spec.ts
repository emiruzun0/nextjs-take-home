import { expect, test } from "@playwright/test";

test("search a city, see scores, switch to the table and turn an activity off", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Search for a city")).toBeVisible();

  await page.getByLabel("City").fill("Austin");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByRole("heading", { name: "Austin, Texas, United States" })).toBeVisible();
  await expect(page.getByRole("region")).toHaveCount(6);
  await expect(page.getByRole("region", { name: "Soccer" }).getByText(/^Best: (Today|Tomorrow)/)).toBeVisible();

  await page.getByRole("link", { name: "Table" }).click();
  await expect(page).toHaveURL(/view=table/);
  await expect(page.getByRole("table")).toBeVisible();

  await page.getByRole("link", { name: "Picnic" }).click();
  await expect(page).toHaveURL(/activities=running,cycling,walking,basketball,soccer/);
  await expect(page.getByRole("row", { name: /^Picnic/ })).toHaveCount(0);
  await expect(page.getByRole("row", { name: /^Soccer/ })).toBeVisible();
});

test("explains when a city can't be found", async ({ page }) => {
  await page.goto("/?city=zzzqqq");
  await expect(page.getByText('We couldn\'t find "zzzqqq".')).toBeVisible();
});
