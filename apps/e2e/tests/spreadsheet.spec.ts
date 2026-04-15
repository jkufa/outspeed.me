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
	await expect(page.getByRole("button", { name: "Boosts: None" })).toBeVisible();
	await expect(page.getByText("2x Chlorophyll")).toHaveCount(0);
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

test("debounces Pokemon search before filtering rows", async ({ page }) => {
	await page.goto("/");

	const search = page.getByPlaceholder("Excadrill");
	await search.fill("Excadrill");

	await expect(page.getByText("Excadrill").first()).toBeVisible();
	await expect(page.getByText("Whimsicott")).toHaveCount(0);
});

test("filters boosts with all, none, abilities, and items", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("button", { name: "Boosts: None" })).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();
	await expect(page.getByText("2x Chlorophyll")).toHaveCount(0);

	await page.getByRole("button", { name: "Boosts: None" }).click();
	await page.getByRole("menuitemcheckbox", { name: "All" }).click();
	await expect(page.getByRole("button", { name: "Boosts: All" })).toBeVisible();
	await expect(page.getByText("2x Chlorophyll").first()).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();

	await page.getByRole("menuitemcheckbox", { name: "Abilities" }).click();
	await expect(page.getByRole("button", { name: "Boosts: Abilities" })).toBeVisible();
	await expect(page.getByText("2x Chlorophyll").first()).toBeVisible();
	await expect(page.getByText("1.5x Choice Scarf")).toHaveCount(0);

	await page.getByRole("menuitemcheckbox", { name: "Items" }).click();
	await expect(page.getByRole("button", { name: "Boosts: Abilities, Items" })).toBeVisible();
	await expect(page.getByText("1.5x Choice Scarf").first()).toBeVisible();
});
