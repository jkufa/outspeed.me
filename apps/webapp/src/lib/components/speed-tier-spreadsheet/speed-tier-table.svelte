<script lang="ts">
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import {
    type ColumnDef,
    type SortingState,
    getCoreRowModel,
    getSortedRowModel,
  } from "@tanstack/table-core";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from "$lib/components/ui/data-table";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { formatSpread } from "$lib/speed-tiers";
  import type {
    SpeedTierDisplayPokemon,
    SpeedTierDisplayTier,
  } from "$lib/speed-tiers";
  import { cn } from "$lib/utils";
  import EffectChips from "./effect-chips.svelte";
  import PokemonSprite from "./pokemon-sprite.svelte";
  import SetupDetails from "./setup-details.svelte";
  import SpeedTierPokemonCell from "./speed-tier-pokemon-cell.svelte";

  type SpeedTierTableRow = {
    rowKey: string;
    speed: number;
    speedGroupSize: number;
    showSpeed: boolean;
    pokemon: SpeedTierDisplayPokemon;
  };

  let { tiers }: { tiers: SpeedTierDisplayTier[] } = $props();

  let expandedKeys = $state(new Set<string>());
  let sorting = $state<SortingState>([{ id: "speed", desc: true }]);
  const speedSortDirection = $derived(currentSpeedSort(sorting));
  const speedSortButtonLabel = $derived(speedSortLabel(speedSortDirection));

  const rows = $derived(
    tiers.flatMap((tier) =>
      tier.pokemon.map((pokemon, index) => ({
        rowKey: pokemon.combinationId,
        speed: tier.speed,
        speedGroupSize: tier.pokemon.length,
        showSpeed: index === 0,
        pokemon,
      })),
    ),
  );

  function toggleRow(key: string) {
    const nextKeys = new Set(expandedKeys);

    if (nextKeys.has(key)) {
      nextKeys.delete(key);
    } else {
      nextKeys.add(key);
    }

    expandedKeys = nextKeys;
  }

  function sortDirectionLabel(direction: false | "asc" | "desc") {
    if (direction === "asc") return "ascending";
    if (direction === "desc") return "descending";
    return undefined;
  }

  function speedSortLabel(direction: false | "asc" | "desc") {
    if (direction === "asc") return "Speed sorted ascending";
    return "Speed sorted descending";
  }

  function currentSpeedSort(currentSorting: SortingState) {
    const sort = currentSorting.find((entry) => entry.id === "speed");
    if (sort === undefined) return false;
    return sort.desc ? "desc" : "asc";
  }

  function toggleSpeedSorting(currentSorting: SortingState) {
    const speedSort = currentSpeedSort(currentSorting);

    if (speedSort === "desc") {
      sorting = [{ id: "speed", desc: false }];
      return;
    }

    sorting = [{ id: "speed", desc: true }];
  }

  function buildColumns(
    currentExpandedKeys: Set<string>,
  ): ColumnDef<SpeedTierTableRow>[] {
    return [
      {
        accessorKey: "speed",
        header: "Speed",
        sortDescFirst: true,
      },
      {
        id: "pokemon",
        header: "Pokemon",
        cell: ({ row }) =>
          renderComponent(SpeedTierPokemonCell, {
            pokemon: row.original.pokemon,
            rowKey: row.original.rowKey,
            expanded: currentExpandedKeys.has(row.original.rowKey),
            onToggle: toggleRow,
          }),
        enableSorting: false,
      },
      {
        id: "spread",
        header: "Spread",
        cell: ({ row }) => formatSpread(row.original.pokemon.spread),
        enableSorting: false,
      },
      {
        id: "boosts",
        header: "Boosts",
        cell: ({ row }) =>
          renderComponent(EffectChips, {
            effects: row.original.pokemon.effects,
          }),
        enableSorting: false,
      },
    ];
  }

  const columns = $derived(buildColumns(expandedKeys));

  const table = createSvelteTable({
    get data() {
      return rows;
    },
    get columns() {
      return columns;
    },
    getRowId: (row) => row.rowKey,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    state: {
      get sorting() {
        return sorting;
      },
    },
  });
</script>

