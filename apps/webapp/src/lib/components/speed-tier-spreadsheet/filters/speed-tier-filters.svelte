<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import type { SpeedTierFilters } from "$lib/speed-tiers";
  import FindPokemon from "./find-pokemon/find-pokemon.svelte";
  import FieldConditionFilter from "./field-condition-filter/field-condition-filter.svelte";
  import ItemFilter from "./item-filter/item-filter.svelte";
  import PokemonFilter from "./pokemon-filter/pokemon-filter.svelte";
  import type { PokemonFilterOption } from "./pokemon-filter/pokemon-filter-options";
  import SpreadFilter from "./spread-filter/spread-filter.svelte";

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
  } = $props();
</script>

<section aria-label="Speed tier filters" class="grid gap-3">
  <div
    class="grid gap-4 md:grid-cols-[minmax(6rem,1fr)_repeat(4,minmax(14rem,auto))]"
  >
    <div class="grid text-sm gap-2">
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

    <div class="grid text-sm gap-2">
      <Label class="text-muted-foreground">Pokemon</Label>
      <PokemonFilter
        bind:value={filters.pokemon}
        options={pokemonFilterOptions}
        disabled={!filtersReady}
      />
    </div>

    <div class="grid text-sm gap-2">
      <Label class="text-muted-foreground">Field Condition</Label>
      <FieldConditionFilter
        bind:value={filters.fieldConditions}
        disabled={!filtersReady}
      />
    </div>

    <div class="grid text-sm gap-2">
      <Label class="text-muted-foreground">Spreads</Label>
      <SpreadFilter bind:value={filters.spreads} disabled={!filtersReady} />
    </div>

    <div class="grid text-sm gap-2">
      <Label class="text-muted-foreground">Items</Label>
      <ItemFilter bind:value={filters.items} disabled={!filtersReady} />
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <span class="ml-auto text-sm text-muted-foreground">{rowsLabel}</span>
  </div>
</section>
