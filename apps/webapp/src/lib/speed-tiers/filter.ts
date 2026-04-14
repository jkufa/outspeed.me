import { statPointsToEvs } from "./format";
import type { SpeedTier, SpeedTierFilters, SpeedTierPokemon } from "./types";

export const defaultSpeedTierFilters: SpeedTierFilters = {
  search: "",
  boosts: ["none"],
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

  if (!matchesBoostFilter(pokemon, filters.boosts)) {
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

function matchesBoostFilter(pokemon: SpeedTierPokemon, boosts: SpeedTierFilters["boosts"]) {
  if (boosts.length === 0) {
    return true;
  }

  if (boosts.includes("none")) {
    return pokemon.effects.length === 0;
  }

  return boosts.some((boost) =>
    boost === "ability"
      ? pokemon.effects.some((effect) => effect.kind === "ability")
      : pokemon.effects.some((effect) => effect.kind === "item"),
  );
}
