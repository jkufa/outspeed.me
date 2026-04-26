<script lang="ts">
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import { onMount } from "svelte";
  import {
    MyBuildsDrawer,
    UnsupportedModifiersNotice,
    type CustomBuildDisplayBuild,
    type CustomBuildImportPreview,
    type CustomBuildImportState,
    type CustomBuildModifierOption,
    type CustomBuildSpeciesOption,
  } from "$lib/components/custom-builds";
  import { Button } from "$lib/components/ui/button";
  import {
    buildCustomBuildSpeciesLookup,
    createCustomBuildStore,
    getSupportedSpeedModifiers,
    mergeCustomSpeedTiers,
    parseShowdownSet,
    resolveCustomBuilds,
    resolveShowdownBuildInput,
    toCustomSpeedTiers,
    type CustomBuildId,
    type CustomBuildInput,
    type CustomBuildStoreState,
    type CustomBuildValidationIssue,
    type ShowdownParseIssue,
    type UnsupportedSpeedModifier,
  } from "$lib/custom-builds";
  import {
    defaultSpeedTierFilters,
    filterSpeedTiers,
    formatMultiplier,
  } from "$lib/speed-tiers";
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

  type CustomBuildNotice = {
    tone: "success" | "warning" | "error";
    message: string;
    modifiers?: UnsupportedSpeedModifier[];
  };

  // Snapshot the SSR row slice; the full dataset replaces it after hydration.
  // svelte-ignore state_referenced_locally
  let initialTiers = $state([...tiers]);
  let sourceTiers = $state<SpeedTier[] | null>(null);
  let customBuildStoreState = $state<CustomBuildStoreState>({
    builds: [],
    hydrationStatus: "idle",
    lastWriteStatus: null,
  });
  let customBuildNotice = $state<CustomBuildNotice | null>(null);
  let customBuildsOnly = $state(false);
  let editingBuild = $state<CustomBuildDisplayBuild | null>(null);
  let importText = $state("");
  let importState = $state<CustomBuildImportState>({ status: "idle" });
  let filters = $state<SpeedTierFilters>({ ...defaultSpeedTierFilters });
  let findValue = $state("");
  let debouncedFindValue = $state("");
  let tableRowOrder = $state<string[]>([]);
  let activeFindMatchId = $state<string | null>(null);
  let activeFindMatchIndexHint = $state(0);
  let sorting = $state([...defaultSpeedTierSorting]);
  let filtersReady = $state(false);
  let dataLoadState = $state<"loading" | "ready" | "error">("loading");
  let desktopFiltersElement = $state<HTMLDivElement | null>(null);
  let headerTopOffset = $state(0);
  const customBuildSpeciesLookup = $derived(
    sourceTiers === null ? null : buildCustomBuildSpeciesLookup(sourceTiers),
  );
  const customBuildStore = createCustomBuildStore({
    hasSpecies: (species) => customBuildSpeciesLookup?.hasSpecies(species) ?? false,
  });
  const activeFilters = $derived({
    pokemon: filters.pokemon,
    items: filters.items,
    fieldConditions: filters.fieldConditions,
    spreads: filters.spreads,
  });
  const resolvedCustomBuilds = $derived(
    customBuildSpeciesLookup === null
      ? { resolved: [], failures: [] }
      : resolveCustomBuilds(customBuildStoreState.builds, customBuildSpeciesLookup),
  );
  const mergedSourceTiers = $derived.by(() => {
    if (sourceTiers === null) {
      return null;
    }

    return mergeCustomSpeedTiers(
      sourceTiers,
      toCustomSpeedTiers(resolvedCustomBuilds.resolved),
    );
  });
  const visibleSourceTiers = $derived.by(() => {
    if (mergedSourceTiers === null) {
      return null;
    }

    return customBuildsOnly ? customOnlySpeedTiers(mergedSourceTiers) : mergedSourceTiers;
  });
  const pokemonFilterOptions = $derived(
    collectPokemonFilterOptions(visibleSourceTiers ?? initialTiers),
  );
  const filteredTiers = $derived(
    visibleSourceTiers === null
      ? initialTiers
      : filterSpeedTiers(visibleSourceTiers, activeFilters),
  );
  const supportedModifierOptions = $derived(buildSupportedModifierOptions());
  const customBuildSpeciesOptions = $derived(
    (customBuildSpeciesLookup?.species ?? []).map(
      (species): CustomBuildSpeciesOption => ({
        id: species.id,
        slug: species.slug,
        pokedexNo: species.pokedexNo,
        name: species.name,
      }),
    ),
  );
  const customBuildDisplayBuilds = $derived(buildCustomBuildDisplayBuilds());
  const customBuildControlsDisabled = $derived(
    dataLoadState !== "ready" || customBuildSpeciesLookup === null,
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

  $effect(() => {
    updateHeaderTopOffset();
  });

  $effect(() => {
    if (customBuildsOnly && customBuildDisplayBuilds.length === 0) {
      customBuildsOnly = false;
    }
  });

  function updateHeaderTopOffset() {
    headerTopOffset =
      desktopFiltersElement?.getBoundingClientRect().height ?? 0;
  }

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

  function customOnlySpeedTiers(tiers: readonly SpeedTier[]): SpeedTier[] {
    return tiers
      .map((tier) => ({
        speed: tier.speed,
        pokemon: tier.pokemon.filter(
          (pokemon) => pokemon.source?.kind === "custom-build",
        ),
      }))
      .filter((tier) => tier.pokemon.length > 0);
  }

  function buildSupportedModifierOptions() {
    return getSupportedSpeedModifiers().reduce(
      (options, modifier) => {
        const option: CustomBuildModifierOption = {
          kind: modifier.kind,
          source: modifier.source,
          label: modifier.label,
          description: describeModifier(modifier),
        };

        if (modifier.kind === "ability") {
          options.abilityOptions.push(option);
        } else {
          options.itemOptions.push(option);
        }

        return options;
      },
      {
        abilityOptions: [] as CustomBuildModifierOption[],
        itemOptions: [] as CustomBuildModifierOption[],
      },
    );
  }

  function describeModifier(modifier: ReturnType<typeof getSupportedSpeedModifiers>[number]) {
    if (modifier.multiplier !== undefined) {
      return `${formatMultiplier(modifier.multiplier)} Speed`;
    }

    if (modifier.stage !== undefined) {
      return `${modifier.stage > 0 ? "+" : ""}${modifier.stage} Speed stage`;
    }

    return undefined;
  }

  function buildCustomBuildDisplayBuilds(): CustomBuildDisplayBuild[] {
    const resolvedById = new Map(
      resolvedCustomBuilds.resolved.map((resolved) => [resolved.build.id, resolved]),
    );
    const failuresById = new Map(
      resolvedCustomBuilds.failures.map((failure) => [failure.build.id, failure]),
    );

    return customBuildStoreState.builds.map((build) => {
      const resolved = resolvedById.get(build.id);
      const failure = failuresById.get(build.id);

      return {
        ...build,
        finalSpeed: resolved?.calculation.finalSpeed,
        rawSpeed: resolved?.calculation.rawSpeed,
        strippedModifiers: resolved?.strippedModifiers ?? failure?.strippedModifiers,
      };
    });
  }

  function hydrationNotice(
    status: CustomBuildStoreState["hydrationStatus"],
  ): CustomBuildNotice | null {
    if (status === "corrupt") {
      return {
        tone: "warning",
        message:
          "Saved custom builds could not be read, so the table is using built-in rows only.",
      };
    }

    if (status === "schema-mismatch") {
      return {
        tone: "warning",
        message:
          "Saved custom builds use an older format and were skipped for this session.",
      };
    }

    if (status === "unavailable") {
      return {
        tone: "warning",
        message:
          "Local storage is unavailable. Custom builds can be edited during this session, but may not persist.",
      };
    }

    return null;
  }

  function mutationNotice(
    result: ReturnType<typeof customBuildStore.add> | ReturnType<typeof customBuildStore.remove>,
    successMessage: string,
    modifiers: UnsupportedSpeedModifier[] = [],
  ) {
    if (!result.ok) {
      customBuildNotice = {
        tone: "error",
        message: result.issues.map((issue) => issue.message).join(" "),
      };
      return false;
    }

    if (!result.write.ok) {
      customBuildNotice = {
        tone: "warning",
        message:
          "Build updated in memory, but local storage is unavailable so it may not persist after refresh.",
        modifiers,
      };
      return true;
    }

    customBuildNotice = {
      tone: modifiers.length > 0 ? "warning" : "success",
      message: successMessage,
      modifiers,
    };
    return true;
  }

  function createManualBuild(build: CustomBuildInput) {
    if (customBuildControlsDisabled) {
      return;
    }

    mutationNotice(customBuildStore.add(build), "Custom build saved.");
  }

  function updateManualBuild(id: CustomBuildId, build: CustomBuildInput) {
    if (customBuildControlsDisabled) {
      return;
    }

    if (mutationNotice(customBuildStore.update(id, build), "Custom build updated.")) {
      editingBuild = null;
    }
  }

  function deleteBuild(build: CustomBuildDisplayBuild) {
    if (mutationNotice(customBuildStore.remove(build.id), "Custom build deleted.")) {
      if (editingBuild?.id === build.id) {
        editingBuild = null;
      }
    }
  }

  function previewShowdownImport(showdownText: string) {
    if (customBuildSpeciesLookup === null) {
      importState = {
        status: "error",
        errors: [
          {
            code: "unsupported-syntax",
            message: "Wait for the full speed tier data to load before importing.",
          },
        ],
      };
      return;
    }

    const parsed = parseShowdownSet(showdownText);
    if (!parsed.ok) {
      importState = { status: "error", errors: parsed.errors };
      return;
    }

    const preview = resolveShowdownBuildInput(parsed.build, customBuildSpeciesLookup);
    if (!preview.ok) {
      importState = {
        status: "error",
        errors: validationIssuesToShowdownIssues(preview.issues),
      };
      return;
    }

    importState = {
      status: "parsed",
      preview: {
        build: parsed.build,
        resolvedInput: preview.input,
        strippedModifiers: preview.strippedModifiers,
      },
      warnings: parsed.warnings,
    };
  }

  function saveShowdownImport(preview: CustomBuildImportPreview) {
    if (preview.resolvedInput === undefined) {
      return;
    }

    if (
      mutationNotice(
        customBuildStore.add(preview.resolvedInput),
        "Showdown build imported.",
        preview.strippedModifiers,
      )
    ) {
      importText = "";
      importState = { status: "idle" };
    }
  }

  function clearShowdownImport() {
    importText = "";
    importState = { status: "idle" };
  }

  function validationIssuesToShowdownIssues(
    issues: CustomBuildValidationIssue[],
  ): ShowdownParseIssue[] {
    return issues.map((issue) => ({
      code: "unsupported-syntax",
      message: issue.message,
    }));
  }

  async function loadFullData() {
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
  }

  onMount(() => {
    const unsubscribe = customBuildStore.subscribe((state) => {
      customBuildStoreState = state;
    });

    const read = customBuildStore.hydrate();
    customBuildNotice = hydrationNotice(read.status);
    void loadFullData();

    return unsubscribe;
  });
</script>

<svelte:window onresize={updateHeaderTopOffset} />

<main class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 pb-44 md:p-6">
  <header class="flex flex-col gap-2">
    <h1 class="text-2xl font-semibold tracking-tight">Speed tiers</h1>
    <p class="max-w-3xl text-sm text-muted-foreground">
      Find which Pokemon hit key Speed stats with specific spreads and active
      effects.
    </p>
  </header>

  {#if customBuildNotice}
    <section
      aria-live="polite"
      class={`grid gap-3 rounded-lg border p-4 text-sm ${
        customBuildNotice.tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : customBuildNotice.tone === "warning"
            ? "border-border bg-muted/50"
            : "border-border bg-card"
      }`}
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p>{customBuildNotice.message}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="self-start"
          onclick={() => (customBuildNotice = null)}
        >
          Dismiss
        </Button>
      </div>
      {#if customBuildNotice.modifiers && customBuildNotice.modifiers.length > 0}
        <UnsupportedModifiersNotice modifiers={customBuildNotice.modifiers} />
      {/if}
    </section>
  {/if}

  {#if resolvedCustomBuilds.failures.length > 0}
    <section
      aria-live="polite"
      class="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground"
    >
      {resolvedCustomBuilds.failures.length}
      saved custom
      {resolvedCustomBuilds.failures.length === 1 ? "build" : "builds"} could not
      be resolved against the loaded speed tier data.
    </section>
  {/if}

  <div
    bind:this={desktopFiltersElement}
    class="hidden bg-background pt-6 md:block sticky top-0 z-40"
  >
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
    >
      <div class="grid gap-2 md:col-span-2 xl:col-span-1">
        <span class="text-sm font-medium text-muted-foreground">Custom builds</span>
        <div class="flex flex-wrap gap-2">
          <MyBuildsDrawer
            triggerLabel={dataLoadState === "loading" ? "Loading builds" : "My builds"}
            builds={customBuildDisplayBuilds}
            {editingBuild}
            speciesOptions={customBuildSpeciesOptions}
            abilityOptions={supportedModifierOptions.abilityOptions}
            itemOptions={supportedModifierOptions.itemOptions}
            bind:importText
            {importState}
            disabled={customBuildControlsDisabled}
            onCreateManual={createManualBuild}
            onUpdateManual={updateManualBuild}
            onCancelEdit={() => (editingBuild = null)}
            onStartEdit={(build) => (editingBuild = build)}
            onDelete={deleteBuild}
            onPreviewImport={previewShowdownImport}
            onSaveImport={saveShowdownImport}
            onClearImport={clearShowdownImport}
          />
          <Button
            type="button"
            variant={customBuildsOnly ? "default" : "secondary"}
            aria-pressed={customBuildsOnly}
            disabled={!filtersReady || customBuildDisplayBuilds.length === 0}
            onclick={() => (customBuildsOnly = !customBuildsOnly)}
          >
            My builds only
          </Button>
        </div>
      </div>
    </FiltersPanel>
  </div>

  <SpeedTierTable
    tiers={filteredTiers}
    bind:sorting
    {findMatchIds}
    {activeFindMatchId}
    {headerTopOffset}
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
        <MyBuildsDrawer
          triggerLabel={dataLoadState === "loading" ? "Loading builds" : "My builds"}
          builds={customBuildDisplayBuilds}
          {editingBuild}
          speciesOptions={customBuildSpeciesOptions}
          abilityOptions={supportedModifierOptions.abilityOptions}
          itemOptions={supportedModifierOptions.itemOptions}
          bind:importText
          {importState}
          disabled={customBuildControlsDisabled}
          onCreateManual={createManualBuild}
          onUpdateManual={updateManualBuild}
          onCancelEdit={() => (editingBuild = null)}
          onStartEdit={(build) => (editingBuild = build)}
          onDelete={deleteBuild}
          onPreviewImport={previewShowdownImport}
          onSaveImport={saveShowdownImport}
          onClearImport={clearShowdownImport}
        />
        <Button
          type="button"
          variant={customBuildsOnly ? "default" : "secondary"}
          aria-pressed={customBuildsOnly}
          disabled={!filtersReady || customBuildDisplayBuilds.length === 0}
          onclick={() => (customBuildsOnly = !customBuildsOnly)}
        >
          My builds only
        </Button>
      </div>
    </div>
  </div>
</main>
