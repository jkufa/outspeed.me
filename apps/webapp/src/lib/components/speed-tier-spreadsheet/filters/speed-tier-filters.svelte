<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select";
  import { cn } from "$lib/utils";
  import type {
    BoostFilter,
    NatureFilter,
    SpeedTierFilters,
    StatPointFilter,
    WeatherFilter,
  } from "$lib/speed-tiers";

  let {
    filters = $bindable(),
    filtersReady,
    rowsLabel,
  }: {
    filters: SpeedTierFilters;
    filtersReady: boolean;
    rowsLabel: string;
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

  function weatherLabel(weather: WeatherFilter) {
    if (weather === "any") return "All";
    return weather[0].toUpperCase() + weather.slice(1);
  }

  function natureLabel(nature: NatureFilter) {
    if (nature === "positive") return "+Spe";
    if (nature === "negative") return "-Spe";
    if (nature === "neutral") return "neutral";
    return "All";
  }

  function statPointsLabel(statPoints: StatPointFilter) {
    if (statPoints === "any") return "All";
    return `${statPoints} SP`;
  }

  function updateStatPoints(value: string) {
    filters = {
      ...filters,
      statPoints: value === "any" ? "any" : (Number(value) as 0 | 32),
    };
  }

  function boostsLabel(boosts: BoostFilter[]) {
    if (boosts.length === 0) return "All";
    if (boosts.includes("none")) return "None";
    const parts: string[] = [];
    if (boosts.includes("ability")) parts.push("Abilities");
    if (boosts.includes("item")) parts.push("Items");
    return parts.length > 0 ? parts.join(", ") : "All";
  }

  function selectAllBoosts(checked: boolean) {
    if (checked) {
      filters = { ...filters, boosts: [] };
    }
    // All cannot be deselected directly; choose a narrower option first.
  }

  function toggleBoost(boost: BoostFilter, checked: boolean) {
    if (!checked) {
      filters = {
        ...filters,
        boosts: filters.boosts.filter((selectedBoost) => selectedBoost !== boost),
      };
      return;
    }

    if (boost === "none") {
      filters = { ...filters, boosts: ["none"] };
      return;
    }

    filters = {
      ...filters,
      boosts: [
        ...filters.boosts.filter(
          (selectedBoost) => selectedBoost !== "none" && selectedBoost !== boost,
        ),
        boost,
      ],
    };
  }
</script>

<section aria-label="Speed tier filters" class="grid gap-3">
  <div
    class="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(8rem,auto))]"
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

    <div class="grid gap-2 text-sm">
      <span class="text-muted-foreground">Boosts</span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={!filtersReady}
          aria-label={`Boosts: ${boostsLabel(filters.boosts)}`}
          class={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between",
          )}
        >
          {boostsLabel(filters.boosts)}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem
            checked={filters.boosts.length === 0}
            onCheckedChange={selectAllBoosts}
            closeOnSelect={false}
          >
            All
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={filters.boosts.includes("none")}
            onCheckedChange={(checked: boolean) => toggleBoost("none", checked)}
            closeOnSelect={false}
          >
            None
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={filters.boosts.includes("ability")}
            onCheckedChange={(checked: boolean) =>
              toggleBoost("ability", checked)}
            closeOnSelect={false}
          >
            Abilities
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={filters.boosts.includes("item")}
            onCheckedChange={(checked: boolean) => toggleBoost("item", checked)}
            closeOnSelect={false}
          >
            Items
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <label class="grid gap-2 text-sm">
      <span class="text-muted-foreground">Weather</span>
      <Select.Root
        type="single"
        value={filters.weather}
        onValueChange={(value: string) =>
          (filters = { ...filters, weather: value as WeatherFilter })}
      >
        <Select.Trigger
          class="w-full"
          disabled={!filtersReady}
          aria-label={`Weather: ${weatherLabel(filters.weather)}`}
        >
          <span data-slot="select-value">{weatherLabel(filters.weather)}</span>
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value="any" label="All" />
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
          (filters = { ...filters, nature: value as NatureFilter })}
      >
        <Select.Trigger
          class="w-full"
          disabled={!filtersReady}
          aria-label={`Spread: ${natureLabel(filters.nature)}`}
        >
          <span data-slot="select-value">{natureLabel(filters.nature)}</span>
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value="any" label="All" />
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
        <Select.Trigger
          class="w-full"
          disabled={!filtersReady}
          aria-label={`SP: ${statPointsLabel(filters.statPoints)}`}
        >
          <span data-slot="select-value"
            >{statPointsLabel(filters.statPoints)}</span
          >
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value="any" label="All" />
            <Select.Item value="32" label="32 SP" />
            <Select.Item value="0" label="0 SP" />
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </label>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <span class="ml-auto text-sm text-muted-foreground">{rowsLabel}</span>
  </div>
</section>
