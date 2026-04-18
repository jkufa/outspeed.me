import type { MultiFilterComboboxOption } from "$lib/components/filters/multi-filter-combobox";
import {
  formatSpread,
  formatSpreadNature,
  formatSpreadPoints,
  spreadFilterKeys,
  type Nature,
  type SpeedEv,
  type SpreadFilterKey,
} from "$lib/speed-tiers";

export const spreadFilterParts: Record<SpreadFilterKey, { nature: string; points: string }> = {
  "positive-252": {
    nature: formatSpreadNature("positive"),
    points: formatSpreadPoints(252),
  },
  "positive-0": {
    nature: formatSpreadNature("positive"),
    points: formatSpreadPoints(0),
  },
  "neutral-252": {
    nature: formatSpreadNature("neutral"),
    points: formatSpreadPoints(252),
  },
  "neutral-0": {
    nature: formatSpreadNature("neutral"),
    points: formatSpreadPoints(0),
  },
  "negative-0": {
    nature: formatSpreadNature("negative"),
    points: formatSpreadPoints(0),
  },
};

function spreadFilterLabel(key: SpreadFilterKey) {
  const [nature, evs] = key.split("-");
  return formatSpread({
    nature: nature as Nature,
    evs: Number(evs) as SpeedEv,
    ivs: 31,
    level: 50,
    rawSpeed: 0,
  });
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
