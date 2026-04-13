import type { CombinationRule, HeldItem, Nature, SpeedEv } from "./types";

type WeatherSpeedAbilityEffect = Readonly<{
  multiplier: 2;
  condition: string;
}>;

export const LEVEL = 50;
export const IV = 31;
export const SPEED_EVS: SpeedEv[] = [0, 252];
export const NATURES: Nature[] = ["neutral", "positive", "negative"];
export const HELD_ITEMS: (HeldItem | null)[] = [null, "choice-scarf"];
export const WEATHER_SPEED_ABILITY_EFFECTS = {
  chlorophyll: { multiplier: 2, condition: "sun" },
  "sand-rush": { multiplier: 2, condition: "sand" },
  "slush-rush": { multiplier: 2, condition: "snow" },
  "swift-swim": { multiplier: 2, condition: "rain" },
} as const satisfies Readonly<Record<string, WeatherSpeedAbilityEffect>>;
export const DOUBLE_SPEED_ABILITIES: ReadonlySet<string> = new Set(
  Object.keys(WEATHER_SPEED_ABILITY_EFFECTS),
);
export const STAGE_SPEED_ABILITIES: ReadonlySet<string> = new Set(["speed-boost"]);
export const COMBINATION_RULES: CombinationRule[] = [
  {
    name: "skip any speed modifier with negative nature",
    shouldInclude: ({ ability, item, nature }) =>
      nature !== "negative" || (ability === null && item === null),
  },
  {
    name: "skip choice scarf with neutral nature and no speed EVs",
    shouldInclude: ({ evs, item, nature }) => nature !== "neutral" || evs !== 0 || item === null,
  },
];
