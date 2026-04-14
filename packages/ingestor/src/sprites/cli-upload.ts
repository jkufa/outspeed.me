import { resolveSpriteUploadPaths } from "../config";
import { uploadSprites } from "./upload";

async function main() {
  const { manifestPath, spritesDir, blobManifestPath, version } = resolveSpriteUploadPaths(
    Bun.argv.slice(2),
  );
  const entries = await uploadSprites({
    manifestPath,
    spritesDir,
    blobManifestPath,
    version,
  });

  console.error(`Wrote ${entries.length} blob sprite mappings to ${blobManifestPath}`);
}

await main();
