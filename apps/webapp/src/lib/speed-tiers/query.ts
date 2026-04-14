import { defaultSpeedTierFilters, filterSpeedTiers } from "./filter";
import type { SpeedTier, SpeedTierDisplayTier, SpeedTierFilters } from "./types";

export const initialSpeedTierRowLimit = 100;

export type SpeedTierQuery = SpeedTierFilters & {
  limit?: number;
};

export type SpeedTierQueryResult = {
  tiers: SpeedTierDisplayTier[];
  totalRows: number;
  returnedRows: number;
};

export function defaultSpeedTierQuery(limit = initialSpeedTierRowLimit): SpeedTierQuery {
  return {
    ...defaultSpeedTierFilters,
    limit,
  };
}

export function querySpeedTiers(tiers: SpeedTier[], query: SpeedTierQuery): SpeedTierQueryResult {
  const { limit, ...filters } = query;
  const filteredTiers = filterSpeedTiers(tiers, filters);
  const totalRows = countSpeedTierRows(filteredTiers);
  const limitedTiers =
    limit === undefined ? filteredTiers : limitSpeedTierRows(filteredTiers, limit);

  return {
    tiers: limitedTiers,
    totalRows,
    returnedRows: countSpeedTierRows(limitedTiers),
  };
}

export function limitSpeedTierRows(
  tiers: SpeedTierDisplayTier[],
  limit: number,
): SpeedTierDisplayTier[] {
  if (limit <= 0) {
    return [];
  }

  const limitedTiers: SpeedTierDisplayTier[] = [];
  let remainingRows = limit;

  for (const tier of tiers) {
    if (remainingRows <= 0) {
      break;
    }

    const pokemon = tier.pokemon.slice(0, remainingRows);
    limitedTiers.push({ speed: tier.speed, pokemon });
    remainingRows -= pokemon.length;
  }

  return limitedTiers;
}

export function countSpeedTierRows(tiers: SpeedTierDisplayTier[]) {
  return tiers.reduce((totalRows, tier) => totalRows + tier.pokemon.length, 0);
}
