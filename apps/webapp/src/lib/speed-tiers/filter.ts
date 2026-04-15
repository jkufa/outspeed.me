import { groupSpeedTierRows } from "./display";
import { statPointsToEvs } from "./format";
import { fieldConditionFilterValues } from "./types";
import type { SpeedTier, SpeedTierDisplayTier, SpeedTierFilters, SpeedTierPokemon } from "./types";

const fieldConditionFilterValueSet = new Set<string>(fieldConditionFilterValues);

export const defaultSpeedTierFilters: SpeedTierFilters = {
  search: "",
  pokemon: [],
  boosts: ["none"],
  fieldConditions: [],
  nature: "any",
  statPoints: "any",
};

export function filterSpeedTiers(
  tiers: SpeedTier[],
  filters: SpeedTierFilters,
): SpeedTierDisplayTier[] {
  const search = filters.search.trim().toLocaleLowerCase();

  const filteredTiers = tiers
    .map((tier) => ({
      speed: tier.speed,
      pokemon: tier.pokemon.filter((pokemon) => matchesFilters(pokemon, filters, search)),
    }))
    .filter((tier) => tier.pokemon.length > 0);

  return groupSpeedTierRows(filteredTiers);
}

function matchesFilters(pokemon: SpeedTierPokemon, filters: SpeedTierFilters, search: string) {
  if (
    search !== "" &&
    !pokemon.name.toLocaleLowerCase().includes(search) &&
    !pokemon.slug?.toLocaleLowerCase().includes(search)
  ) {
    return false;
  }

  if (filters.pokemon.length > 0 && !filters.pokemon.includes(pokemon.pokedexNo)) {
    return false;
  }

  if (!matchesBoostFilter(pokemon, filters.boosts)) {
    return false;
  }

  if (!matchesFieldConditionFilter(pokemon, filters.fieldConditions)) {
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

function matchesFieldConditionFilter(
  pokemon: SpeedTierPokemon,
  fieldConditions: SpeedTierFilters["fieldConditions"],
) {
  if (fieldConditions.length === 0) {
    return true;
  }

  const selectedConditions = new Set<string>(fieldConditions);
  const pokemonFieldConditions = pokemon.effects
    .map((effect) => effect.condition)
    .filter(
      (condition): condition is string =>
        condition !== undefined && fieldConditionFilterValueSet.has(condition),
    );

  if (pokemonFieldConditions.length === 0) {
    return true;
  }

  return pokemonFieldConditions.some((condition) => selectedConditions.has(condition));
}
