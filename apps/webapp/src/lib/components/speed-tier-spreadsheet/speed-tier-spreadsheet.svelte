<script lang="ts">
  import { onMount } from "svelte";
  import { defaultSpeedTierFilters, filterSpeedTiers } from "$lib/speed-tiers";
  import type {
    SpeedTier,
    SpeedTierDisplayTier,
    SpeedTierFilters,
  } from "$lib/speed-tiers";
  import SpeedTierFiltersPanel from "./filters/speed-tier-filters.svelte";
  import SpeedTierTable from "./speed-tier-table.svelte";

  let {
    fullDataUrl,
    tiers,
    totalRows,
  }: {
    fullDataUrl: string;
    tiers: SpeedTierDisplayTier[];
    totalRows: number;
  } = $props();

  // Snapshot the SSR row slice; the full dataset replaces it after hydration.
  // svelte-ignore state_referenced_locally
  let initialTiers = $state([...tiers]);
  let sourceTiers = $state<SpeedTier[] | null>(null);
  let filters = $state<SpeedTierFilters>({ ...defaultSpeedTierFilters });
  let filtersReady = $state(false);
  let dataLoadState = $state<"loading" | "ready" | "error">("loading");
  const activeFilters = $derived({
    search: filters.search,
    boosts: filters.boosts,
    weather: filters.weather,
    nature: filters.nature,
    statPoints: filters.statPoints,
  });
  const filteredTiers = $derived(
    sourceTiers === null
      ? initialTiers
      : filterSpeedTiers(sourceTiers, activeFilters),
  );
  const visibleRows = $derived(
    filteredTiers.reduce((total, tier) => total + tier.pokemon.length, 0),
  );
  const rowsLabel = $derived(
    dataLoadState === "loading"
      ? `${visibleRows} of ${totalRows} rows. Loading full table...`
      : dataLoadState === "error"
        ? `${visibleRows} rows. Full table failed to load.`
        : `${visibleRows} rows`,
  );

  onMount(async () => {
    try {
      const response = await fetch(fullDataUrl);

      if (!response.ok) {
        throw new Error(`Failed to load speed tiers: ${response.status}`);
      }

      sourceTiers = (await response.json()) as SpeedTier[];
      dataLoadState = "ready";
    } catch {
      dataLoadState = "error";
    } finally {
      filtersReady = true;
    }
  });
</script>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
  <header class="flex flex-col gap-2">
    <h1 class="text-2xl font-semibold tracking-tight">Speed tiers</h1>
    <p class="max-w-3xl text-sm text-muted-foreground">
      Find Pokemon by reachable speed, spread, and emitted effect conditions.
    </p>
  </header>

  <SpeedTierFiltersPanel bind:filters {filtersReady} {rowsLabel} />

  <SpeedTierTable tiers={filteredTiers} />
</main>
