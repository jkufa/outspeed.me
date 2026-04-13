import { rowsToCsv } from "../parser/csv";
import type {
  Nature,
  SpeedEffect,
  SpeedSpread,
  SpeedTier,
  SpeedTierCombination,
  SpeedTierPokemon,
} from "./types";

export function groupBySpeedTier(combinations: SpeedTierCombination[]): SpeedTier[] {
  const tiers = new Map<number, SpeedTierPokemon[]>();

  for (const combination of combinations) {
    const { speed, ...pokemon } = combination;
    const tierPokemon = tiers.get(speed) ?? [];
    tierPokemon.push(pokemon);
    tiers.set(speed, tierPokemon);
  }

  return [...tiers.entries()]
    .sort(([leftSpeed], [rightSpeed]) => rightSpeed - leftSpeed)
    .map(([speed, pokemon]) => ({
      speed,
      pokemon: pokemon.sort(compareSpeedTierPokemon),
    }));
}

export function speedTiersToCsv(tiers: SpeedTier[]) {
  const rows = [["speed", "id", "pokedex_no", "name", "spread", "effects"]];

  for (const tier of tiers) {
    for (const pokemon of tier.pokemon) {
      rows.push([
        String(tier.speed),
        String(pokemon.id),
        String(pokemon.pokedexNo),
        pokemon.name,
        formatSpread(pokemon.spread),
        pokemon.effects.map(formatEffect).join("; "),
      ]);
    }
  }

  return rowsToCsv(rows);
}

export function compareSpeedTierPokemon(
  leftPokemon: SpeedTierPokemon,
  rightPokemon: SpeedTierPokemon,
) {
  if (leftPokemon.pokedexNo !== rightPokemon.pokedexNo) {
    return leftPokemon.pokedexNo - rightPokemon.pokedexNo;
  }

  if (leftPokemon.id !== rightPokemon.id) {
    return leftPokemon.id - rightPokemon.id;
  }

  const nameComparison = leftPokemon.name.localeCompare(rightPokemon.name);

  if (nameComparison !== 0) {
    return nameComparison;
  }

  const natureComparison =
    getNatureSortRank(leftPokemon.spread.nature) - getNatureSortRank(rightPokemon.spread.nature);

  if (natureComparison !== 0) {
    return natureComparison;
  }

  if (leftPokemon.spread.evs !== rightPokemon.spread.evs) {
    return rightPokemon.spread.evs - leftPokemon.spread.evs;
  }

  return leftPokemon.effects
    .map(formatEffect)
    .join("|")
    .localeCompare(rightPokemon.effects.map(formatEffect).join("|"));
}

export function formatSpread(spread: SpeedSpread) {
  return `${formatNature(spread.nature)} ${spread.evs} EVs`;
}

export function formatEffect(effect: SpeedEffect) {
  const multiplier = effect.multiplier === undefined ? "" : `${effect.multiplier}x `;
  const condition = effect.condition === undefined ? "" : ` (${effect.condition})`;

  return `${multiplier}${effect.label}${condition}`;
}

export function formatNature(nature: Nature) {
  if (nature === "positive") {
    return "+Spe";
  }

  if (nature === "negative") {
    return "-Spe";
  }

  return "neutral";
}

function getNatureSortRank(nature: Nature) {
  if (nature === "positive") {
    return 0;
  }

  if (nature === "neutral") {
    return 1;
  }

  return 2;
}
