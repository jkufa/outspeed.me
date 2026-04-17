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
	await expect(page.getByText("1232 rows").nth(1)).toBeVisible();

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

	await expect(page.getByText("1 of 7")).toBeVisible();
	await expect(page.getByText("Whimsicott").first()).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();

	await page.getByRole("button", { name: "Clear search" }).click();
	await expect(page.getByText("1 of 7")).toHaveCount(0);
});

test("find only matches rows that remain after filters", async ({ page }) => {
	await page.goto("/");

	await page.getByRole("button", { name: "Pokemon: all species" }).click();
	await page.getByPlaceholder("Search Pokemon...").fill("Alakazam");
	await page.getByRole("option", { name: "Alakazam" }).click();

	await expect(page.getByRole("button", { name: "Pokemon: Alakazam" })).toBeVisible();

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

test("supports mobile speed sorting and filter drawer", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	await page.waitForLoadState("networkidle");

	await expect(page.getByLabel("Find Pokemon")).toBeVisible();
	await expect(page.getByRole("button", { name: "Speed sorted descending" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Filters (0)" })).toBeVisible();

	await page.getByRole("button", { name: "Speed sorted descending" }).click();
	await expect(page.getByRole("button", { name: "Speed sorted ascending" })).toBeVisible();
	await expect(
		page.locator("[data-speed-tier-mobile-list]").getByText("Mega Sableye").first(),
	).toBeVisible();

	await page.getByRole("button", { name: "Filters (0)" }).click();
	await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible();

	await page.getByRole("button", { name: "Items: none selected" }).click();
	await page.getByRole("option", { name: "Choice Scarf" }).click();
	await expect(page.getByRole("button", { name: "Items: Choice Scarf" })).toBeVisible();
	await expect(
		page.locator("[data-speed-tier-mobile-list]").getByText("1.5x Choice Scarf").first(),
	).toBeVisible();

	await page.getByRole("button", { name: "Items: Choice Scarf" }).click();
	await page.getByRole("button", { name: "Clear", exact: true }).click();
	await expect(page.getByRole("heading", { name: "Clear filters?" })).toBeVisible();
	await expect(
		page.getByText("This removes all selected filters and updates results immediately."),
	).toBeVisible();
	await page.getByRole("button", { name: "Clear filters" }).click();
	await expect(page.getByRole("button", { name: "Items: none selected" })).toBeVisible();

	await page.getByRole("button", { name: /Show \d+ results/ }).click();
	await expect(page.getByRole("heading", { name: "Filters" })).toHaveCount(0);
	await expect(page.getByRole("button", { name: "Filters (0)" })).toBeVisible();
});
