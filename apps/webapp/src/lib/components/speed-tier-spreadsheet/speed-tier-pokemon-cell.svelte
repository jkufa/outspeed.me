<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import type { SpeedTierDisplayPokemon } from "$lib/speed-tiers";
	import PokemonSprite from "./pokemon-sprite.svelte";
	import SetupDetails from "./setup-details.svelte";

	let {
		pokemon,
		rowKey,
		expanded,
		onToggle,
	}: {
		pokemon: SpeedTierDisplayPokemon;
		rowKey: string;
		expanded: boolean;
		onToggle: (rowKey: string) => void;
	} = $props();

	const detailId = $derived(`speed-tier-details-${rowKey}`);
</script>

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
