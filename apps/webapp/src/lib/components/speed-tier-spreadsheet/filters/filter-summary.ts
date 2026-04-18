import type { SpeedTierFilters } from "$lib/speed-tiers";

export function countSelectedSpeedTierFilters(filters: SpeedTierFilters) {
  return (
    filters.pokemon.length +
    filters.fieldConditions.length +
    filters.spreads.length +
    filters.items.length
  );
}
