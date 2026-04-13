import { STAGE_SPEED_ABILITIES, WEATHER_SPEED_ABILITY_EFFECTS } from "./rules";
import type { HeldItem, SpeedEffect } from "./types";

export function buildSpeedEffects(ability: string | null, item: HeldItem | null): SpeedEffect[] {
  return [buildAbilityEffect(ability), buildItemEffect(item)].filter(
    (effect): effect is SpeedEffect => effect !== null,
  );
}

export function buildAbilityEffect(ability: string | null): SpeedEffect | null {
  if (!ability) {
    return null;
  }

  if (isWeatherSpeedAbility(ability)) {
    const effect = WEATHER_SPEED_ABILITY_EFFECTS[ability];

    return {
      kind: "ability",
      source: ability,
      label: toDisplayLabel(ability),
      multiplier: effect.multiplier,
      condition: effect.condition,
    };
  }

  if (STAGE_SPEED_ABILITIES.has(ability)) {
    return {
      kind: "stage",
      source: ability,
      label: toDisplayLabel(ability),
      multiplier: 1.5,
      stage: 1,
      condition: "after 1 turn",
    };
  }

  throw new Error(`Unsupported speed ability: ${ability}`);
}

export function buildItemEffect(item: HeldItem | null): SpeedEffect | null {
  if (!item) {
    return null;
  }

  if (item === "choice-scarf") {
    return {
      kind: "item",
      source: item,
      label: "Choice Scarf",
      multiplier: 1.5,
    };
  }

  throw new Error(`Unsupported speed item: ${item}`);
}

export function toDisplayLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function isWeatherSpeedAbility(
  ability: string,
): ability is keyof typeof WEATHER_SPEED_ABILITY_EFFECTS {
  return ability in WEATHER_SPEED_ABILITY_EFFECTS;
}
