<script lang="ts">
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { defaultSpeedTierFilters, filterSpeedTiers } from "$lib/speed-tiers";
  import type {
    SpeedTier,
    SpeedTierDisplayTier,
    SpeedTierFilters,
  } from "$lib/speed-tiers";
  import { collectPokemonFilterOptions } from "./filters/pokemon-filter/pokemon-filter-options";
  import FiltersPanel from "./filters/filters-panel.svelte";
  import FindPokemon from "./filters/find-pokemon/find-pokemon.svelte";
  import MobileFilterDrawer from "./filters/mobile-filter-drawer.svelte";
  import {
    buildSpeedTierTableRows,
    rowMatchesPokemonFind,
  } from "./speed-tier-table-rows";
  import {
    currentSpeedSort,
    defaultSpeedTierSorting,
    speedSortLabel,
    toggleSpeedSorting,
  } from "./speed-tier-sorting";
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
  let findValue = $state("");
  let debouncedFindValue = $state("");
  let tableRowOrder = $state<string[]>([]);
  let activeFindMatchId = $state<string | null>(null);
  let activeFindMatchIndexHint = $state(0);
  let sorting = $state([...defaultSpeedTierSorting]);
  let filtersReady = $state(false);
  let dataLoadState = $state<"loading" | "ready" | "error">("loading");
  const activeFilters = $derived({
    pokemon: filters.pokemon,
    items: filters.items,
    fieldConditions: filters.fieldConditions,
    spreads: filters.spreads,
  });
  const pokemonFilterOptions = $derived(
    collectPokemonFilterOptions(sourceTiers ?? initialTiers),
  );
  const filteredTiers = $derived(
    sourceTiers === null
      ? initialTiers
      : filterSpeedTiers(sourceTiers, activeFilters),
  );
  const visibleRows = $derived(
    filteredTiers.reduce((total, tier) => total + tier.pokemon.length, 0),
  );
  const tableRows = $derived(buildSpeedTierTableRows(filteredTiers));
  const orderedTableRows = $derived.by(() => {
    if (tableRowOrder.length !== tableRows.length) {
      return tableRows;
    }

    const rowsByKey = new Map(tableRows.map((row) => [row.rowKey, row]));
    const orderedRows = tableRowOrder
      .map((rowKey) => rowsByKey.get(rowKey))
      .filter((row) => row !== undefined);

    return orderedRows.length === tableRows.length ? orderedRows : tableRows;
  });
  const findMatchIds = $derived(
    orderedTableRows
      .filter((row) => rowMatchesPokemonFind(row, debouncedFindValue))
      .map((row) => row.rowKey),
  );
  const activeFindMatchIndex = $derived(
    activeFindMatchId === null ? -1 : findMatchIds.indexOf(activeFindMatchId),
  );
  const findMatchLabel = $derived.by(() => {
    if (debouncedFindValue.trim() === "") {
      return null;
    }

    if (findMatchIds.length === 0) {
      return "No matches";
    }

    return `${Math.max(activeFindMatchIndex, 0) + 1} of ${findMatchIds.length}`;
  });
  const rowsLabel = $derived(
    dataLoadState === "loading"
      ? `${visibleRows} of ${totalRows} rows. Loading full table...`
      : dataLoadState === "error"
        ? `${visibleRows} rows. Full table failed to load.`
        : `${visibleRows} rows`,
  );
  const speedSortDirection = $derived(currentSpeedSort(sorting));
  const speedSortButtonLabel = $derived(speedSortLabel(speedSortDirection));

  $effect(() => {
    const nextValue = findValue;

    if (nextValue.trim() === "") {
      debouncedFindValue = "";
      return;
    }

    const debounceTimer = setTimeout(() => {
      debouncedFindValue = nextValue;
    }, 300);

    return () => clearTimeout(debounceTimer);
  });

  $effect(() => {
    if (debouncedFindValue.trim() === "" || findMatchIds.length === 0) {
      activeFindMatchId = null;
      activeFindMatchIndexHint = 0;
      return;
    }

    if (activeFindMatchId !== null) {
      const currentIndex = findMatchIds.indexOf(activeFindMatchId);

      if (currentIndex !== -1) {
        activeFindMatchIndexHint = currentIndex;
        return;
      }
    }

    const nextIndex = Math.min(
      activeFindMatchIndexHint,
      findMatchIds.length - 1,
    );
    activeFindMatchIndexHint = nextIndex;
    activeFindMatchId = findMatchIds[nextIndex] ?? null;
  });

  function updateTableRowOrder(nextRowOrder: string[]) {
    if (
      nextRowOrder.length === tableRowOrder.length &&
      nextRowOrder.every((rowKey, index) => rowKey === tableRowOrder[index])
    ) {
      return;
    }

    tableRowOrder = nextRowOrder;
  }

  function setActiveFindMatch(index: number) {
    if (findMatchIds.length === 0) {
      return;
    }

    const normalizedIndex = (index + findMatchIds.length) % findMatchIds.length;
    activeFindMatchIndexHint = normalizedIndex;
    activeFindMatchId = findMatchIds[normalizedIndex] ?? null;
  }

  function goToNextFindMatch() {
    if (findMatchIds.length === 0) {
      return;
    }

    setActiveFindMatch(
      activeFindMatchId === null ? 0 : activeFindMatchIndex + 1,
    );
  }

  function goToPreviousFindMatch() {
    if (findMatchIds.length === 0) {
      return;
    }

    setActiveFindMatch(
      activeFindMatchId === null
        ? findMatchIds.length - 1
        : activeFindMatchIndex - 1,
    );
  }

  function clearFind() {
    findValue = "";
    debouncedFindValue = "";
    activeFindMatchId = null;
    activeFindMatchIndexHint = 0;
  }

  function toggleMobileSpeedSorting() {
    sorting = toggleSpeedSorting(sorting);
  }

  onMount(async () => {
    try {
      const response = await fetch(fullDataUrl);

      if (!response.ok) {
        throw new Error(`Failed to load speed tiers: ${response.status}`);
      }

      sourceTiers = (await response.json()) as SpeedTier[];
      dataLoadState = "ready";
      filtersReady = true;
    } catch {
      dataLoadState = "error";
      filtersReady = false;
    }
  });
