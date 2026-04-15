import type {
  SpriteMappingError,
  SpritePokemonIdentity,
  SpriteSourceFile,
  SpriteSourceManifestEntry,
} from "./types";

const SOURCE_FILENAME_EXCEPTIONS = new Map<string, string>([
  ["Menu_CP_0128-Paldea_Combat.png", "tauros-paldea-combat-breed"],
  ["Menu_CP_0128-Paldea_Blaze.png", "tauros-paldea-blaze-breed"],
  ["Menu_CP_0128-Paldea_Aqua.png", "tauros-paldea-aqua-breed"],
  ["Menu_CP_0678.png", "meowstic-male"],
  // Bulbagarden renamed Gourgeist Average/Super to Medium/Jumbo in Legends: Z-A.
  ["Menu_CP_0711.png", "gourgeist-average"],
  ["Menu_CP_0711-Jumbo.png", "gourgeist-super"],
  ["Menu_CP_0745.png", "lycanroc-midday"],
  ["Menu_CP_0925.png", "maushold-family-of-four"],
  ["Menu_CP_0925-Three.png", "maushold-family-of-three"],
]);

const COSMETIC_SOURCE_FILENAME_PATTERNS = [/^Menu_CP_0666-.+\.png$/, /^Menu_CP_0869-.+\.png$/];

export function sourceFilenameToSlug(
  sourceFilename: string,
  pokemon: SpritePokemonIdentity[],
): string | null {
  const exceptionSlug = SOURCE_FILENAME_EXCEPTIONS.get(sourceFilename);

  if (exceptionSlug !== undefined) {
    return hasPokemonSlug(pokemon, exceptionSlug) ? exceptionSlug : null;
  }

  if (shouldSkipSourceFilename(sourceFilename)) {
    return null;
  }

  const parsed = parseSourceFilename(sourceFilename);

  if (parsed === null) {
    return null;
  }

  const candidates = pokemon.filter((candidate) => candidate.pokedexNumber === parsed.pokedexNo);

  if (candidates.length === 0) {
    return null;
  }

  if (parsed.formToken === null) {
    return findBaseCandidate(candidates)?.slug ?? null;
  }

  const formToken = parsed.formToken;
  const matchingCandidates = candidates.filter((candidate) =>
    pokemonMatchesSourceForm(candidate, formToken),
  );

  if (matchingCandidates.length !== 1) {
    return null;
  }

  const matchingCandidate = matchingCandidates[0];

  if (matchingCandidate === undefined) {
    return null;
  }

  return matchingCandidate.slug;
}

export function mapSourceFilesToManifestEntries(
  sourceFiles: SpriteSourceFile[],
  pokemon: SpritePokemonIdentity[],
): {
  entries: Omit<SpriteSourceManifestEntry, "sha256">[];
  errors: SpriteMappingError[];
} {
  const entries = sourceFiles
    .map((sourceFile) => {
      const slug = sourceFilenameToSlug(sourceFile.sourceFilename, pokemon);

      if (slug === null) {
        return null;
      }

      return {
        slug,
        filename: `${slug}.png`,
        sourceFilename: sourceFile.sourceFilename,
        title: sourceFile.title,
        sourceUrl: sourceFile.sourceUrl,
        size: sourceFile.size,
      };
    })
    .filter((entry) => entry !== null)
    .sort((left, right) => left.slug.localeCompare(right.slug));

  assertUniqueSlugs(entries);

  const mappedSlugs = new Set(entries.map((entry) => entry.slug));
  const errors = pokemon
    .filter((candidate) => !mappedSlugs.has(candidate.slug))
    .map((candidate) => ({
      pokedexNo: candidate.pokedexNumber,
      slug: candidate.slug,
      name: candidate.name,
      expectedFilename: `${candidate.slug}.png`,
      reason: "missing_source_mapping" as const,
    }))
    .sort(compareSpriteMappingErrors);

  return { entries, errors };
}

export function compareSpriteMappingErrors(left: SpriteMappingError, right: SpriteMappingError) {
  if (left.pokedexNo !== right.pokedexNo) {
    return left.pokedexNo - right.pokedexNo;
  }

  return left.slug.localeCompare(right.slug);
}

function parseSourceFilename(sourceFilename: string) {
  const match = /^Menu_CP_(\d{4})(?:-(.+))?\.png$/.exec(sourceFilename);

  if (match === null) {
    return null;
  }

  return {
    pokedexNo: Number(match[1]),
    formToken: match[2] === undefined ? null : normalizeToken(match[2]),
  };
}

function findBaseCandidate(candidates: SpritePokemonIdentity[]) {
  const shortestSlugLength = Math.min(...candidates.map((candidate) => candidate.slug.length));
  const baseCandidates = candidates.filter(
    (candidate) => candidate.slug.length === shortestSlugLength,
  );

  if (baseCandidates.length === 1) {
    return baseCandidates[0];
  }

  return null;
}

function pokemonMatchesSourceForm(candidate: SpritePokemonIdentity, formToken: string) {
  const slugSegments = candidate.slug.split("-");
  const sourceSegments = formToken.split("-");

  if (candidate.slug.endsWith(`-${formToken}`) || candidate.slug.includes(`-${formToken}-`)) {
    return true;
  }

  return sourceSegments.every((segment) => slugSegments.includes(segment));
}

function shouldSkipSourceFilename(sourceFilename: string) {
  return COSMETIC_SOURCE_FILENAME_PATTERNS.some((pattern) => pattern.test(sourceFilename));
}

function normalizeToken(token: string) {
  return token
    .normalize("NFKD")
    .replace(/['.]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function hasPokemonSlug(pokemon: SpritePokemonIdentity[], slug: string) {
  return pokemon.some((candidate) => candidate.slug === slug);
}

function assertUniqueSlugs(entries: Omit<SpriteSourceManifestEntry, "sha256">[]) {
  const entriesBySlug = new Map<string, Omit<SpriteSourceManifestEntry, "sha256">>();

  for (const entry of entries) {
    const existingEntry = entriesBySlug.get(entry.slug);

    if (existingEntry !== undefined) {
      throw new Error(
        `Duplicate sprite slug mapping for ${entry.slug}: ${existingEntry.sourceFilename}, ${entry.sourceFilename}`,
      );
    }

    entriesBySlug.set(entry.slug, entry);
  }
}
