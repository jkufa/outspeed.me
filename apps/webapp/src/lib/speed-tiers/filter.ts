import { statPointsToEvs } from "./format";
import type { SpeedTier, SpeedTierFilters, SpeedTierPokemon } from "./types";

export const defaultSpeedTierFilters: SpeedTierFilters = {
  search: "",
  mode: "any",
  abilityOnly: false,
  itemOnly: false,
  weather: "any",
  nature: "any",
  statPoints: "any",
};

export function filterSpeedTiers(tiers: SpeedTier[], filters: SpeedTierFilters): SpeedTier[] {
  const search = filters.search.trim().toLocaleLowerCase();

  return tiers
    .map((tier) => ({
      speed: tier.speed,
      pokemon: tier.pokemon.filter((pokemon) => matchesFilters(pokemon, filters, search)),
    }))
    .filter((tier) => tier.pokemon.length > 0);
}

function matchesFilters(pokemon: SpeedTierPokemon, filters: SpeedTierFilters, search: string) {
  if (search !== "" && !pokemon.name.toLocaleLowerCase().includes(search)) {
    return false;
  }

  if (filters.mode === "baseline" && pokemon.effects.length > 0) {
    return false;
  }

  if (filters.mode === "boosted" && pokemon.effects.length === 0) {
    return false;
  }

  if (filters.abilityOnly && !pokemon.effects.some((effect) => effect.kind === "ability")) {
    return false;
  }

  if (filters.itemOnly && !pokemon.effects.some((effect) => effect.kind === "item")) {
    return false;
  }

  if (
    filters.weather !== "any" &&
    !pokemon.effects.some((effect) => effect.condition === filters.weather)
  ) {
    return false;
  }

  if (filters.nature !== "any" && pokemon.spread.nature !== filters.nature) {
    return false;
  }

  if (filters.statPoints !== "any" && pokemon.spread.evs !== statPointsToEvs(filters.statPoints)) {
    return false;
  }

  return true;
}
