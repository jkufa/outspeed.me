import speedTiers from "../../../static/assets/speed_tiers.json";
import { querySpeedTiers } from "$lib/speed-tiers";
import type { SpeedTier, SpeedTierQuery, SpeedTierQueryResult } from "$lib/speed-tiers";

export interface SpeedTierStore {
  query: (query: SpeedTierQuery) => Promise<SpeedTierQueryResult>;
}

class JsonSpeedTierStore implements SpeedTierStore {
  constructor(private readonly tiers: SpeedTier[]) {}

  async query(query: SpeedTierQuery) {
    return querySpeedTiers(this.tiers, query);
  }
}

export const speedTierStore: SpeedTierStore = new JsonSpeedTierStore(speedTiers as SpeedTier[]);
