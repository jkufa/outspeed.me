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
import { buildSpeedEffects } from "./effects";
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
            const context = { evs, nature, ability, item };

            if (!shouldIncludeCombination(context)) {
              return [];
            }

            const calculation = calculateSpeed(rawSpeed, ability, item);
            const spread = buildSpeedSpread(nature, evs, rawSpeed);

            return {
              id: pokemon.id,
              pokedexNo: pokemon.pokedexNumber,
              name: pokemon.name,
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
  const effects = buildSpeedEffects(ability, item);
  const steps: SpeedCalculation["steps"] = [{ label: "base", speed: rawSpeed }];
  let speed = rawSpeed;

  for (const effect of effects) {
    if (effect.multiplier === undefined) {
      continue;
    }

    speed = Math.floor(speed * effect.multiplier);
    steps.push({
      label: effect.label,
      multiplier: effect.multiplier,
      speed,
    });
  }

  return {
    rawSpeed,
    finalSpeed: speed,
    effects,
    steps,
  };
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
