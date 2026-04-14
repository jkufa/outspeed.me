<script lang="ts">
	import {
		evsToStatPoints,
		formatEffectFormula,
		formatNature,
	} from "$lib/speed-tiers";
	import type { SpeedTierPokemon } from "$lib/speed-tiers";

	let { id, pokemon }: { id: string; pokemon: SpeedTierPokemon } = $props();

	const conditions = $derived(
		pokemon.effects
			.map((effect) => effect.condition)
			.filter((condition) => condition !== undefined)
			.join(", "),
	);
</script>

<div {id} class="grid gap-1 text-xs text-muted-foreground">
	<div>Raw speed: {pokemon.spread.rawSpeed}</div>
	<div>Level: {pokemon.spread.level}</div>
	<div>IVs: {pokemon.spread.ivs}</div>
	<div>Stat points: {evsToStatPoints(pokemon.spread.evs)} SP ({pokemon.spread.evs} EV source)</div>
	<div>Nature: {formatNature(pokemon.spread.nature)}</div>
	<div>Formula: {formatEffectFormula(pokemon.spread.rawSpeed, pokemon.effects, pokemon.finalSpeed)}</div>
	{#if conditions !== ""}
		<div>Condition: {conditions}</div>
	{/if}
</div>
