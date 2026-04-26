import {
  getSupportedSpeedModifier,
  normalizeSpeedModifierSource,
  STAGE_SPEED_ABILITIES,
  WEATHER_SPEED_ABILITY_EFFECTS,
} from "./rules";
import type { SpeedEffect, SpeedModifierInput } from "./types";

export function buildSpeedEffects(
  ability: SpeedModifierInput | string | null | undefined,
  item: SpeedModifierInput | string | null | undefined,
): SpeedEffect[] {
  return [buildAbilityEffect(ability), buildItemEffect(item)].filter(
    (effect): effect is SpeedEffect => effect !== null,
  );
}

export function buildAbilityEffect(
  ability: SpeedModifierInput | string | null | undefined,
): SpeedEffect | null {
  const source = toSource(ability);

  if (!source) {
    return null;
  }

  if (isWeatherSpeedAbility(source)) {
    const metadata = getSupportedSpeedModifier({ kind: "ability", source });
    const effect = WEATHER_SPEED_ABILITY_EFFECTS[source];

    return {
      kind: "ability",
      source,
      label: metadata?.label ?? toDisplayLabel(source),
      multiplier: effect.multiplier,
      condition: effect.condition,
    };
  }

  if (STAGE_SPEED_ABILITIES.has(source)) {
    const metadata = getSupportedSpeedModifier({ kind: "ability", source });

    return {
      kind: "stage",
      source,
      label: metadata?.label ?? toDisplayLabel(source),
      multiplier: 1.5,
      stage: 1,
      condition: "after 1 turn",
    };
  }

  throw new Error(`Unsupported speed ability: ${source}`);
}

export function buildItemEffect(
  item: SpeedModifierInput | string | null | undefined,
): SpeedEffect | null {
  const source = toSource(item);

  if (!source) {
    return null;
  }

  if (source === "choice-scarf") {
    const metadata = getSupportedSpeedModifier({ kind: "item", source });

    return {
      kind: "item",
      source,
      label: metadata?.label ?? "Choice Scarf",
      multiplier: 1.5,
    };
  }

  throw new Error(`Unsupported speed item: ${source}`);
}

export function toDisplayLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function toSource(input: SpeedModifierInput | string | null | undefined) {
  if (input === null || input === undefined) {
    return null;
  }

  return normalizeSpeedModifierSource(typeof input === "string" ? input : input.source);
}

function isWeatherSpeedAbility(
  ability: string,
): ability is keyof typeof WEATHER_SPEED_ABILITY_EFFECTS {
  return ability in WEATHER_SPEED_ABILITY_EFFECTS;
}
