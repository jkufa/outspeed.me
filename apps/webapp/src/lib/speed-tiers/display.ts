import type {
  SpeedEffect,
  SpeedSpread,
  SpeedTier,
  SpeedTierDisplayMember,
  SpeedTierDisplayPokemon,
  SpeedTierDisplayTier,
  SpeedTierPokemon,
} from "./types";

export function groupSpeedTierRows(tiers: SpeedTier[]): SpeedTierDisplayTier[] {
  return tiers.map((tier) => ({
    speed: tier.speed,
    pokemon: groupPokemonRows(tier.pokemon),
  }));
}

function groupPokemonRows(pokemon: SpeedTierPokemon[]): SpeedTierDisplayPokemon[] {
  const groups = new Map<string, SpeedTierPokemon[]>();

  for (const row of pokemon) {
    const key = buildDisplayGroupKey(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  return [...groups.values()].map(toDisplayPokemon);
}

function buildDisplayGroupKey(pokemon: SpeedTierPokemon) {
  return [
    `pokedex:${pokemon.pokedexNo}`,
    `spread:${spreadSignature(pokemon.spread)}`,
    `final:${pokemon.finalSpeed}`,
    `effects:${effectGroupSignature(pokemon.effects)}`,
  ].join("|");
}

function spreadSignature(spread: SpeedSpread) {
  return [spread.nature, spread.evs, spread.ivs, spread.level, spread.rawSpeed].join(":");
}

function effectGroupSignature(effects: SpeedEffect[]) {
  if (effects.length === 0) {
    return "none";
  }

  if (effects.length === 1) {
    const [effect] = effects;

    if (effect.kind === "ability" && effect.multiplier !== undefined) {
      return `ability:${effect.multiplier}`;
    }

    return `${effect.kind}:${effect.source}:${effect.label}:${effect.multiplier ?? ""}:${
      effect.stage ?? ""
    }:${effect.condition ?? ""}`;
  }

  return effects
    .map(
      (effect) =>
        `${effect.kind}:${effect.source}:${effect.label}:${effect.multiplier ?? ""}:${
          effect.stage ?? ""
        }:${effect.condition ?? ""}`,
    )
    .join(";");
}

function toDisplayPokemon(rows: SpeedTierPokemon[]): SpeedTierDisplayPokemon {
  const [representative] = rows;

  if (representative === undefined) {
    throw new Error("Cannot build display row from empty Pokemon group");
  }

  return {
    ...representative,
    name: rows.map((row) => row.name).join(", "),
    members: uniqueMembers(rows.map(toDisplayMember)),
    effects: mergeDisplayEffects(rows),
    sourceEffects: rows.flatMap((row) => row.effects),
  };
}

function toDisplayMember(pokemon: SpeedTierPokemon): SpeedTierDisplayMember {
  return {
    id: pokemon.id,
    slug: pokemon.slug ?? String(pokemon.id),
    pokedexNo: pokemon.pokedexNo,
    name: pokemon.name,
    sprite: pokemon.sprite ?? null,
  };
}

function mergeDisplayEffects(rows: SpeedTierPokemon[]): SpeedEffect[] {
  const effects = rows.flatMap((row) => row.effects);

  if (effects.length === 0) {
    return [];
  }

  const firstEffect = effects[0];

  if (
    firstEffect !== undefined &&
    effects.every(
      (effect) =>
        effect.kind === "ability" &&
        firstEffect.kind === "ability" &&
        effect.multiplier === firstEffect.multiplier,
    )
  ) {
    return [
      {
        kind: "ability",
        source: unique(effects.map((effect) => effect.source)).join("/"),
        label: unique(effects.map((effect) => effect.label)).join("/"),
        multiplier: firstEffect.multiplier,
      },
    ];
  }

  return uniqueEffects(effects);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function uniqueEffects(effects: SpeedEffect[]) {
  const effectByKey = new Map<string, SpeedEffect>();

  for (const effect of effects) {
    effectByKey.set(JSON.stringify(effect), effect);
  }

  return [...effectByKey.values()];
}

function uniqueMembers(members: SpeedTierDisplayMember[]) {
  const memberByKey = new Map<string, SpeedTierDisplayMember>();

  for (const member of members) {
    memberByKey.set(`${member.id}:${member.slug}`, member);
  }

  return [...memberByKey.values()];
}
