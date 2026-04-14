import { dirname, join } from "node:path";
import { compareSpriteMappingErrors, mapSourceFilesToManifestEntries } from "./filename-to-slug";
import { fetchChampionsMenuSpriteSourceFiles } from "./mediawiki";
import { sha256Hex } from "./hash";
import type { SpriteMappingError, SpritePokemonIdentity, SpriteSourceManifestEntry } from "./types";

export type ExtractSpritesOptions = {
  pokemon: SpritePokemonIdentity[];
  spritesDir: string;
  manifestPath: string;
  mappingErrorsPath: string;
  fetchResource?: typeof fetch;
};

export async function extractSprites({
  pokemon,
  spritesDir,
  manifestPath,
  mappingErrorsPath,
  fetchResource = fetch,
}: ExtractSpritesOptions) {
  const sourceFiles = await fetchChampionsMenuSpriteSourceFiles(fetchResource);
  const { entries, errors } = mapSourceFilesToManifestEntries(sourceFiles, pokemon);
  const manifestEntries: SpriteSourceManifestEntry[] = [];

  await Promise.all([Bun.$`mkdir -p ${spritesDir}`, Bun.$`mkdir -p ${dirname(mappingErrorsPath)}`]);

  for (const entry of entries) {
    const response = await fetchResource(entry.sourceUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download ${entry.sourceFilename}: ${response.status} ${response.statusText}`,
      );
    }

    const bytes = await response.arrayBuffer();
    const sha256 = await sha256Hex(bytes);

    await Bun.write(join(spritesDir, entry.filename), bytes);
    manifestEntries.push({ ...entry, sha256 });
  }

  await writeSpriteManifest(manifestPath, manifestEntries);
  await writeSpriteMappingErrors(mappingErrorsPath, errors);

  return { entries: manifestEntries, errors };
}

export async function writeSpriteManifest(path: string, entries: SpriteSourceManifestEntry[]) {
  await Bun.$`mkdir -p ${dirname(path)}`;
  await Bun.write(path, `${JSON.stringify(sortManifestEntries(entries), null, 2)}\n`);
}

export async function writeSpriteMappingErrors(path: string, errors: SpriteMappingError[]) {
  await Bun.$`mkdir -p ${dirname(path)}`;
  await Bun.write(path, `${JSON.stringify(errors.sort(compareSpriteMappingErrors), null, 2)}\n`);
}

function sortManifestEntries(entries: SpriteSourceManifestEntry[]) {
  return [...entries].sort((left, right) => left.slug.localeCompare(right.slug));
}
