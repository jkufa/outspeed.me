import type { CombinationRule, HeldItem, Nature, SpeedEv } from "./types";

export const LEVEL = 50;
export const IV = 31;
export const SPEED_EVS: SpeedEv[] = [0, 252];
export const NATURES: Nature[] = ["neutral", "positive", "negative"];
export const HELD_ITEMS: (HeldItem | null)[] = [null, "choice-scarf"];
export const DOUBLE_SPEED_ABILITIES = new Set([
  "chlorophyll",
  "sand-rush",
  "slush-rush",
  "swift-swim",
]);
export const STAGE_SPEED_ABILITIES = new Set(["speed-boost"]);
export const COMBINATION_RULES: CombinationRule[] = [
  {
    name: "skip speed boosts with negative nature",
    shouldInclude: ({ ability, item, nature }) =>
      nature !== "negative" || (ability === null && item === null),
  },
  {
    name: "skip choice scarf with neutral nature and no speed EVs",
    shouldInclude: ({ evs, item, nature }) => nature !== "neutral" || evs !== 0 || item === null,
  },
];
