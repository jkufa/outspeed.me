import type { MultiFilterComboboxOption } from "$lib/components/filters/multi-filter-combobox";
import { spreadFilterKeys, type SpreadFilterKey } from "$lib/speed-tiers";

export const spreadFilterParts: Record<SpreadFilterKey, { nature: string; points: string }> = {
  "positive-252": { nature: "+Spd", points: "32 SP" },
  "positive-0": { nature: "+Spd", points: "0 SP" },
  "neutral-252": { nature: "Neut", points: "32 SP" },
  "neutral-0": { nature: "Neut", points: "0 SP" },
  "negative-0": { nature: "-Spd", points: "0 SP" },
};

function spreadFilterLabel(key: SpreadFilterKey) {
  const { nature, points } = spreadFilterParts[key];
  return `${nature} ${points}`;
}

export const spreadFilterOptions: MultiFilterComboboxOption[] = spreadFilterKeys.map((key) => ({
  value: key,
  label: spreadFilterLabel(key),
}));

export function spreadFilterAriaLabel(value: SpreadFilterKey[]) {
  if (value.length === 0) {
    return "Spreads: All";
  }

  return `Spreads: ${value.map((key) => spreadFilterLabel(key)).join(", ")}`;
}
