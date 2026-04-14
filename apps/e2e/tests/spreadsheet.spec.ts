import { expect, test } from "@playwright/test";

test("renders grouped speed tiers with simplified boosts", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { name: "Speed tiers" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Speed" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Pokemon" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Spread" })).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Boosts" })).toBeVisible();

	const firstBoostedRow = page.getByRole("row").filter({ hasText: "Whimsicott" }).first();
	await expect(firstBoostedRow.getByText("368")).toBeVisible();
	await expect(firstBoostedRow.getByText("2x Chlorophyll")).toBeVisible();
	await expect(firstBoostedRow.getByText("sun", { exact: true })).toHaveCount(0);
});

test("debounces Pokemon search before filtering rows", async ({ page }) => {
	await page.goto("/");

	const search = page.getByPlaceholder("Excadrill");
	await search.fill("Excadrill");

	await expect(page.getByText("Excadrill").first()).toBeVisible();
	await expect(page.getByText("Whimsicott")).toHaveCount(0);
	await expect(page.getByText("Sand Rush").first()).toBeVisible();
});

test("filters boosts with all, none, abilities, and items", async ({ page }) => {
	await page.goto("/");

	await page.getByRole("button", { name: "All" }).click();
	await page.getByRole("menuitemcheckbox", { name: "None" }).click();
	await expect(page.getByRole("button", { name: "None" })).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();
	await expect(page.getByText("2x Chlorophyll")).toHaveCount(0);

	await page.getByRole("menuitemcheckbox", { name: "All" }).click();
	await expect(page.getByRole("button", { name: "All" })).toBeVisible();
	await expect(page.getByText("2x Chlorophyll").first()).toBeVisible();
	await expect(page.getByText("Mega Alakazam").first()).toBeVisible();

	await page.getByRole("menuitemcheckbox", { name: "Abilities" }).click();
	await expect(page.getByRole("button", { name: "Abilities" })).toBeVisible();
	await expect(page.getByText("2x Chlorophyll").first()).toBeVisible();
	await expect(page.getByText("1.5x Choice Scarf")).toHaveCount(0);

	await page.getByRole("menuitemcheckbox", { name: "Items" }).click();
	await expect(page.getByRole("button", { name: "Abilities, Items" })).toBeVisible();
	await expect(page.getByText("1.5x Choice Scarf").first()).toBeVisible();
});
