import {
  calculateSpeed,
  getSupportedSpeedModifiers as getRuntimeSupportedSpeedModifiers,
} from "../../../../../packages/speed-runtime/src";
import type { Nature } from "../speed-tiers";
import type {
  CustomBuildModifierInput,
  CustomSpeedCalculationResult,
  SpeedCalculationStep,
  SupportedSpeedModifierMetadata,
} from "./types";

export type CalculateCustomSpeedInput = {
  baseSpeed: number;
  statPoints: number;
  nature: Nature;
  ability: CustomBuildModifierInput | null;
  item: CustomBuildModifierInput | null;
  level?: number;
  ivs?: number;
};

export type SpeedCalculatorApi = {
  calculateCustomSpeed: (input: CalculateCustomSpeedInput) => CustomSpeedCalculationResult;
  getSupportedSpeedModifiers: () => readonly SupportedSpeedModifierMetadata[];
};

export function calculateCustomSpeed(
  input: CalculateCustomSpeedInput,
): CustomSpeedCalculationResult {
  return calculateSpeed({
    baseSpeed: input.baseSpeed,
    statPoints: input.statPoints,
    nature: input.nature,
    ability: input.ability,
    item: input.item,
    level: input.level,
    ivs: input.ivs,
  });
}

export function getSupportedSpeedModifiers(): readonly SupportedSpeedModifierMetadata[] {
  return getRuntimeSupportedSpeedModifiers();
}

export type { CustomSpeedCalculationResult, SpeedCalculationStep, SupportedSpeedModifierMetadata };