</script>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 pb-44 md:p-6">
  <header class="flex flex-col gap-2">
    <h1 class="text-2xl font-semibold tracking-tight">Speed tiers</h1>
    <p class="max-w-3xl text-sm text-muted-foreground">
      Find which Pokemon hit key Speed stats with specific spreads and active
      effects.
    </p>
  </header>

  <div class="hidden bg-background pt-6 md:block sticky top-0 z-40">
    <FiltersPanel
      bind:filters
      bind:findValue
      {filtersReady}
      {rowsLabel}
      {pokemonFilterOptions}
      {findMatchLabel}
      hasFindMatches={findMatchIds.length > 0}
      onFindNext={goToNextFindMatch}
      onFindPrevious={goToPreviousFindMatch}
      onFindClear={clearFind}
    />
  </div>

  <SpeedTierTable
    tiers={filteredTiers}
    bind:sorting
    {findMatchIds}
    {activeFindMatchId}
    headerTopOffset={0}
    onRowOrderChange={updateTableRowOrder}
  />

  <div
    class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(0,0,0,0.24)] backdrop-blur md:hidden"
  >
    <div class="mx-auto grid w-full max-w-7xl gap-2">
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="font-medium">Find Pokemon</span>
        <span class="text-muted-foreground">{rowsLabel}</span>
      </div>
      <FindPokemon
        bind:value={findValue}
        matchCountLabel={findMatchLabel}
        hasMatches={findMatchIds.length > 0}
        disabled={!filtersReady}
        onNext={goToNextFindMatch}
        onPrevious={goToPreviousFindMatch}
        onClear={clearFind}
      />
      <div class="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          aria-label={speedSortButtonLabel}
          onclick={toggleMobileSpeedSorting}
        >
          Speed
          {#if speedSortDirection === "asc"}
            <ArrowUpIcon data-icon="inline-end" />
          {:else}
            <ArrowDownIcon data-icon="inline-end" />
          {/if}
        </Button>
        <MobileFilterDrawer
          bind:filters
          {filtersReady}
          {pokemonFilterOptions}
          {visibleRows}
        />
      </div>
    </div>
  </div>
</main>
