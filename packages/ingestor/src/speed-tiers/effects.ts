import {
  buildAbilityEffect as buildRuntimeAbilityEffect,
  buildItemEffect as buildRuntimeItemEffect,
  buildSpeedEffects as buildRuntimeSpeedEffects,
  toDisplayLabel,
} from "../../../speed-runtime/src";
import type { HeldItem, SpeedEffect } from "./types";

export function buildSpeedEffects(ability: string | null, item: HeldItem | null): SpeedEffect[] {
  return buildRuntimeSpeedEffects(ability, item);
}

export function buildAbilityEffect(ability: string | null): SpeedEffect | null {
  return buildRuntimeAbilityEffect(ability);
}

export function buildItemEffect(item: HeldItem | null): SpeedEffect | null {
  return buildRuntimeItemEffect(item);
}
export { toDisplayLabel };
