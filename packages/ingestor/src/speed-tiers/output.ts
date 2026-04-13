import { rowsToCsv } from "../parser/csv";
import type { SpeedTier, SpeedTierCombination, SpeedTierPokemon } from "./types";

export function groupBySpeedTier(combinations: SpeedTierCombination[]): SpeedTier[] {
  const tiers = new Map<number, SpeedTierPokemon[]>();

  for (const combination of combinations) {
    const { tier, ...pokemon } = combination;
    const tierPokemon = tiers.get(tier) ?? [];
    tierPokemon.push(pokemon);
    tiers.set(tier, tierPokemon);
  }

  return [...tiers.entries()]
    .sort(([leftTier], [rightTier]) => rightTier - leftTier)
    .map(([tier, pokemon]) => ({
      tier,
      pokemon: pokemon.sort((leftPokemon, rightPokemon) => {
        if (leftPokemon.pokedex_no !== rightPokemon.pokedex_no) {
          return leftPokemon.pokedex_no - rightPokemon.pokedex_no;
        }

        if (leftPokemon.id !== rightPokemon.id) {
          return leftPokemon.id - rightPokemon.id;
        }

        return leftPokemon.name.localeCompare(rightPokemon.name);
      }),
    }));
}

export function speedTiersToCsv(tiers: SpeedTier[]) {
  const rows = [["tier", "id", "pokedex_no", "name", "EVs", "ability", "nature", "item"]];

  for (const tier of tiers) {
    for (const pokemon of tier.pokemon) {
      rows.push([
        String(tier.tier),
        String(pokemon.id),
        String(pokemon.pokedex_no),
        pokemon.name,
        String(pokemon.EVs),
        pokemon.ability ?? "",
        pokemon.nature,
        pokemon.item ?? "",
      ]);
    }
  }

  return rowsToCsv(rows);
}
