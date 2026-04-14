import { buildSpeedTierCombinations } from "./calculate";
import { groupBySpeedTier, speedTiersToCsv } from "./output";
import type { SpriteBlobManifestEntry, SpriteMappingError } from "../sprites/types";
import type { PokedexPokemon, PokemonSprite, SpeedTierCombination } from "./types";

export type BuildSpeedTierOutputsOptions = {
  spriteBlobManifest?: SpriteBlobManifestEntry[];
  spriteMappingErrors?: SpriteMappingError[];
};

export function buildSpeedTierOutputs(
  pokedex: PokedexPokemon[],
  options: BuildSpeedTierOutputsOptions = {},
) {
  const spritesBySlug = new Map(
    (options.spriteBlobManifest ?? []).map((entry) => [entry.slug, entry]),
  );
  const combinations = withSprites(buildSpeedTierCombinations(pokedex), spritesBySlug);
  const tiers = groupBySpeedTier(combinations);
  const spriteMappingErrors = buildSpriteMappingErrors(
    pokedex,
    spritesBySlug,
    options.spriteMappingErrors ?? [],
  );

  return {
    combinations,
    tiers,
    csv: speedTiersToCsv(tiers),
    spriteMappingErrors,
  };
}

function withSprites(
  combinations: SpeedTierCombination[],
  spritesBySlug: Map<string, SpriteBlobManifestEntry>,
): SpeedTierCombination[] {
  return combinations.map((combination) => ({
    ...combination,
    sprite: toPokemonSprite(spritesBySlug.get(combination.slug)),
  }));
}

function toPokemonSprite(entry: SpriteBlobManifestEntry | undefined): PokemonSprite | null {
  if (entry?.blobUrl === undefined || entry.blobUrl === "") {
    return null;
  }

  return {
    filename: entry.filename,
    path: entry.blobUrl,
    sourceUrl: entry.sourceUrl,
  };
}

function buildSpriteMappingErrors(
  pokedex: PokedexPokemon[],
  spritesBySlug: Map<string, SpriteBlobManifestEntry>,
  sourceMappingErrors: SpriteMappingError[],
): SpriteMappingError[] {
  const sourceMappingErrorBySlug = new Map(
    sourceMappingErrors
      .filter((error) => error.reason === "missing_source_mapping")
      .map((error) => [error.slug, error]),
  );

  return pokedex
    .map((pokemon) => {
      const sprite = spritesBySlug.get(pokemon.slug);

      if (sprite === undefined) {
        const sourceMappingError = sourceMappingErrorBySlug.get(pokemon.slug);

        if (sourceMappingError !== undefined) {
          return sourceMappingError;
        }

        return {
          pokedexNo: pokemon.pokedexNumber,
          slug: pokemon.slug,
          name: pokemon.name,
          expectedFilename: `${pokemon.slug}.png`,
          reason: "missing_manifest_entry" as const,
        };
      }

      if (sprite.blobUrl === "") {
        return {
          pokedexNo: pokemon.pokedexNumber,
          slug: pokemon.slug,
          name: pokemon.name,
          expectedFilename: sprite.filename,
          reason: "missing_blob_url" as const,
        };
      }

      return null;
    })
    .filter((error) => error !== null)
    .sort((left, right) => {
      if (left.pokedexNo !== right.pokedexNo) {
        return left.pokedexNo - right.pokedexNo;
      }

      return left.slug.localeCompare(right.slug);
    });
}
