import { resolveSpriteExtractPaths } from "../config";
import type { NormalizedPokemon } from "../pokedex/types";
import { extractSprites } from "./extract";

async function main() {
  const { pokedexPath, spritesDir, manifestPath, mappingErrorsPath } = resolveSpriteExtractPaths(
    Bun.argv.slice(2),
  );
  const pokemon = (await Bun.file(pokedexPath).json()) as NormalizedPokemon[];
  const { entries, errors } = await extractSprites({
    pokemon,
    spritesDir,
    manifestPath,
    mappingErrorsPath,
  });

  console.error(`Wrote ${entries.length} sprites to ${spritesDir}`);

  if (errors.length > 0) {
    console.error(`Wrote ${errors.length} missing sprite mappings to ${mappingErrorsPath}`);
  }
}

await main();
