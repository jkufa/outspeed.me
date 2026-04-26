import {
  DEFAULT_IVS,
  DEFAULT_LEVEL,
  NATURES as RUNTIME_NATURES,
  isSpeedAbility,
} from "../../../speed-runtime/src";
import type { CombinationRule, HeldItem, Nature, SpeedEv } from "./types";

export const LEVEL = DEFAULT_LEVEL;
export const IV = DEFAULT_IVS;
export const SPEED_EVS: SpeedEv[] = [0, 252];
export const NATURES: Nature[] = RUNTIME_NATURES;
export const HELD_ITEMS: (HeldItem | null)[] = [null, "choice-scarf"];
export const COMBINATION_RULES: CombinationRule[] = [
  {
    name: "skip held items for mega Pokemon",
    shouldInclude: ({ item, pokemon }) => item === null || !isMegaPokemon(pokemon),
  },
  {
    name: "skip choice scarf with speed abilities",
    shouldInclude: ({ ability, item }) =>
      item !== "choice-scarf" || ability === null || !isSpeedAbility(ability),
  },
  {
    name: "skip any speed modifier with negative nature",
    shouldInclude: ({ ability, item, nature }) =>
      nature !== "negative" || (ability === null && item === null),
  },
  {
    name: "skip any speed modifier with no speed EVs",
    shouldInclude: ({ ability, evs, item }) => evs !== 0 || (ability === null && item === null),
  },
  {
    name: "skip negative nature with full speed EVs",
    shouldInclude: ({ evs, nature }) => nature !== "negative" || evs !== 252,
  },
];

export function isMegaPokemon(pokemon: { name: string; slug: string }) {
  return /(?:^|-)mega(?:-|$)/.test(pokemon.slug) || pokemon.name.startsWith("Mega ");
}

export {
  DOUBLE_SPEED_ABILITIES,
  SPEED_ABILITIES,
  STAGE_SPEED_ABILITIES,
  WEATHER_SPEED_ABILITY_EFFECTS,
  isSpeedAbility,
} from "../../../speed-runtime/src";
