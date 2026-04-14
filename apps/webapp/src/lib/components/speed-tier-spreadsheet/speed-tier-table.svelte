<script lang="ts">
	import {
		Button,
	} from "$lib/components/ui/button";
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "$lib/components/ui/table";
	import { formatSpread } from "$lib/speed-tiers";
	import type { SpeedTier } from "$lib/speed-tiers";
	import EffectChips from "./effect-chips.svelte";
	import PokemonSetupRow from "./pokemon-setup-row.svelte";
	import SetupDetails from "./setup-details.svelte";

	let { tiers }: { tiers: SpeedTier[] } = $props();

	let expandedKeys = $state(new Set<string>());

	function toggleRow(key: string) {
		const nextKeys = new Set(expandedKeys);

		if (nextKeys.has(key)) {
			nextKeys.delete(key);
		} else {
			nextKeys.add(key);
		}

		expandedKeys = nextKeys;
	}
</script>

{#if tiers.length === 0}
	<div class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
		No speed tiers match these filters.
	</div>
{:else}
	<div class="hidden md:block">
		<Table>
			<TableHeader class="sticky top-0 z-20 bg-background">
				<TableRow>
					<TableHead class="sticky left-0 z-30 bg-background">Speed</TableHead>
					<TableHead>Pokemon</TableHead>
					<TableHead>Spread</TableHead>
					<TableHead>Boosts</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each tiers as tier (tier.speed)}
					{#each tier.pokemon as pokemon, index (pokemon.combinationId)}
						{@const rowKey = pokemon.combinationId}
						<PokemonSetupRow
							{pokemon}
							{rowKey}
							showSpeed={index === 0}
							speed={tier.speed}
							rowspan={tier.pokemon.length}
							expanded={expandedKeys.has(rowKey)}
							onToggle={toggleRow}
						/>
					{/each}
				{/each}
			</TableBody>
		</Table>
	</div>

	<div class="grid gap-4 md:hidden">
		{#each tiers as tier (tier.speed)}
			<section class="rounded-lg border border-border">
				<div class="border-b border-border p-3 text-lg font-semibold tabular-nums">{tier.speed}</div>
				<div class="divide-y divide-border">
					{#each tier.pokemon as pokemon (pokemon.combinationId)}
						{@const mobileRowKey = pokemon.combinationId}
						{@const mobileDetailId = `speed-tier-details-mobile-${mobileRowKey}`}
						<div class="grid gap-2 p-3">
							<div class="flex items-center justify-between gap-3">
								<div class="font-medium">{pokemon.name}</div>
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
							<div class="text-sm tabular-nums text-muted-foreground">{formatSpread(pokemon.spread)}</div>
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
