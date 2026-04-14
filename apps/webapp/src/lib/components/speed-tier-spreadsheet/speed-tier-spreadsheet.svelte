<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Separator } from "$lib/components/ui/separator";
  import * as Select from "$lib/components/ui/select";
  import { defaultSpeedTierFilters, filterSpeedTiers } from "$lib/speed-tiers";
  import type {
    FilterMode,
    NatureFilter,
    SpeedTier,
    SpeedTierFilters,
    StatPointFilter,
    WeatherFilter,
  } from "$lib/speed-tiers";
  import SpeedTierTable from "./speed-tier-table.svelte";

  let { tiers }: { tiers: SpeedTier[] } = $props();

  let filters = $state<SpeedTierFilters>({ ...defaultSpeedTierFilters });
  let searchInput = $state(defaultSpeedTierFilters.search);
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined =
    undefined;
  const filteredTiers = $derived(filterSpeedTiers(tiers, filters));
  const visibleRows = $derived(
    filteredTiers.reduce((total, tier) => total + tier.pokemon.length, 0),
  );

  function updateSearch(event: Event) {
    searchInput = (event.currentTarget as HTMLInputElement).value;
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
      filters.search = searchInput;
    }, 300);
  }

  function resetFilters() {
    clearTimeout(searchDebounceTimer);
    searchInput = defaultSpeedTierFilters.search;
    filters = { ...defaultSpeedTierFilters };
  }

  function modeLabel(mode: FilterMode) {
    if (mode === "baseline") return "Baseline";
    if (mode === "boosted") return "Boosted";
    return "Any";
  }

  function weatherLabel(weather: WeatherFilter) {
    if (weather === "any") return "Any";
    return weather[0].toUpperCase() + weather.slice(1);
  }

  function natureLabel(nature: NatureFilter) {
    if (nature === "positive") return "+Spe";
    if (nature === "negative") return "-Spe";
    if (nature === "neutral") return "neutral";
    return "Any";
  }

  function statPointsLabel(statPoints: StatPointFilter) {
    if (statPoints === "any") return "Any";
    return `${statPoints} SP`;
  }

  function updateStatPoints(value: string) {
    filters.statPoints = value === "any" ? "any" : (Number(value) as 0 | 32);
  }
</script>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
  <header class="flex flex-col gap-2">
    <h1 class="text-2xl font-semibold tracking-tight">Speed tiers</h1>
    <p class="max-w-3xl text-sm text-muted-foreground">
      Find Pokemon by reachable speed, spread, and emitted effect conditions.
    </p>
  </header>

  <section
    class="grid gap-3 rounded-lg border border-border p-3"
    aria-label="Speed tier filters"
  >
    <div
      class="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(8rem,auto))]"
    >
      <label class="grid gap-2 text-sm">
        <span class="text-muted-foreground">Search Pokemon</span>
        <Input
          value={searchInput}
          placeholder="Excadrill"
          oninput={updateSearch}
        />
      </label>

      <label class="grid gap-2 text-sm">
        <span class="text-muted-foreground">Mode</span>
        <Select.Root
          type="single"
          value={filters.mode}
          onValueChange={(value: string) =>
            (filters.mode = value as FilterMode)}
        >
          <Select.Trigger class="w-full">
            <span data-slot="select-value">{modeLabel(filters.mode)}</span>
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="any" label="Any" />
              <Select.Item value="baseline" label="Baseline" />
              <Select.Item value="boosted" label="Boosted" />
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </label>

      <label class="grid gap-2 text-sm">
        <span class="text-muted-foreground">Weather</span>
        <Select.Root
          type="single"
          value={filters.weather}
          onValueChange={(value: string) =>
            (filters.weather = value as WeatherFilter)}
        >
          <Select.Trigger class="w-full">
            <span data-slot="select-value">{weatherLabel(filters.weather)}</span
            >
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="any" label="Any" />
              <Select.Item value="sun" label="Sun" />
              <Select.Item value="rain" label="Rain" />
              <Select.Item value="sand" label="Sand" />
              <Select.Item value="snow" label="Snow" />
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </label>

      <label class="grid gap-2 text-sm">
        <span class="text-muted-foreground">Spread</span>
        <Select.Root
          type="single"
          value={filters.nature}
          onValueChange={(value: string) =>
            (filters.nature = value as NatureFilter)}
        >
          <Select.Trigger class="w-full">
            <span data-slot="select-value">{natureLabel(filters.nature)}</span>
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="any" label="Any" />
              <Select.Item value="positive" label="+Spe" />
              <Select.Item value="neutral" label="neutral" />
              <Select.Item value="negative" label="-Spe" />
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </label>

      <label class="grid gap-2 text-sm">
        <span class="text-muted-foreground">SP</span>
        <Select.Root
          type="single"
          value={String(filters.statPoints)}
          onValueChange={updateStatPoints}
        >
          <Select.Trigger class="w-full">
            <span data-slot="select-value"
              >{statPointsLabel(filters.statPoints)}</span
            >
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="any" label="Any" />
              <Select.Item value="32" label="32 SP" />
              <Select.Item value="0" label="0 SP" />
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </label>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button
        variant={filters.abilityOnly ? "secondary" : "outline"}
        size="sm"
        aria-pressed={filters.abilityOnly}
        onclick={() => (filters.abilityOnly = !filters.abilityOnly)}
      >
        Ability effects
      </Button>
      <Button
        variant={filters.itemOnly ? "secondary" : "outline"}
        size="sm"
        aria-pressed={filters.itemOnly}
        onclick={() => (filters.itemOnly = !filters.itemOnly)}
      >
        Item effects
      </Button>
      <Button variant="ghost" size="sm" onclick={resetFilters}>Reset</Button>
      <span class="ml-auto text-sm text-muted-foreground"
        >{visibleRows} rows</span
      >
    </div>
  </section>

  <SpeedTierTable tiers={filteredTiers} />
</main>
