import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(sourceDir, "..");
const repoRoot = resolve(packageRoot, "../..");

export const ingestorConfig = {
  pokeApiBaseUrl: "https://pokeapi.co/api/v2",
  paths: {
    championsPokedexCsv: resolve(repoRoot, "data/champions_pokedex.csv"),
    championsPokedexJson: resolve(repoRoot, "data/champions_pokedex.json"),
    speedTiersJson: resolve(repoRoot, "data/speed_tiers.json"),
    webappPublicSpeedTiersJson: resolve(repoRoot, "apps/webapp/static/assets/speed_tiers.json"),
    speedTiersCsv: resolve(repoRoot, "data/speed_tiers.csv"),
    speedTierCombinationsJson: resolve(repoRoot, "data/speed_tier_combinations.json"),
    spriteManifestJson: resolve(repoRoot, "data/sprites/manifest.json"),
    spriteBlobManifestJson: resolve(repoRoot, "data/sprites/blob-manifest.json"),
    spriteMappingErrorsJson: resolve(repoRoot, "data/sprite_mapping_errors.json"),
    spritesDir: resolve(repoRoot, "data/sprites"),
  },
} as const;

export function resolveIngestPaths(args: string[]) {
  const [inputArg, outputArg] = args;

  return {
    inputPath: resolve(inputArg ?? ingestorConfig.paths.championsPokedexCsv),
    outputPath: resolve(outputArg ?? ingestorConfig.paths.championsPokedexJson),
  };
}

export function resolveSpeedTierPaths(args: string[]) {
  const [inputArg, outputJsonArg, outputCsvArg, outputCombinationsArg, webappPublicOutputJsonArg] =
    args;

  return {
    inputPath: resolve(inputArg ?? ingestorConfig.paths.championsPokedexJson),
    outputJsonPath: resolve(outputJsonArg ?? ingestorConfig.paths.speedTiersJson),
    webappPublicOutputJsonPath: resolve(
      webappPublicOutputJsonArg ?? ingestorConfig.paths.webappPublicSpeedTiersJson,
    ),
    outputCsvPath: resolve(outputCsvArg ?? ingestorConfig.paths.speedTiersCsv),
    outputCombinationsPath: resolve(
      outputCombinationsArg ?? ingestorConfig.paths.speedTierCombinationsJson,
    ),
    spriteManifestPath: ingestorConfig.paths.spriteManifestJson,
    spriteBlobManifestPath: ingestorConfig.paths.spriteBlobManifestJson,
    spriteMappingErrorsPath: ingestorConfig.paths.spriteMappingErrorsJson,
  };
}

export function resolveSpriteExtractPaths(args: string[]) {
  const [pokedexArg, spritesDirArg, manifestArg, mappingErrorsArg] = args;

  return {
    pokedexPath: resolve(pokedexArg ?? ingestorConfig.paths.championsPokedexJson),
    spritesDir: resolve(spritesDirArg ?? ingestorConfig.paths.spritesDir),
    manifestPath: resolve(manifestArg ?? ingestorConfig.paths.spriteManifestJson),
    mappingErrorsPath: resolve(mappingErrorsArg ?? ingestorConfig.paths.spriteMappingErrorsJson),
  };
}

export function resolveSpriteUploadPaths(args: string[]) {
  const [manifestArg, spritesDirArg, blobManifestArg, versionArg] = args;

  return {
    manifestPath: resolve(manifestArg ?? ingestorConfig.paths.spriteManifestJson),
    spritesDir: resolve(spritesDirArg ?? ingestorConfig.paths.spritesDir),
    blobManifestPath: resolve(blobManifestArg ?? ingestorConfig.paths.spriteBlobManifestJson),
    version: versionArg ?? "v1",
  };
}
