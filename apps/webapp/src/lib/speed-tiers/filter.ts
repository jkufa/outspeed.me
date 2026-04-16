import { groupSpeedTierRows } from "./display";
import { fieldConditionFilterValues } from "./types";
import type {
  SpeedTier,
  SpeedTierDisplayTier,
  SpeedTierFilters,
  SpeedTierPokemon,
  SpreadFilterKey,
} from "./types";

const fieldConditionFilterValueSet = new Set<string>(fieldConditionFilterValues);

export const defaultSpeedTierFilters: SpeedTierFilters = {
  search: "",
  pokemon: [],
  boosts: ["none"],
  fieldConditions: [],
  spreads: [],
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

  if (!matchesSpreadFilter(pokemon, filters.spreads)) {
    return false;
  }

  return true;
}

function spreadKeyFromPokemon(pokemon: SpeedTierPokemon): SpreadFilterKey | null {
  const { nature, evs } = pokemon.spread;
  if (nature === "positive") {
    return evs === 252 ? "positive-252" : "positive-0";
  }
  if (nature === "neutral") {
    return evs === 252 ? "neutral-252" : "neutral-0";
  }
  if (nature === "negative") {
    return evs === 0 ? "negative-0" : null;
  }
  return null;
}

function matchesSpreadFilter(pokemon: SpeedTierPokemon, spreads: SpeedTierFilters["spreads"]) {
  if (spreads.length === 0) {
    return true;
  }

  const selected = new Set<string>(spreads);
  const key = spreadKeyFromPokemon(pokemon);
  return key !== null && selected.has(key);
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
