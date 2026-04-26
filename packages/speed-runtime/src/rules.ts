import type { Nature, SpeedModifierInput, SupportedSpeedModifierMetadata } from "./types";

type WeatherSpeedAbilityEffect = Readonly<{
  multiplier: 2;
  condition: string;
}>;

const SUPPORTED_ORIGINS: SupportedSpeedModifierMetadata["supportedOrigins"] = [
  "manual",
  "showdown",
];

export const DEFAULT_LEVEL = 50;
export const DEFAULT_IVS = 31;
export const MAX_SPEED_STAT_POINTS = 32;
export const MAX_SPEED_EVS = 252;
export const PRESET_SPEED_EVS = [0, 252] as const;
export const NATURES: Nature[] = ["neutral", "positive", "negative"];

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
export const SPEED_ABILITIES: ReadonlySet<string> = new Set([
  ...DOUBLE_SPEED_ABILITIES,
  ...STAGE_SPEED_ABILITIES,
]);

export const HELD_ITEMS = ["choice-scarf"] as const;

export const SUPPORTED_SPEED_MODIFIERS = [
  {
    kind: "ability",
    source: "chlorophyll",
    label: "Chlorophyll",
    effectKind: "ability",
    multiplier: 2,
    condition: "sun",
    supportedOrigins: [...SUPPORTED_ORIGINS],
  },
  {
    kind: "ability",
    source: "sand-rush",
    label: "Sand Rush",
    effectKind: "ability",
    multiplier: 2,
    condition: "sand",
    supportedOrigins: [...SUPPORTED_ORIGINS],
  },
  {
    kind: "ability",
    source: "slush-rush",
    label: "Slush Rush",
    effectKind: "ability",
    multiplier: 2,
    condition: "snow",
    supportedOrigins: [...SUPPORTED_ORIGINS],
  },
  {
    kind: "ability",
    source: "swift-swim",
    label: "Swift Swim",
    effectKind: "ability",
    multiplier: 2,
    condition: "rain",
    supportedOrigins: [...SUPPORTED_ORIGINS],
  },
  {
    kind: "ability",
    source: "speed-boost",
    label: "Speed Boost",
    effectKind: "stage",
    multiplier: 1.5,
    stage: 1,
    condition: "after 1 turn",
    supportedOrigins: [...SUPPORTED_ORIGINS],
  },
  {
    kind: "item",
    source: "choice-scarf",
    label: "Choice Scarf",
    effectKind: "item",
    multiplier: 1.5,
    supportedOrigins: [...SUPPORTED_ORIGINS],
  },
] satisfies SupportedSpeedModifierMetadata[];

export function getSupportedSpeedModifiers() {
  return SUPPORTED_SPEED_MODIFIERS;
}

export function getSupportedSpeedModifier(
  input: SpeedModifierInput,
): SupportedSpeedModifierMetadata | null {
  const source = normalizeSpeedModifierSource(input.source);

  return (
    SUPPORTED_SPEED_MODIFIERS.find(
      (modifier) => modifier.kind === input.kind && modifier.source === source,
    ) ?? null
  );
}

export function isSpeedAbility(ability: string) {
  return SPEED_ABILITIES.has(normalizeSpeedModifierSource(ability));
}

export function normalizeSpeedModifierSource(source: string) {
  return source
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
