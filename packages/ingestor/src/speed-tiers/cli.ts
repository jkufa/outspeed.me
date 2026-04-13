import { dirname } from "node:path";
import { resolveSpeedTierPaths } from "../config";
import { buildSpeedTierOutputs } from "./build";
import type { PokedexPokemon } from "./types";

async function main() {
  const { inputPath, outputJsonPath, outputCsvPath, outputCombinationsPath } =
    resolveSpeedTierPaths(Bun.argv.slice(2));
  const pokedex = (await Bun.file(inputPath).json()) as PokedexPokemon[];
  const { combinations, tiers, csv } = buildSpeedTierOutputs(pokedex);

  await Promise.all(
    [...new Set([outputCombinationsPath, outputJsonPath, outputCsvPath].map(dirname))].map(
      (dir) => Bun.$`mkdir -p ${dir}`,
    ),
  );
  await Promise.all([
    Bun.write(outputCombinationsPath, `${JSON.stringify(combinations, null, 2)}\n`),
    Bun.write(outputJsonPath, `${JSON.stringify(tiers, null, 2)}\n`),
    Bun.write(outputCsvPath, csv),
  ]);

  console.error(
    `Wrote ${combinations.length} combinations across ${tiers.length} tiers to ${outputJsonPath}`,
  );
}

await main();
