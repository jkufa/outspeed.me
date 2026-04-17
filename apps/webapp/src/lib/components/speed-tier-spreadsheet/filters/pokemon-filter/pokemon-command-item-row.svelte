<script lang="ts">
  import PokemonSprite from "../../pokemon-sprite.svelte";
  import type { PokemonSprite as PokemonSpriteData } from "$lib/speed-tiers";

  let {
    name,
    sprite,
  }: {
    name: string;
    sprite: PokemonSpriteData | null;
  } = $props();
</script>

<span class="flex min-w-0 flex-1 items-center gap-2">
  <PokemonSprite {sprite} size="xs" />
  <span class="truncate">{name}</span>
</span>
