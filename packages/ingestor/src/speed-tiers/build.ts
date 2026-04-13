import { buildSpeedTierCombinations } from "./calculate";
import { groupBySpeedTier, speedTiersToCsv } from "./output";
import type { PokedexPokemon } from "./types";

export function buildSpeedTierOutputs(pokedex: PokedexPokemon[]) {
  const combinations = buildSpeedTierCombinations(pokedex);
  const tiers = groupBySpeedTier(combinations);

  return {
    combinations,
    tiers,
    csv: speedTiersToCsv(tiers),
  };
}
