import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import FieldConditionFilterTestHost from "./field-condition-filter-test-host.svelte";
import { fieldConditionFilterOptions } from "./field-condition-filter-options";

describe("FieldConditionFilter", () => {
  it("shows All when value is empty", async () => {
    render(FieldConditionFilterTestHost);

    await expect
      .element(page.getByRole("button", { name: "Field condition: All" }))
      .toHaveTextContent("All");
    await expect.element(page.getByLabelText("Selected field conditions")).toHaveTextContent("[]");
  });

  it("selects Sun and updates the bound value", async () => {
    render(FieldConditionFilterTestHost);

    await page.getByRole("button", { name: "Field condition: All" }).click();
    await page.getByRole("option", { name: "Sun" }).click();

    await expect
      .element(page.getByLabelText("Selected field conditions"))
      .toHaveTextContent('["sun"]');
  });

  it("allows Tailwind to coexist with Sun", async () => {
    render(FieldConditionFilterTestHost, { value: ["sun"] });

    await page.getByRole("button", { name: "Field condition: Sun" }).click();
    await page.getByRole("option", { name: "Tailwind" }).click();

    await expect
      .element(page.getByLabelText("Selected field conditions"))
      .toHaveTextContent('["sun","tailwind"]');
  });

  it("removes a selected option when selected again", async () => {
    render(FieldConditionFilterTestHost, { value: ["sun"] });

    await page.getByRole("button", { name: "Field condition: Sun" }).click();
    await page.getByRole("option", { name: "Sun" }).click();

    await expect.element(page.getByLabelText("Selected field conditions")).toHaveTextContent("[]");
  });

  it("renders All first with a divider and resets selected values", async () => {
    render(FieldConditionFilterTestHost, { value: ["sun", "tailwind"] });

    await page.getByRole("button", { name: "Field condition: Sun, Tailwind" }).click();

    const optionLabels = Array.from(document.querySelectorAll('[data-slot="command-item"]')).map(
      (option) => option.textContent?.trim(),
    );

    expect(optionLabels[0]).toBe("All");
    expect(document.querySelector('[data-slot="command-separator"]')).not.toBeNull();

    await page.getByRole("option", { name: "All" }).click();

    await expect.element(page.getByLabelText("Selected field conditions")).toHaveTextContent("[]");
  });

  it("disables the trigger when disabled", async () => {
    render(FieldConditionFilterTestHost, { disabled: true });

    await expect.element(page.getByRole("button", { name: "Field condition: All" })).toBeDisabled();
  });

  it("uses selected field conditions in the aria-label", async () => {
    render(FieldConditionFilterTestHost, { value: ["sun", "tailwind"] });

    await expect
      .element(page.getByRole("button", { name: "Field condition: Sun, Tailwind" }))
      .toBeInTheDocument();
  });

  it("includes weather, terrain, and Tailwind options", () => {
    expect(fieldConditionFilterOptions).toEqual([
      { value: "sun", label: "Sun" },
      { value: "rain", label: "Rain" },
      { value: "sand", label: "Sand" },
      { value: "snow", label: "Snow" },
      { value: "electric-terrain", label: "Electric Terrain" },
      { value: "grassy-terrain", label: "Grassy Terrain" },
      { value: "misty-terrain", label: "Misty Terrain" },
      { value: "psychic-terrain", label: "Psychic Terrain" },
      { value: "tailwind", label: "Tailwind" },
    ]);
  });
});
