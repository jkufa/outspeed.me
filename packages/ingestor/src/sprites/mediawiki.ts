import type { SpriteSourceFile } from "./types";

const BULBAGARDEN_API_URL = "https://archives.bulbagarden.net/w/api.php";
const CATEGORY_TITLE = "Category:Champions_menu_sprites";

type MediaWikiPage = {
  title?: string;
  imageinfo?: {
    url?: string;
    size?: number;
  }[];
};

type MediaWikiResponse = {
  batchcomplete?: string;
  continue?: Record<string, string>;
  query?: {
    pages?: Record<string, MediaWikiPage>;
  };
};

export async function fetchChampionsMenuSpriteSourceFiles(
  fetchResource: typeof fetch = fetch,
): Promise<SpriteSourceFile[]> {
  const sourceFiles: SpriteSourceFile[] = [];
  let continuation: Record<string, string> | undefined;

  do {
    const url = new URL(BULBAGARDEN_API_URL);
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("generator", "categorymembers");
    url.searchParams.set("gcmtitle", CATEGORY_TITLE);
    url.searchParams.set("gcmtype", "file");
    url.searchParams.set("gcmlimit", "max");
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url|size");

    for (const [key, value] of Object.entries(continuation ?? {})) {
      url.searchParams.set(key, value);
    }

    const response = await fetchResource(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch sprite source files: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as MediaWikiResponse;
    const pages = Object.values(payload.query?.pages ?? {});

    sourceFiles.push(...pages.map(toSourceFile).filter((sourceFile) => sourceFile !== null));
    continuation = payload.continue;
  } while (continuation !== undefined);

  return sourceFiles.sort((left, right) => left.sourceFilename.localeCompare(right.sourceFilename));
}

function toSourceFile(page: MediaWikiPage): SpriteSourceFile | null {
  const title = page.title;
  const imageInfo = page.imageinfo?.[0];
  const sourceUrl = imageInfo?.url;

  if (title === undefined || sourceUrl === undefined) {
    return null;
  }

  return {
    title,
    sourceFilename: getFilenameFromUrl(sourceUrl),
    sourceUrl,
    size: imageInfo?.size,
  };
}

function getFilenameFromUrl(sourceUrl: string) {
  const pathname = new URL(sourceUrl).pathname;
  const filename = pathname.split("/").at(-1);

  if (filename === undefined || filename === "") {
    throw new Error(`Could not determine filename from sprite URL: ${sourceUrl}`);
  }

  return decodeURIComponent(filename);
}
