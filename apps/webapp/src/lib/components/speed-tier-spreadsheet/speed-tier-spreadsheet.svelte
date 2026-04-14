<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Separator } from "$lib/components/ui/separator";
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
	const filteredTiers = $derived(filterSpeedTiers(tiers, filters));
	const visibleRows = $derived(filteredTiers.reduce((total, tier) => total + tier.pokemon.length, 0));

	function updateMode(event: Event) {
		filters.mode = (event.currentTarget as HTMLSelectElement).value as FilterMode;
	}

	function updateWeather(event: Event) {
		filters.weather = (event.currentTarget as HTMLSelectElement).value as WeatherFilter;
	}

	function updateNature(event: Event) {
		filters.nature = (event.currentTarget as HTMLSelectElement).value as NatureFilter;
	}

	function updateStatPoints(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		filters.statPoints = value === "any" ? "any" : (Number(value) as StatPointFilter);
	}

	function resetFilters() {
		filters = { ...defaultSpeedTierFilters };
	}
</script>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
	<header class="flex flex-col gap-2">
		<h1 class="text-2xl font-semibold tracking-tight">Speed tiers</h1>
		<p class="max-w-3xl text-sm text-muted-foreground">
			Find Pokemon by reachable speed, spread, and emitted effect conditions.
		</p>
	</header>

	<section class="grid gap-3 rounded-lg border border-border p-3" aria-label="Speed tier filters">
		<div class="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(8rem,auto))]">
			<label class="grid gap-1 text-sm">
				<span class="text-muted-foreground">Search Pokemon</span>
				<Input bind:value={filters.search} placeholder="Excadrill" />
			</label>

			<label class="grid gap-1 text-sm">
				<span class="text-muted-foreground">Mode</span>
				<select
					class="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
					value={filters.mode}
					onchange={updateMode}
				>
					<option value="any">Any</option>
					<option value="baseline">Baseline</option>
					<option value="boosted">Boosted</option>
				</select>
			</label>

			<label class="grid gap-1 text-sm">
				<span class="text-muted-foreground">Weather</span>
				<select
					class="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
					value={filters.weather}
					onchange={updateWeather}
				>
					<option value="any">Any</option>
					<option value="sun">Sun</option>
					<option value="rain">Rain</option>
					<option value="sand">Sand</option>
					<option value="snow">Snow</option>
				</select>
			</label>

			<label class="grid gap-1 text-sm">
				<span class="text-muted-foreground">Spread</span>
				<select
					class="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
					value={filters.nature}
					onchange={updateNature}
				>
					<option value="any">Any</option>
					<option value="positive">+Spe</option>
					<option value="neutral">neutral</option>
					<option value="negative">-Spe</option>
				</select>
			</label>

			<label class="grid gap-1 text-sm">
				<span class="text-muted-foreground">SP</span>
				<select
					class="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
					value={filters.statPoints}
					onchange={updateStatPoints}
				>
					<option value="any">Any</option>
					<option value="32">32 SP</option>
					<option value="0">0 SP</option>
				</select>
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
			<span class="ml-auto text-sm text-muted-foreground">{visibleRows} rows</span>
		</div>
	</section>

	<Separator />

	<SpeedTierTable tiers={filteredTiers} />
</main>
