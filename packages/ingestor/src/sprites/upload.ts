import { put } from "@vercel/blob";
import { dirname, join } from "node:path";
import { sha256Hex } from "./hash";
import type { SpriteBlobManifestEntry, SpriteSourceManifestEntry } from "./types";

export type UploadSpritesOptions = {
  manifestPath: string;
  spritesDir: string;
  blobManifestPath: string;
  version: string;
};

export async function uploadSprites({
  manifestPath,
  spritesDir,
  blobManifestPath,
  version,
}: UploadSpritesOptions) {
  const sourceManifest = (await Bun.file(manifestPath).json()) as SpriteSourceManifestEntry[];
  const existingManifest = await readExistingBlobManifest(blobManifestPath);
  const existingBySlug = new Map(existingManifest.map((entry) => [entry.slug, entry]));
  const uploadedEntries: SpriteBlobManifestEntry[] = [];

  for (const sourceEntry of sourceManifest) {
    const localFile = Bun.file(join(spritesDir, sourceEntry.filename));
    const bytes = await localFile.arrayBuffer();
    const sha256 = await sha256Hex(bytes);
    const entry = { ...sourceEntry, sha256 };
    const existingEntry = existingBySlug.get(entry.slug);

    if (existingEntry?.sha256 === sha256 && existingEntry.blobUrl !== "") {
      uploadedEntries.push(existingEntry);
      continue;
    }

    const blobPath = `champions-menu-sprites/${version}/${entry.filename}`;
    const blob = await put(blobPath, bytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    uploadedEntries.push({
      ...entry,
      blobUrl: blob.url,
      blobPath,
    });
  }

  uploadedEntries.sort((left, right) => left.slug.localeCompare(right.slug));
  await Bun.$`mkdir -p ${dirname(blobManifestPath)}`;
  await Bun.write(blobManifestPath, `${JSON.stringify(uploadedEntries, null, 2)}\n`);

  return uploadedEntries;
}

async function readExistingBlobManifest(path: string) {
  const manifestFile = Bun.file(path);

  if (!(await manifestFile.exists())) {
    return [];
  }

  return (await manifestFile.json()) as SpriteBlobManifestEntry[];
}
