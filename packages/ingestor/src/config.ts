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
    speedTiersCsv: resolve(repoRoot, "data/speed_tiers.csv"),
    speedTierCombinationsJson: resolve(repoRoot, "data/speed_tier_combinations.json"),
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
  const [inputArg, outputJsonArg, outputCsvArg, outputCombinationsArg] = args;

  return {
    inputPath: resolve(inputArg ?? ingestorConfig.paths.championsPokedexJson),
    outputJsonPath: resolve(outputJsonArg ?? ingestorConfig.paths.speedTiersJson),
    outputCsvPath: resolve(outputCsvArg ?? ingestorConfig.paths.speedTiersCsv),
    outputCombinationsPath: resolve(
      outputCombinationsArg ?? ingestorConfig.paths.speedTierCombinationsJson,
    ),
  };
}
