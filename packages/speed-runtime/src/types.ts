export type Nature = "neutral" | "positive" | "negative";
export type SpeedModifierKind = "ability" | "item";
export type SpeedModifierOrigin = "manual" | "showdown";
export type SpeedEffectKind = "ability" | "item" | "field" | "weather" | "terrain" | "stage";

export type SpeedModifierInput = {
  kind: SpeedModifierKind;
  source: string;
  label?: string;
};

export type SpeedEffect = {
  kind: SpeedEffectKind;
  source: string;
  label: string;
  multiplier?: number;
  stage?: number;
  condition?: string;
};

export type SpeedCalculationStep = {
  label: string;
  speed: number;
  multiplier?: number;
};

export type SpeedCalculation = {
  rawSpeed: number;
  finalSpeed: number;
  evs: number;
  statPoints: number;
  ivs: number;
  level: number;
  effects: SpeedEffect[];
  steps: SpeedCalculationStep[];
};

export type SupportedSpeedModifierMetadata = {
  kind: SpeedModifierKind;
  source: string;
  label: string;
  effectKind: SpeedEffectKind;
  multiplier?: number;
  stage?: number;
  condition?: string;
  supportedOrigins: SpeedModifierOrigin[];
};

export type CalculateSpeedInput = {
  baseSpeed: number;
  statPoints: number;
  nature: Nature;
  ability?: SpeedModifierInput | string | null;
  item?: SpeedModifierInput | string | null;
  level?: number;
  ivs?: number;
};
