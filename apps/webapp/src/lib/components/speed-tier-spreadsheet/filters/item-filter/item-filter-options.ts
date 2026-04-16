import type { MultiFilterComboboxOption } from "$lib/components/filters/multi-filter-combobox";
import type { ItemFilter } from "$lib/speed-tiers";

export const itemFilterOptions: MultiFilterComboboxOption[] = [
  {
    value: "choice-scarf",
    label: "Choice Scarf",
  },
];

export function itemFilterAriaLabel(selected: readonly ItemFilter[]): string {
  if (selected.length === 0) {
    return "Items: none selected";
  }

  return `Items: ${selected
    .map((item) => itemFilterOptions.find((option) => option.value === item)?.label ?? item)
    .join(", ")}`;
}
