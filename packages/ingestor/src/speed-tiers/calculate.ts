import {
  COMBINATION_RULES,
  DOUBLE_SPEED_ABILITIES,
  HELD_ITEMS,
  IV,
  LEVEL,
  NATURES,
  SPEED_EVS,
  STAGE_SPEED_ABILITIES,
} from "./rules";
import type {
  CombinationContext,
  HeldItem,
  Nature,
  PokedexPokemon,
  SpeedEv,
  SpeedTierCombination,
} from "./types";

export function buildSpeedTierCombinations(pokedex: PokedexPokemon[]): SpeedTierCombination[] {
  return pokedex.flatMap((pokemon) =>
    SPEED_EVS.flatMap((evs) =>
      NATURES.flatMap((nature) => {
        const unmodifiedSpeed = calculateUnmodifiedSpeed(getBaseSpeed(pokemon), evs, nature);
        const abilities = [null, ...getSpeedAbilityNames(pokemon)];

        return HELD_ITEMS.flatMap((item) =>
          abilities.flatMap((ability) => {
            const context = { evs, nature, ability, item };

            if (!shouldIncludeCombination(context)) {
              return [];
            }

            return {
              id: pokemon.id,
              pokedex_no: pokemon.pokedexNumber,
              name: pokemon.name,
              EVs: evs,
              ability,
              nature,
              item,
              tier: calculateSpeedTier(unmodifiedSpeed, ability, item),
            };
          }),
        );
      }),
    ),
  );
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
  let speed = applyAbilityModifier(unmodifiedSpeed, ability);

  if (item === "choice-scarf") {
    speed = Math.floor(speed * 1.5);
  }

  return speed;
}

export function calculateUnmodifiedSpeed(baseSpeed: number, evs: SpeedEv, nature: Nature) {
  const statBeforeNature =
    Math.floor(((2 * baseSpeed + IV + Math.floor(evs / 4)) * LEVEL) / 100) + 5;

  return Math.floor(statBeforeNature * getNatureModifier(nature));
}

export function getSpeedAbilityNames(pokemon: PokedexPokemon) {
  return pokemon.abilities
    .map((ability) => ability.name)
    .filter(
      (abilityName) =>
        DOUBLE_SPEED_ABILITIES.has(abilityName) || STAGE_SPEED_ABILITIES.has(abilityName),
    );
}

export function applyAbilityModifier(speed: number, ability: string | null) {
  if (!ability) {
    return speed;
  }

  if (DOUBLE_SPEED_ABILITIES.has(ability)) {
    return speed * 2;
  }

  if (STAGE_SPEED_ABILITIES.has(ability)) {
    return Math.floor(speed * 1.5);
  }

  throw new Error(`Unsupported speed ability: ${ability}`);
}

export function getNatureModifier(nature: Nature) {
  if (nature === "positive") {
    return 1.1;
  }

  if (nature === "negative") {
    return 0.9;
  }

  return 1;
}
