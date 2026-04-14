export type SpritePokemonIdentity = {
  pokedexNumber: number;
  slug: string;
  name: string;
};

export type SpriteSourceFile = {
  title: string;
  sourceFilename: string;
  sourceUrl: string;
  size?: number;
};

export type SpriteSourceManifestEntry = {
  slug: string;
  filename: string;
  sourceFilename: string;
  title: string;
  sourceUrl: string;
  size?: number;
  sha256?: string;
};

export type SpriteBlobManifestEntry = SpriteSourceManifestEntry & {
  blobUrl: string;
  blobPath: string;
};

export type SpriteMappingError = {
  pokedexNo: number;
  slug: string;
  name: string;
  expectedFilename: string;
  reason: "missing_manifest_entry" | "missing_blob_url" | "missing_source_mapping";
};

export type PokemonSprite = {
  filename: string;
  path: string;
  sourceUrl: string;
};
