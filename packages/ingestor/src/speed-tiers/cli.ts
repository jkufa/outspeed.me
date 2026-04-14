import { dirname } from "node:path";
import { resolveSpeedTierPaths } from "../config";
import { writeSpriteMappingErrors } from "../sprites/extract";
import type { SpriteBlobManifestEntry, SpriteMappingError } from "../sprites/types";
import { buildSpeedTierOutputs } from "./build";
import type { PokedexPokemon } from "./types";

async function main() {
  const {
    inputPath,
    outputJsonPath,
    outputCsvPath,
    outputCombinationsPath,
    webappPublicOutputJsonPath,
    spriteBlobManifestPath,
    spriteMappingErrorsPath,
  } = resolveSpeedTierPaths(Bun.argv.slice(2));
  const pokedex = (await Bun.file(inputPath).json()) as PokedexPokemon[];
  const spriteBlobManifest = await readSpriteBlobManifest(spriteBlobManifestPath);
  const existingSpriteMappingErrors = await readSpriteMappingErrors(spriteMappingErrorsPath);
  const { combinations, tiers, csv, spriteMappingErrors } = buildSpeedTierOutputs(pokedex, {
    spriteBlobManifest,
    spriteMappingErrors: existingSpriteMappingErrors,
  });

  await Promise.all(
    [
      ...new Set(
        [
          outputCombinationsPath,
          outputJsonPath,
          outputCsvPath,
          webappPublicOutputJsonPath,
          spriteMappingErrorsPath,
        ].map(dirname),
      ),
    ].map((dir) => Bun.$`mkdir -p ${dir}`),
  );
  await Promise.all([
    Bun.write(outputCombinationsPath, `${JSON.stringify(combinations, null, 2)}\n`),
    Bun.write(outputJsonPath, `${JSON.stringify(tiers, null, 2)}\n`),
    Bun.write(webappPublicOutputJsonPath, `${JSON.stringify(tiers, null, 2)}\n`),
    Bun.write(outputCsvPath, csv),
    writeSpriteMappingErrors(spriteMappingErrorsPath, spriteMappingErrors),
  ]);

  console.error(
    `Wrote ${combinations.length} combinations across ${tiers.length} tiers to ${outputJsonPath}`,
  );

  if (spriteMappingErrors.length > 0) {
    console.error(
      `Wrote ${spriteMappingErrors.length} missing sprite mappings to ${spriteMappingErrorsPath}`,
    );
  }
}

await main();

async function readSpriteBlobManifest(path: string): Promise<SpriteBlobManifestEntry[]> {
  const manifest = Bun.file(path);

  if (!(await manifest.exists())) {
    return [];
  }

  return (await manifest.json()) as SpriteBlobManifestEntry[];
}

async function readSpriteMappingErrors(path: string): Promise<SpriteMappingError[]> {
  const errorsFile = Bun.file(path);

  if (!(await errorsFile.exists())) {
    return [];
  }

  return (await errorsFile.json()) as SpriteMappingError[];
}
