import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import MultiFilterComboboxTestHost from "./multi-filter-combobox-test-host.svelte";
import type { MultiFilterComboboxOption } from "./props";

const options: MultiFilterComboboxOption[] = [
  { value: "sun", label: "Sun" },
  { value: "rain", label: "Rain" },
  { value: "sand", label: "Sand" },
  { value: "snow", label: "Snow", disabled: true },
];

describe("MultiFilterCombobox", () => {
  it("shows the placeholder when value is empty", async () => {
    render(MultiFilterComboboxTestHost, { options });

    await expect.element(page.getByRole("button", { name: "Filters" })).toHaveTextContent("All");
    await expect.element(page.getByLabelText("Selected value")).toHaveTextContent("[]");
  });

  it("renders selected options as chips", async () => {
    render(MultiFilterComboboxTestHost, { options, value: ["sun", "rain"], width: "40rem" });

    const trigger = page.getByRole("button", { name: "Filters" });

    await expect.element(trigger).toHaveTextContent("Sun");
    await expect.element(trigger).toHaveTextContent("Rain");
  });

  it("collapses overflowing selected options into a count chip", async () => {
    render(MultiFilterComboboxTestHost, {
      options: [
        { value: "positive", label: "Positive nature" },
        { value: "neutral", label: "Neutral nature" },
        { value: "negative", label: "Negative nature" },
      ],
      value: ["positive", "neutral", "negative"],
      width: "9rem",
    });

    await expect.element(page.getByRole("button", { name: "Filters" })).toHaveTextContent("+");
  });

  it("toggles options and updates bound value", async () => {
    render(MultiFilterComboboxTestHost, { options });

    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("option", { name: "Sun" }).click();

    await expect.element(page.getByLabelText("Selected value")).toHaveTextContent('["sun"]');

    await page.getByRole("option", { name: "Sun" }).click();

    await expect.element(page.getByLabelText("Selected value")).toHaveTextContent("[]");
  });

  it("does not select disabled options", async () => {
    render(MultiFilterComboboxTestHost, { options });

    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("option", { name: "Snow" }).click({ force: true });

    await expect.element(page.getByLabelText("Selected value")).toHaveTextContent("[]");
  });

  it("allows custom content to toggle with provided helpers", async () => {
    render(MultiFilterComboboxTestHost, { options, customContent: true });

    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "Custom Rain" }).click();

    await expect.element(page.getByLabelText("Selected value")).toHaveTextContent('["rain"]');
  });
});
