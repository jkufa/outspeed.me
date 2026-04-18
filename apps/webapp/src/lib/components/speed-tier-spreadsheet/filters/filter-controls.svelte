<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import type { SpeedTierFilters } from "$lib/speed-tiers";
  import { cn } from "$lib/utils";
  import FieldConditionFilter from "./field-condition-filter/field-condition-filter.svelte";
  import ItemFilter from "./item-filter/item-filter.svelte";
  import PokemonFilter from "./pokemon-filter/pokemon-filter.svelte";
  import type { PokemonFilterOption } from "./pokemon-filter/pokemon-filter-options";
  import SpreadFilter from "./spread-filter/spread-filter.svelte";

  let {
    filters = $bindable(),
    filtersReady,
    pokemonFilterOptions,
    class: className = "",
  }: {
    filters: SpeedTierFilters;
    filtersReady: boolean;
    pokemonFilterOptions: PokemonFilterOption[];
    class?: string;
  } = $props();
</script>

<div class={cn("grid min-w-0 gap-3", className)}>
  <div class="grid min-w-0 gap-2 text-sm">
    <Label class="text-muted-foreground">Pokemon</Label>
    <PokemonFilter
      bind:value={filters.pokemon}
      options={pokemonFilterOptions}
      disabled={!filtersReady}
    />
  </div>

  <div class="grid min-w-0 gap-2 text-sm">
    <Label class="text-muted-foreground">Field Condition</Label>
    <FieldConditionFilter
      bind:value={filters.fieldConditions}
      disabled={!filtersReady}
    />
  </div>

  <div class="grid min-w-0 gap-2 text-sm">
    <Label class="text-muted-foreground">Spreads</Label>
    <SpreadFilter bind:value={filters.spreads} disabled={!filtersReady} />
  </div>

  <div class="grid min-w-0 gap-2 text-sm">
    <Label class="text-muted-foreground">Items</Label>
    <ItemFilter bind:value={filters.items} disabled={!filtersReady} />
  </div>
</div>
