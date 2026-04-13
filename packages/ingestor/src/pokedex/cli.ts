import { dirname } from "node:path";
import { resolveIngestPaths } from "../config";
import { ingestPokedex } from "./ingest";

async function main() {
  const { inputPath, outputPath } = resolveIngestPaths(Bun.argv.slice(2));
  const csvText = await Bun.file(inputPath).text();
  const normalizedPokemon = await ingestPokedex(csvText);

  await Bun.$`mkdir -p ${dirname(outputPath)}`;
  await Bun.write(outputPath, `${JSON.stringify(normalizedPokemon, null, 2)}\n`);
  console.error(`Wrote ${normalizedPokemon.length} Pokemon to ${outputPath}`);
}

await main();
