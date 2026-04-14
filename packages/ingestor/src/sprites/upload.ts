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
    const blob = await putSprite(blobPath, bytes);

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

async function putSprite(blobPath: string, bytes: ArrayBuffer) {
  try {
    return await put(blobPath, bytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
  } catch (error) {
    throw new Error(
      `Failed to upload ${blobPath}. If this path already exists and data/sprites/blob-manifest.json was lost, restore the manifest or rerun upload-sprites with a new version argument, e.g. "bun run upload-sprites data/sprites/manifest.json data/sprites data/sprites/blob-manifest.json v2".`,
      { cause: error },
    );
  }
}

async function readExistingBlobManifest(path: string) {
  const manifestFile = Bun.file(path);

  if (!(await manifestFile.exists())) {
    return [];
  }

  return (await manifestFile.json()) as SpriteBlobManifestEntry[];
}
