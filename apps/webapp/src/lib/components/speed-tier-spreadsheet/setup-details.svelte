<script lang="ts">
  import {
    formatEffectFormula,
    formatNature,
    spreadToStatPoints,
  } from "$lib/speed-tiers";
  import type { SpeedTierDisplayPokemon } from "$lib/speed-tiers";

  let { id, pokemon }: { id: string; pokemon: SpeedTierDisplayPokemon } = $props();

  const conditions = $derived(
    [...new Set(pokemon.sourceEffects.map((effect) => effect.condition))]
      .filter((condition) => condition !== undefined)
      .join(", "),
  );
</script>

<div {id} class="grid gap-1 text-xs text-muted-foreground">
  {#if pokemon.source?.kind === "custom-build"}
    <div>Source: My build ({pokemon.source.origin})</div>
  {/if}
  <div>Raw speed: {pokemon.spread.rawSpeed}</div>
  <div>Level: {pokemon.spread.level}</div>
  <div>
    Stat points: {spreadToStatPoints(pokemon.spread)} SP
  </div>
  <div>Nature: {formatNature(pokemon.spread.nature)}</div>
  <div>
    Formula: {formatEffectFormula(
      pokemon.spread.rawSpeed,
      pokemon.effects,
      pokemon.finalSpeed,
    )}
  </div>
  {#if conditions !== ""}
    <div>Condition: {conditions}</div>
  {/if}
</div>
