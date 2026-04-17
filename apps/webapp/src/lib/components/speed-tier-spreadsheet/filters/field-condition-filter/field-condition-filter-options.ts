import type { MultiFilterComboboxOption } from "$lib/components/filters/multi-filter-combobox";
import type { FieldConditionFilter } from "$lib/speed-tiers";
import { fieldConditionFilterValues } from "$lib/speed-tiers";

const FIELD_CONDITION_LABELS = {
  sun: "Sun",
  rain: "Rain",
  sand: "Sand",
  snow: "Snow",
  "electric-terrain": "Electric Terrain",
  "grassy-terrain": "Grassy Terrain",
  "misty-terrain": "Misty Terrain",
  "psychic-terrain": "Psychic Terrain",
  tailwind: "Tailwind",
} satisfies Record<FieldConditionFilter, string>;

function fieldConditionOptions(
  values: readonly FieldConditionFilter[],
): MultiFilterComboboxOption[] {
  return values.map((value) => ({
    value,
    label: FIELD_CONDITION_LABELS[value],
  }));
}

export const fieldConditionFilterOptions = fieldConditionOptions(
  fieldConditionFilterValues,
) satisfies MultiFilterComboboxOption[];

export const fieldConditionByGroup: Record<string, MultiFilterComboboxOption[]> = {
  "": fieldConditionOptions(["tailwind"]),
  weather: fieldConditionOptions(["sun", "rain", "sand", "snow"]),
  terrain: fieldConditionOptions([
    "electric-terrain",
    "grassy-terrain",
    "misty-terrain",
    "psychic-terrain",
  ]),
};

const labelsByValue = new Map(
  Object.entries(FIELD_CONDITION_LABELS).map(([value, label]) => [value, label]),
);

export function fieldConditionAriaLabel(value: FieldConditionFilter[]) {
  const labels = value
    .map((condition) => labelsByValue.get(condition))
    .filter((label) => label !== undefined);

  if (labels.length === 0) return "Field condition: All";

  return `Field condition: ${labels.join(", ")}`;
}
