<script lang="ts">
  import type { Snippet } from "svelte";
  import { Label } from "$lib/components/ui/label";
  import type { SpeedTierFilters } from "$lib/speed-tiers";
  import FilterControls from "./filter-controls.svelte";
  import FindPokemon from "./find-pokemon/find-pokemon.svelte";
  import type { PokemonFilterOption } from "./pokemon-filter/pokemon-filter-options";

  let {
    filters = $bindable(),
    filtersReady,
    rowsLabel,
    pokemonFilterOptions,
    findValue = $bindable(""),
    findMatchLabel,
    hasFindMatches,
    onFindNext,
    onFindPrevious,
    onFindClear,
    children,
  }: {
    filters: SpeedTierFilters;
    filtersReady: boolean;
    rowsLabel: string;
    pokemonFilterOptions: PokemonFilterOption[];
    findValue?: string;
    findMatchLabel: string | null;
    hasFindMatches: boolean;
    onFindNext: () => void;
    onFindPrevious: () => void;
    onFindClear: () => void;
    children?: Snippet;
  } = $props();
</script>

<section
  aria-label="Speed tier filters"
  class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,12.5rem)_minmax(0,12rem)_minmax(0,12rem)]"
>
  <div class="grid min-w-0 gap-2 md:col-span-2 xl:col-span-1">
    <Label class="text-muted-foreground">Find Pokemon</Label>
    <FindPokemon
      bind:value={findValue}
      matchCountLabel={findMatchLabel}
      hasMatches={hasFindMatches}
      disabled={!filtersReady}
      onNext={onFindNext}
      onPrevious={onFindPrevious}
      onClear={onFindClear}
    />
  </div>

  {@render children?.()}

  <FilterControls
    bind:filters
    {filtersReady}
    {pokemonFilterOptions}
    class="hidden md:grid"
  />

  <div
    class="hidden flex-wrap items-center gap-2 md:flex md:col-span-2 xl:col-span-5"
  >
    <span class="ml-auto text-sm text-muted-foreground">{rowsLabel}</span>
  </div>
</section>
