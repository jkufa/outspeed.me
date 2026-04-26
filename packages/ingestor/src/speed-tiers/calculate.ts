import {
  applyAbilityModifier as applyRuntimeAbilityModifier,
  calculateModifiedSpeed,
  calculateRawSpeedFromEvs,
  getNatureModifier as getRuntimeNatureModifier,
  statPointsToEvs,
} from "../../../speed-runtime/src";
import {
  COMBINATION_RULES,
  HELD_ITEMS,
  IV,
  LEVEL,
  NATURES,
  SPEED_EVS,
  isSpeedAbility,
} from "./rules";
import type {
  CombinationContext,
  HeldItem,
  Nature,
  PokedexPokemon,
  SpeedCalculation,
  SpeedEv,
  SpeedSpread,
  SpeedTierCombination,
} from "./types";

export function buildSpeedTierCombinations(pokedex: PokedexPokemon[]): SpeedTierCombination[] {
  return pokedex.flatMap((pokemon) =>
    SPEED_EVS.flatMap((evs) =>
      NATURES.flatMap((nature) => {
        const rawSpeed = calculateUnmodifiedSpeed(getBaseSpeed(pokemon), evs, nature);
        const abilities = [null, ...getSpeedAbilityNames(pokemon)];

        return HELD_ITEMS.flatMap((item) =>
          abilities.flatMap((ability) => {
            const context = { pokemon, evs, nature, ability, item };

            if (!shouldIncludeCombination(context)) {
              return [];
            }

            const calculation = calculateSpeed(rawSpeed, ability, item);
            const spread = buildSpeedSpread(nature, evs, rawSpeed);

            return {
              combinationId: buildSpeedTierCombinationId(context),
              id: pokemon.id,
              slug: pokemon.slug,
              pokedexNo: pokemon.pokedexNumber,
              name: pokemon.name,
              sprite: null,
              spread,
              effects: calculation.effects,
              finalSpeed: calculation.finalSpeed,
              speed: calculation.finalSpeed,
            };
          }),
        );
      }),
    ),
  );
}

export function buildSpeedTierCombinationId({
  ability,
  evs,
  item,
  nature,
  pokemon,
}: CombinationContext) {
  return [
    `pokemon:${pokemon.id}`,
    `nature:${nature}`,
    `evs:${evs}`,
    `ability:${ability ?? "none"}`,
    `item:${item ?? "none"}`,
  ].join("|");
}

export function shouldIncludeCombination(context: CombinationContext) {
  return COMBINATION_RULES.every((rule) => rule.shouldInclude(context));
}

export function getBaseSpeed(pokemon: PokedexPokemon) {
  const speed = pokemon.stats.speed;

  if (speed === undefined) {
    throw new Error(`Missing speed stat for ${pokemon.slug}`);
  }

  return speed;
}

export function calculateSpeedTier(
  unmodifiedSpeed: number,
  ability: string | null,
  item: HeldItem | null,
) {
  return calculateSpeed(unmodifiedSpeed, ability, item).finalSpeed;
}

export function calculateSpeed(
  rawSpeed: number,
  ability: string | null,
  item: HeldItem | null,
): SpeedCalculation {
  return calculateModifiedSpeed(rawSpeed, ability, item);
}

export function buildSpeedSpread(nature: Nature, evs: SpeedEv, rawSpeed: number): SpeedSpread {
  return {
    nature,
    evs,
    ivs: IV,
    level: LEVEL,
    rawSpeed,
  };
}

export function calculateUnmodifiedSpeed(baseSpeed: number, evs: SpeedEv, nature: Nature) {
  return calculateRawSpeedFromEvs({ baseSpeed, evs, nature });
}

export function getSpeedAbilityNames(pokemon: PokedexPokemon) {
  return pokemon.abilities.map((ability) => ability.name).filter(isSpeedAbility);
}

export function applyAbilityModifier(speed: number, ability: string | null) {
  return applyRuntimeAbilityModifier(speed, ability);
}

export function getNatureModifier(nature: Nature) {
  return getRuntimeNatureModifier(nature);
}

export { statPointsToEvs };
