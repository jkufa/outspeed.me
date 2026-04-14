import type { SpeedTier } from "$lib/speed-tiers";

export const ssr = false;

export async function load({ fetch }) {
  const response = await fetch("/assets/speed_tiers.json");

  if (!response.ok) {
    throw new Error(`Failed to load speed tiers: ${response.status}`);
  }

  return {
    tiers: (await response.json()) as SpeedTier[],
  };
}
