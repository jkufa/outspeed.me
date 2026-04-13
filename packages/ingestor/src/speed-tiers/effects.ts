import { DOUBLE_SPEED_ABILITIES, STAGE_SPEED_ABILITIES } from "./rules";
import type { HeldItem, SpeedEffect } from "./types";

const DOUBLE_SPEED_ABILITY_CONDITIONS = new Map([
  ["chlorophyll", "sun"],
  ["sand-rush", "sand"],
  ["slush-rush", "snow"],
  ["swift-swim", "rain"],
]);

export function buildSpeedEffects(ability: string | null, item: HeldItem | null): SpeedEffect[] {
  return [buildAbilityEffect(ability), buildItemEffect(item)].filter(
    (effect): effect is SpeedEffect => effect !== null,
  );
}

export function buildAbilityEffect(ability: string | null): SpeedEffect | null {
  if (!ability) {
    return null;
  }

  if (DOUBLE_SPEED_ABILITIES.has(ability)) {
    return {
      kind: "ability",
      source: ability,
      label: toDisplayLabel(ability),
      multiplier: 2,
      condition: DOUBLE_SPEED_ABILITY_CONDITIONS.get(ability),
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
