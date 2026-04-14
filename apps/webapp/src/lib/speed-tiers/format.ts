import type { EffectChip, Nature, SpeedEffect, SpeedEv, SpeedSpread } from "./types";

export function formatNature(nature: Nature) {
  if (nature === "positive") {
    return "+Spe";
  }

  if (nature === "negative") {
    return "-Spe";
  }

  return "neutral";
}

export function evsToStatPoints(evs: SpeedEv) {
  if (evs === 252) {
    return 32;
  }

  return 0;
}

export function statPointsToEvs(statPoints: 0 | 32): SpeedEv {
  if (statPoints === 32) {
    return 252;
  }

  return 0;
}

export function formatSpread(spread: SpeedSpread) {
  return `${formatNature(spread.nature)} ${evsToStatPoints(spread.evs)} SP`;
}

export function formatMultiplier(multiplier: number) {
  return `${Number.isInteger(multiplier) ? multiplier.toFixed(0) : multiplier}x`;
}

export function effectToChips(effect: SpeedEffect): EffectChip[] {
  const chips: EffectChip[] = [];

  if (effect.multiplier !== undefined) {
    chips.push({
      key: `${effect.source}-multiplier-${effect.multiplier}`,
      label: formatMultiplier(effect.multiplier),
      kind: "multiplier",
    });
  }

  chips.push({
    key: `${effect.source}-label-${effect.label}`,
    label: effect.label,
    kind: effect.kind,
  });

  if (effect.condition !== undefined) {
    chips.push({
      key: `${effect.source}-condition-${effect.condition}`,
      label: effect.condition,
      kind: "condition",
    });
  }

  if (effect.stage !== undefined) {
    chips.push({
      key: `${effect.source}-stage-${effect.stage}`,
      label: `${effect.stage > 0 ? "+" : ""}${effect.stage}`,
      kind: "stage",
    });
  }

  return chips;
}

export function effectsToChips(effects: SpeedEffect[]): EffectChip[] {
  if (effects.length === 0) {
    return [{ key: "baseline", label: "baseline", kind: "baseline" }];
  }

  return effects.flatMap(effectToChips);
}

export function formatEffectFormula(rawSpeed: number, effects: SpeedEffect[], finalSpeed: number) {
  if (effects.length === 0) {
    return `${rawSpeed} = ${finalSpeed}`;
  }

  const factors = effects.map(formatEffectFactor).join(" ");
  return `${rawSpeed} ${factors} = ${finalSpeed}`;
}

function formatEffectFactor(effect: SpeedEffect) {
  const multiplier =
    effect.multiplier === undefined ? "" : `x ${formatMultiplier(effect.multiplier)} `;
  return `${multiplier}${effect.label}`.trim();
}
