import type { SpeedTierDisplayPokemon, SpeedTierDisplayTier } from "$lib/speed-tiers";

export type SpeedTierTableRow = {
  rowKey: string;
  speed: number;
  speedGroupSize: number;
  showSpeed: boolean;
  pokemon: SpeedTierDisplayPokemon;
};

export function buildSpeedTierTableRows(tiers: SpeedTierDisplayTier[]): SpeedTierTableRow[] {
  return tiers.flatMap((tier) =>
    tier.pokemon.map((pokemon, index) => ({
      rowKey: pokemon.combinationId,
      speed: tier.speed,
      speedGroupSize: tier.pokemon.length,
      showSpeed: index === 0,
      pokemon,
    })),
  );
}

export function rowMatchesPokemonFind(row: SpeedTierTableRow, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (normalizedQuery === "") {
    return false;
  }

  return row.pokemon.members.some((member) =>
    member.name.toLocaleLowerCase().includes(normalizedQuery),
  );
}
