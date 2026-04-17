import { expect, test } from "@playwright/test";

test("renders grouped speed tiers with simplified boosts", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { name: "Speed tiers" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Speed" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Pokemon" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Spread" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Boosts" })).toBeVisible();

	const firstUnboostedRow = page.getByRole("row").filter({ hasText: "Mega Alakazam" }).first();
	await expect(firstUnboostedRow.getByText("222")).toBeVisible();
	await expect(page.getByText("2x Chlorophyll").first()).toBeVisible();
	await expect(page.getByText("1.5x Choice Scarf")).toHaveCount(0);
	await expect(page.getByRole("button", { name: "Items: none selected" })).toBeVisible();
});

test("sorts speed tiers by the speed header", async ({ page }) => {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	await expect(page.getByText("1210 rows")).toBeVisible();

	const speedSort = page.getByRole("button", { name: "Speed sorted descending" });
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();

	await speedSort.click();
	await expect(page.getByRole("button", { name: "Speed sorted ascending" })).toBeVisible();
	await expect(page.getByText("Mega Sableye").first()).toBeVisible();

	await page.getByRole("button", { name: "Speed sorted ascending" }).click();
	await expect(page.getByRole("button", { name: "Speed sorted descending" })).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();
});

test("debounces find results without filtering visible rows", async ({ page }) => {
	await page.goto("/");

	const find = page.getByLabel("Find Pokemon");
	await find.fill("Whimsicott");

	await expect(page.getByText("1 of 1")).toBeVisible();
	await expect(page.getByText("Whimsicott").first()).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();

	await page.getByRole("button", { name: "Clear search" }).click();
	await expect(page.getByText("1 of 1")).toHaveCount(0);
});

test("find only matches rows that remain after filters", async ({ page }) => {
	await page.goto("/");

	await page.getByRole("button", { name: "Pokemon: all species" }).click();
	await page.getByPlaceholder("Search Pokemon...").fill("Mega Alakazam");
	await page.getByRole("option", { name: "Mega Alakazam" }).click();

	await expect(page.getByRole("button", { name: "Pokemon: Mega Alakazam" })).toBeVisible();

	const find = page.getByLabel("Find Pokemon");
	await find.fill("Whimsicott");

	await expect(page.getByText("No matches")).toBeVisible();
});

test("shows item-boosted rows when Choice Scarf is selected", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByText("1.5x Choice Scarf")).toHaveCount(0);

	await page.getByRole("button", { name: "Items: none selected" }).click();
	await page.getByRole("option", { name: "Choice Scarf" }).click();

	await expect(page.getByRole("button", { name: "Items: Choice Scarf" })).toBeVisible();
	await expect(page.getByText("1.5x Choice Scarf").first()).toBeVisible();
});

