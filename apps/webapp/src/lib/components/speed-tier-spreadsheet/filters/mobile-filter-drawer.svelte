<script lang="ts">
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
  import XIcon from "@lucide/svelte/icons/x";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import {
    defaultSpeedTierFilters,
    type SpeedTierFilters,
  } from "$lib/speed-tiers";
  import FilterControls from "./filter-controls.svelte";
  import { countSelectedSpeedTierFilters } from "./filter-summary";
  import type { PokemonFilterOption } from "./pokemon-filter/pokemon-filter-options";

  let {
    filters = $bindable(),
    filtersReady,
    pokemonFilterOptions,
    visibleRows,
  }: {
    filters: SpeedTierFilters;
    filtersReady: boolean;
    pokemonFilterOptions: PokemonFilterOption[];
    visibleRows: number;
  } = $props();

  let open = $state(false);
  let clearDialogOpen = $state(false);
  const selectedFilterCount = $derived(countSelectedSpeedTierFilters(filters));

  function clearFilters() {
    filters = { ...defaultSpeedTierFilters };
    clearDialogOpen = false;
  }
</script>

<Drawer.Root bind:open>
  <Drawer.Trigger class={`${buttonVariants({ variant: "secondary" })} w-full`}>
    <SlidersHorizontalIcon data-icon="inline-start" />
    Filters ({selectedFilterCount})
  </Drawer.Trigger>
  <Drawer.Content>
    <div class="mx-auto flex max-h-[80vh] w-full max-w-xl flex-col px-2">
      <Drawer.Header class="text-left">
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Description>
          Narrow speed tiers by Pokemon, field condition, spread, and item.
        </Drawer.Description>
      </Drawer.Header>

      <div class="flex flex-col gap-4 pb-4">
        <FilterControls
          bind:filters
          {filtersReady}
          {pokemonFilterOptions}
          class="grid-cols-1"
        />
      </div>

      <Drawer.Footer class="mt-8 space-y-2">
        <Dialog.Root bind:open={clearDialogOpen}>
          <Dialog.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                variant="secondary"
                disabled={selectedFilterCount === 0 || Boolean(props.disabled)}
              >
                <XIcon data-icon="inline-start" />
                Clear all filters
              </Button>
            {/snippet}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Clear filters?</Dialog.Title>
              <Dialog.Description>
                This removes all selected filters and updates results
                immediately.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close class={buttonVariants({ variant: "ghost" })}>
                Keep filters
              </Dialog.Close>
              <Button
                type="button"
                variant="destructive"
                onclick={clearFilters}
              >
                Clear filters
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
        <Drawer.Close
          class={buttonVariants({ variant: "default" })}
          onclick={() => (open = false)}
        >
          <EyeIcon data-icon="inline-start" />
          Show {visibleRows} results
        </Drawer.Close>
      </Drawer.Footer>
    </div>
  </Drawer.Content>
</Drawer.Root>
