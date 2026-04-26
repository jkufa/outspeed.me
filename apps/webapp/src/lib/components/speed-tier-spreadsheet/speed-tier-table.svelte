<script lang="ts">
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import { tick } from "svelte";
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
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { formatSpread } from "$lib/speed-tiers";
  import type { SpeedTierDisplayTier } from "$lib/speed-tiers";
  import { cn } from "$lib/utils";
  import EffectChips from "./effect-chips.svelte";
  import PokemonSprite from "./pokemon-sprite.svelte";
  import SetupDetails from "./setup-details.svelte";
  import SpeedTierPokemonCell from "./speed-tier-pokemon-cell.svelte";
  import SpeedTierSourceBadge from "./speed-tier-source-badge.svelte";
  import {
    buildSpeedTierTableRows,
    type SpeedTierTableRow,
  } from "./speed-tier-table-rows";
  import {
    currentSpeedSort,
    sortDirectionLabel,
    speedSortLabel,
    toggleSpeedSorting,
  } from "./speed-tier-sorting";

  let {
    tiers,
    sorting = $bindable(),
    findMatchIds,
    activeFindMatchId,
    headerTopOffset,
    onRowOrderChange,
  }: {
    tiers: SpeedTierDisplayTier[];
    sorting: SortingState;
    findMatchIds: string[];
    activeFindMatchId: string | null;
    headerTopOffset: number;
    onRowOrderChange: (rowOrder: string[]) => void;
  } = $props();

  let expandedKeys = $state(new Set<string>());
  let tableHeaderElement = $state<HTMLTableSectionElement | null>(null);
  let tableHeaderHeight = $state(0);
  const speedSortDirection = $derived(currentSpeedSort(sorting));
  const speedSortButtonLabel = $derived(speedSortLabel(speedSortDirection));
  const findMatchIdSet = $derived(new Set(findMatchIds));
  const rows = $derived(buildSpeedTierTableRows(tiers));
  const speedGroupTopOffset = $derived(headerTopOffset + tableHeaderHeight);

  function toggleRow(key: string) {
    const nextKeys = new Set(expandedKeys);

    if (nextKeys.has(key)) {
      nextKeys.delete(key);
    } else {
      nextKeys.add(key);
    }

    expandedKeys = nextKeys;
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

  const rowOrder = $derived(table.getRowModel().rows.map((row) => row.id));
  const mobileSpeedGroups = $derived.by(() => {
    const groups: Array<{ speed: number; rows: SpeedTierTableRow[] }> = [];

    for (const row of table.getRowModel().rows) {
      const speed = row.original.speed;
      const currentGroup = groups.at(-1);

      if (currentGroup?.speed === speed) {
        currentGroup.rows.push(row.original);
        continue;
      }

      groups.push({ speed, rows: [row.original] });
    }

    return groups;
  });

  $effect(() => {
    onRowOrderChange(rowOrder);
  });

  $effect(() => {
    updateTableHeaderHeight();
  });

  function updateTableHeaderHeight() {
    tableHeaderHeight =
      tableHeaderElement?.getBoundingClientRect().height ?? 0;
  }

  function getVisibleFindRowElement(rowKey: string) {
    if (typeof document === "undefined") {
      return null;
    }

    const rowElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-find-row]"),
    ).filter((element) => element.dataset.findRow === rowKey);

    return (
      rowElements.find((element) => element.getClientRects().length > 0) ?? null
    );
  }

  $effect(() => {
    const rowKey = activeFindMatchId;

    if (rowKey === null) {
      return;
    }

    void (async () => {
      await tick();
      const rowElement = getVisibleFindRowElement(rowKey);

      if (rowElement === null) {
        return;
      }

      rowElement.scrollIntoView({ block: "center", behavior: "auto" });
    })();
  });
</script>

<svelte:window onresize={updateTableHeaderHeight} />

