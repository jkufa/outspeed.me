import type { MultiFilterComboboxOption } from "$lib/components/filters/multi-filter-combobox";
import type {
  PokemonSprite,
  SpeedTier,
  SpeedTierDisplayPokemon,
  SpeedTierDisplayTier,
  SpeedTierPokemon,
} from "$lib/speed-tiers";

export type PokemonFilterOption = MultiFilterComboboxOption & {
  sprite: PokemonSprite | null;
};

function spriteForRow(row: SpeedTierPokemon | SpeedTierDisplayPokemon): PokemonSprite | null {
  if ("members" in row && row.members.length > 0) {
    return row.members[0]?.sprite ?? row.sprite ?? null;
  }
  return row.sprite ?? null;
}

/** Unique species (pokedex number) from loaded tiers, sorted by name. */
export function collectPokemonFilterOptions(
  tiers: readonly SpeedTier[] | readonly SpeedTierDisplayTier[],
): PokemonFilterOption[] {
  const byDex = new Map<number, PokemonFilterOption>();

  for (const tier of tiers) {
    for (const row of tier.pokemon) {
      const dex = row.pokedexNo;
      if (byDex.has(dex)) {
        continue;
      }
      byDex.set(dex, {
        value: dex,
        label: row.name,
        sprite: spriteForRow(row),
      });
    }
  }

  return [...byDex.values()].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );
}

export function pokemonFilterAriaLabel(
  selected: readonly number[],
  options: readonly PokemonFilterOption[],
): string {
  if (selected.length === 0) {
    return "Pokemon: all species";
  }

  const lookup = new Map(options.map((opt) => [opt.value, opt.label]));

  return `Pokemon: ${selected.map((v) => lookup.get(v) ?? String(v)).join(", ")}`;
}
