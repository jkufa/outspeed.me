<script lang="ts">
  import { cn } from "$lib/utils";
  import type { PokemonSprite as PokemonSpriteData } from "$lib/speed-tiers";

  type PokemonSpriteSize = "xs" | "sm" | "md" | "lg";

  let {
    sprite,
    size = "sm",
  }: {
    sprite: PokemonSpriteData | null;
    size?: PokemonSpriteSize;
  } = $props();

  const fallbackSpriteUrl =
    "https://archives.bulbagarden.net/media/upload/8/8e/Spr_3r_000.png";
  const spriteSizes: Record<PokemonSpriteSize, string> = {
    xs: "size-12",
    sm: "size-16",
    md: "size-20",
    lg: "size-24",
  };
  const spriteSize = $derived(spriteSizes[size]);
  let imageFailed = $state(false);
  const spriteUrl = $derived(
    imageFailed ? fallbackSpriteUrl : (sprite?.path ?? fallbackSpriteUrl),
  );
</script>

<span
  class={cn("grid shrink-0 place-items-center", spriteSize)}
  aria-hidden="true"
>
  <img
    src={spriteUrl}
    alt=""
    loading="lazy"
    decoding="async"
    class="size-full object-contain"
    onerror={() => (imageFailed = true)}
  />
</span>