{#if tiers.length === 0}
  <div
    class="rounded-lg border border-border p-6 text-sm text-muted-foreground"
  >
    No speed tiers match these filters.
  </div>
{:else}
  <div class="hidden md:block">
    <table class="w-full table-fixed caption-bottom text-sm">
      <colgroup>
        <col class="w-[8%]" />
        <col class="w-[45%]" />
        <col class="w-[17%]" />
        <col class="w-[30%]" />
      </colgroup>
      <TableHeader bind:ref={tableHeaderElement}>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <TableRow class="border-none">
            {#each headerGroup.headers as header (header.id)}
              <TableHead
                colspan={header.colSpan}
                aria-sort={sortDirectionLabel(
                  header.column.id === "speed" ? speedSortDirection : false,
                )}
                class={cn(
                  "sticky z-20 bg-background shadow-[inset_0_-1px_0_0_var(--color-border)]",
                  header.column.id === "speed" ? "left-0 z-30" : "",
                )}
                style={`top: ${headerTopOffset}px;`}
              >
                {#if !header.isPlaceholder}
                  {#if header.column.id === "speed"}
                    <button
                      type="button"
                      class={cn(buttonVariants({ variant: "ghost" }), "-ms-3")}
                      aria-label={speedSortButtonLabel}
                      onclick={() => (sorting = toggleSpeedSorting(sorting))}
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
          {@const isFindMatch = findMatchIdSet.has(row.id)}
          {@const isActiveFindMatch = activeFindMatchId === row.id}
          {@const isCustomBuildRow = row.original.pokemon.source?.kind === "custom-build"}
          {@const visibleCells = row
            .getVisibleCells()
            .filter(
              (cell) => cell.column.id !== "speed" || row.original.showSpeed,
            )}
          {@const borderedCells = visibleCells.filter(
            (cell) => cell.column.id !== "speed",
          )}
          <TableRow
            data-find-row={row.id}
            class={cn(
              "group/row",
              isActiveFindMatch
                ? "bg-accent/60"
                : isFindMatch
                  ? "bg-accent/25"
                  : isCustomBuildRow
                    ? "border-l-2 border-l-primary/60 bg-primary/5"
                    : "",
            )}
          >
            {#each visibleCells as cell (cell.id)}
              <TableCell
                rowspan={cell.column.id === "speed"
                  ? row.original.speedGroupSize
                  : undefined}
                class={cn(
                  cell.column.id === "speed"
                    ? "z-10 align-top tabular-nums transition-colors"
                    : cell.column.id === "pokemon" ||
                        cell.column.id === "boosts"
                      ? "align-top whitespace-normal"
                      : "align-top tabular-nums",
                  cell.column.id === "speed"
                    ? isFindMatch
                      ? "bg-accent/25"
                      : "bg-background"
                    : "",
                  isActiveFindMatch && cell.column.id !== "speed"
                    ? cn(
                        "border-y border-ring",
                        cell === borderedCells[0]
                          ? "border-l border-l-ring"
                          : "",
                        cell === borderedCells[borderedCells.length - 1]
                          ? "border-r border-r-ring"
                          : "",
                      )
                    : "",
                )}
              >
                {#if cell.column.id === "speed"}
                  <div
                    class="text-4xl font-semibold tabular-nums sticky"
                    style={`top: ${speedGroupTopOffset}px;`}
                  >
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
    </table>
  </div>

  <div data-speed-tier-mobile-list class="grid gap-4 md:hidden">
    {#each mobileSpeedGroups as tier (tier.speed)}
      <section class="border-t border-border -mx-4">
        <div
          class="pt-3 px-3 pb-1 mb-2 text-3xl font-semibold tabular-nums bg-background sticky top-0"
        >
          {tier.speed}
        </div>
        {#each tier.rows as row (row.rowKey)}
          {@const pokemon = row.pokemon}
          {@const mobileRowKey = row.rowKey}
          {@const mobileDetailId = `speed-tier-details-mobile-${mobileRowKey}`}
          {@const isFindMatch = findMatchIdSet.has(mobileRowKey)}
          {@const isActiveFindMatch = activeFindMatchId === mobileRowKey}
          {@const isCustomBuildRow = pokemon.source?.kind === "custom-build"}
          <div
            data-find-row={mobileRowKey}
            class={cn(
              "grid gap-2 p-3",
              isActiveFindMatch
                ? "relative z-10 bg-accent/60 ring-2 ring-ring"
                : isFindMatch
                  ? "bg-accent/25"
                  : isCustomBuildRow
                    ? "border-l-2 border-l-primary/60 bg-primary/5"
                    : "",
            )}
          >
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
                <SpeedTierSourceBadge source={pokemon.source} />
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
            <div class="text-sm tabular-nums text-muted-foreground font-mono">
              {formatSpread(pokemon.spread)}
            </div>
            <EffectChips effects={pokemon.effects} />
            {#if expandedKeys.has(mobileRowKey)}
              <SetupDetails id={mobileDetailId} {pokemon} />
            {/if}
          </div>
        {/each}
      </section>
    {/each}
  </div>
{/if}
