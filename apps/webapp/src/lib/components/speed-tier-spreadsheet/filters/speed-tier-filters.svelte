<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { SpeedTierFilters } from "$lib/speed-tiers";
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
  }: {
    filters: SpeedTierFilters;
    filtersReady: boolean;
    rowsLabel: string;
    pokemonFilterOptions: PokemonFilterOption[];
  } = $props();

  let searchInput = $state(filters.search);
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined =
    undefined;

  function updateSearch(event: Event) {
    searchInput = (event.currentTarget as HTMLInputElement).value;
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
      filters = { ...filters, search: searchInput };
    }, 300);
  }
</script>

<section aria-label="Speed tier filters" class="grid gap-3">
  <div
    class="grid gap-4 md:grid-cols-[minmax(6rem,1fr)_repeat(4,minmax(14rem,auto))]"
  >
    <label class="grid gap-2 text-sm">
      <span class="text-muted-foreground">Search Pokemon</span>
      <Input
        value={searchInput}
        placeholder="Excadrill"
        disabled={!filtersReady}
        oninput={updateSearch}
      />
    </label>

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
