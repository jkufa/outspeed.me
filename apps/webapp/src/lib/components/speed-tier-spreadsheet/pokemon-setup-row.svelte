<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { TableCell, TableRow } from "$lib/components/ui/table";
	import { formatSpread } from "$lib/speed-tiers";
	import type { SpeedTierDisplayPokemon } from "$lib/speed-tiers";
	import EffectChips from "./effect-chips.svelte";
	import PokemonSprite from "./pokemon-sprite.svelte";
	import SetupDetails from "./setup-details.svelte";

	let {
		pokemon,
		rowKey,
		showSpeed,
		speed,
		rowspan,
		expanded,
		onToggle,
	}: {
		pokemon: SpeedTierDisplayPokemon;
		rowKey: string;
		showSpeed: boolean;
		speed: number;
		rowspan: number;
		expanded: boolean;
		onToggle: (rowKey: string) => void;
	} = $props();

	const detailId = $derived(`speed-tier-details-${rowKey}`);
</script>

<TableRow>
	{#if showSpeed}
		<TableCell rowspan={rowspan} class="sticky left-0 z-10 bg-background align-top tabular-nums">
			<div class="text-lg font-semibold">{speed}</div>
		</TableCell>
	{/if}

	<TableCell class="min-w-44 align-top whitespace-normal">
		<div class="flex flex-col gap-2">
			<div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-medium">
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
				class="w-fit"
				aria-expanded={expanded}
				aria-controls={detailId}
				onclick={() => onToggle(rowKey)}
			>
				{expanded ? "Hide details" : "Details"}
			</Button>
			{#if expanded}
				<SetupDetails id={detailId} {pokemon} />
			{/if}
		</div>
	</TableCell>

	<TableCell class="align-top tabular-nums">{formatSpread(pokemon.spread)}</TableCell>
	<TableCell class="min-w-72 align-top whitespace-normal">
		<EffectChips effects={pokemon.effects} />
	</TableCell>
</TableRow>
