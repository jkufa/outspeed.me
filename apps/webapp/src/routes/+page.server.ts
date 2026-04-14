import { speedTierStore } from "$lib/server/speed-tier-store";
import { defaultSpeedTierQuery } from "$lib/speed-tiers";

export const prerender = true;

export async function load() {
  const result = await speedTierStore.query(defaultSpeedTierQuery());

  return {
    fullDataUrl: "/assets/speed_tiers.json",
    returnedRows: result.returnedRows,
    tiers: result.tiers,
    totalRows: result.totalRows,
  };
}