{#if tiers.length === 0}
  <div
    class="rounded-lg border border-border p-6 text-sm text-muted-foreground"
  >
    No speed tiers match these filters.
  </div>
{:else}
  <div class="hidden md:block">
    <Table class="table-fixed">
      <colgroup>
        <col class="w-[8%]" />
        <col class="w-[45%]" />
        <col class="w-[17%]" />
        <col class="w-[30%]" />
      </colgroup>
      <TableHeader class="sticky top-0 z-20 bg-background">
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <TableRow>
            {#each headerGroup.headers as header (header.id)}
              <TableHead
                colspan={header.colSpan}
                aria-sort={sortDirectionLabel(
                  header.column.id === "speed" ? speedSortDirection : false,
                )}
                class={header.column.id === "speed" ? "sticky left-0 z-30" : ""}
              >
                {#if !header.isPlaceholder}
                  {#if header.column.id === "speed"}
                    <button
                      type="button"
                      class={cn(buttonVariants({ variant: "ghost" }), "-ms-3")}
                      aria-label={speedSortButtonLabel}
                      onclick={() => toggleSpeedSorting(sorting)}
                    >
                      Speed
                      {#if speedSortDirection === "asc"}
                        <ArrowUpIcon data-icon="inline-end" />
                      {:else}
                        <ArrowDownIcon data-icon="inline-end" />
                      {/if}
                    </button>
                  {:else}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                {/if}
              </TableHead>
            {/each}
          </TableRow>
        {/each}
      </TableHeader>
      <TableBody>
        {#each table.getRowModel().rows as row (row.id)}
          <TableRow class="group/row">
            {#each row.getVisibleCells() as cell (cell.id)}
              {#if cell.column.id !== "speed" || row.original.showSpeed}
                <TableCell
                  rowspan={cell.column.id === "speed"
                    ? row.original.speedGroupSize
                    : undefined}
                  class={cell.column.id === "speed"
                    ? "sticky left-0 z-10 bg-background align-top tabular-nums transition-colors group-hover/row:bg-muted/50"
                    : cell.column.id === "pokemon" ||
                        cell.column.id === "boosts"
                      ? "align-top whitespace-normal"
                      : "align-top tabular-nums"}
                >
                  {#if cell.column.id === "speed"}
                    <div class="text-lg font-semibold">
                      <FlexRender
                        content={cell.column.columnDef.cell}
                        context={cell.getContext()}
                      />
                    </div>
                  {:else}
                    <FlexRender
                      content={cell.column.columnDef.cell}
                      context={cell.getContext()}
                    />
                  {/if}
                </TableCell>
              {/if}
            {/each}
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={columns.length} class="h-24 text-center">
              No speed tiers match these filters.
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <div class="grid gap-4 md:hidden">
    {#each tiers as tier (tier.speed)}
      <section class="rounded-lg border border-border">
        <div
          class="border-b border-border p-3 text-lg font-semibold tabular-nums"
        >
          {tier.speed}
        </div>
        <div class="divide-y divide-border">
          {#each tier.pokemon as pokemon (pokemon.combinationId)}
            {@const mobileRowKey = pokemon.combinationId}
            {@const mobileDetailId = `speed-tier-details-mobile-${mobileRowKey}`}
            <div class="grid gap-2 p-3">
              <div class="flex items-center justify-between gap-3">
                <div
                  class="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-medium"
                >
                  {#each pokemon.members as member (member.slug)}
                    <span class="inline-flex items-center gap-1.5">
                      <PokemonSprite sprite={member.sprite} />
                      <span>{member.name}</span>
                    </span>
                  {/each}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  aria-expanded={expandedKeys.has(mobileRowKey)}
                  aria-controls={mobileDetailId}
                  onclick={() => toggleRow(mobileRowKey)}
                >
                  {expandedKeys.has(mobileRowKey) ? "Hide" : "Details"}
                </Button>
              </div>
              <div class="text-sm tabular-nums text-muted-foreground">
                {formatSpread(pokemon.spread)}
              </div>
              <EffectChips effects={pokemon.effects} />
              {#if expandedKeys.has(mobileRowKey)}
                <SetupDetails id={mobileDetailId} {pokemon} />
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}
