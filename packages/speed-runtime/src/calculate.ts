import { buildAbilityEffect, buildSpeedEffects } from "./effects";
import { DEFAULT_IVS, DEFAULT_LEVEL, MAX_SPEED_EVS, MAX_SPEED_STAT_POINTS } from "./rules";
import type { CalculateSpeedInput, Nature, SpeedCalculation } from "./types";

export function calculateSpeed({
  ability = null,
  baseSpeed,
  item = null,
  ivs = DEFAULT_IVS,
  level = DEFAULT_LEVEL,
  nature,
  statPoints,
}: CalculateSpeedInput): SpeedCalculation {
  const evs = statPointsToEvs(statPoints);
  const rawSpeed = calculateRawSpeedFromEvs({ baseSpeed, evs, ivs, level, nature });
  const modified = calculateModifiedSpeed(rawSpeed, ability, item);

  return {
    ...modified,
    evs,
    statPoints,
    ivs,
    level,
  };
}

export function calculateModifiedSpeed(
  rawSpeed: number,
  ability: CalculateSpeedInput["ability"] = null,
  item: CalculateSpeedInput["item"] = null,
) {
  const effects = buildSpeedEffects(ability, item);
  const steps: SpeedCalculation["steps"] = [{ label: "base", speed: rawSpeed }];
  let speed = rawSpeed;

  for (const effect of effects) {
    if (effect.multiplier === undefined) {
      continue;
    }

    speed = Math.floor(speed * effect.multiplier);
    steps.push({
      label: effect.label,
      multiplier: effect.multiplier,
      speed,
    });
  }

  return {
    rawSpeed,
    finalSpeed: speed,
    effects,
    steps,
  };
}

export function calculateRawSpeed({
  baseSpeed,
  ivs = DEFAULT_IVS,
  level = DEFAULT_LEVEL,
  nature,
  statPoints,
}: Omit<CalculateSpeedInput, "ability" | "item">) {
  return calculateRawSpeedFromEvs({
    baseSpeed,
    evs: statPointsToEvs(statPoints),
    ivs,
    level,
    nature,
  });
}

export function calculateRawSpeedFromEvs({
  baseSpeed,
  evs,
  ivs = DEFAULT_IVS,
  level = DEFAULT_LEVEL,
  nature,
}: {
  baseSpeed: number;
  evs: number;
  nature: Nature;
  level?: number;
  ivs?: number;
}) {
  assertNonNegativeInteger(baseSpeed, "baseSpeed");
  assertNonNegativeInteger(evs, "evs");
  assertNonNegativeInteger(ivs, "ivs");
  assertNonNegativeInteger(level, "level");

  if (evs > MAX_SPEED_EVS) {
    throw new RangeError(`evs must be between 0 and ${MAX_SPEED_EVS}`);
  }

  const statBeforeNature =
    Math.floor(((2 * baseSpeed + ivs + Math.floor(evs / 4)) * level) / 100) + 5;

  return Math.floor(statBeforeNature * getNatureModifier(nature));
}

export function statPointsToEvs(statPoints: number) {
  assertNonNegativeInteger(statPoints, "statPoints");

  if (statPoints > MAX_SPEED_STAT_POINTS) {
    throw new RangeError(`statPoints must be between 0 and ${MAX_SPEED_STAT_POINTS}`);
  }

  if (statPoints === 0) {
    return 0;
  }

  return Math.min(statPoints * 8, MAX_SPEED_EVS);
}

export function getNatureModifier(nature: Nature) {
  if (nature === "positive") {
    return 1.1;
  }

  if (nature === "negative") {
    return 0.9;
  }

  return 1;
}

export function applyAbilityModifier(speed: number, ability: string | null) {
  const effect = buildAbilityEffect(ability);

  if (effect?.multiplier === undefined) {
    return speed;
  }

  return Math.floor(speed * effect.multiplier);
}

function assertNonNegativeInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}
