import type { Nature } from "../speed-tiers";
import type {
  CustomBuildModifierInput,
  CustomBuildOrigin,
  UnsupportedSpeedModifier,
} from "./types";

export type ShowdownParsedSpecies = {
  raw: string;
  name: string;
  form?: string;
};

export type ShowdownParsedSpeedInvestment = {
  evs?: number;
  statPoints?: number;
  rawText?: string;
};

export type ShowdownParsedBuild = {
  origin: Extract<CustomBuildOrigin, "showdown">;
  rawText: string;
  nickname?: string;
  species: ShowdownParsedSpecies;
  nature: Nature | null;
  speed: ShowdownParsedSpeedInvestment | null;
  ability: CustomBuildModifierInput | null;
  item: CustomBuildModifierInput | null;
  unsupportedSpeedModifiers: UnsupportedSpeedModifier[];
};

export type ShowdownParseIssue = {
  code:
    | "empty-input"
    | "multiple-sets"
    | "missing-species"
    | "unrecognized-nature"
    | "malformed-speed-investment"
    | "unsupported-syntax";
  message: string;
  rawText?: string;
};

export type ShowdownParseResult =
  | {
      ok: true;
      build: ShowdownParsedBuild;
      warnings: ShowdownParseIssue[];
    }
  | {
      ok: false;
      errors: ShowdownParseIssue[];
      partialBuild?: Partial<ShowdownParsedBuild>;
    };

export type ShowdownParserApi = {
  parseShowdownSet: (input: string) => ShowdownParseResult;
};

const SPEED_POSITIVE_NATURES = new Set(["timid", "hasty", "jolly", "naive"]);
const SPEED_NEGATIVE_NATURES = new Set(["brave", "relaxed", "quiet", "sassy"]);
const NEUTRAL_NATURES = new Set([
  "hardy",
  "lonely",
  "adamant",
  "naughty",
  "bold",
  "docile",
  "impish",
  "lax",
  "modest",
  "mild",
  "bashful",
  "rash",
  "calm",
  "gentle",
  "careful",
  "quirky",
  "serious",
]);

const SUPPORTED_SPEED_ITEMS = new Map([["choice-scarf", "Choice Scarf"]]);
const SUPPORTED_SPEED_ABILITIES = new Map([
  ["chlorophyll", "Chlorophyll"],
  ["sand-rush", "Sand Rush"],
  ["slush-rush", "Slush Rush"],
  ["speed-boost", "Speed Boost"],
  ["swift-swim", "Swift Swim"],
]);

const UNSUPPORTED_SPEED_ITEMS = new Map([
  ["booster-energy", "Booster Energy"],
  ["iron-ball", "Iron Ball"],
  ["macho-brace", "Macho Brace"],
  ["power-anklet", "Power Anklet"],
  ["power-band", "Power Band"],
  ["power-belt", "Power Belt"],
  ["power-bracer", "Power Bracer"],
  ["power-lens", "Power Lens"],
  ["power-weight", "Power Weight"],
  ["quick-powder", "Quick Powder"],
  ["room-service", "Room Service"],
]);

const UNSUPPORTED_SPEED_ABILITIES = new Map([
  ["motor-drive", "Motor Drive"],
  ["protosynthesis", "Protosynthesis"],
  ["quark-drive", "Quark Drive"],
  ["quick-feet", "Quick Feet"],
  ["rattled", "Rattled"],
  ["slow-start", "Slow Start"],
  ["steadfast", "Steadfast"],
  ["steam-engine", "Steam Engine"],
  ["surge-surfer", "Surge Surfer"],
  ["unburden", "Unburden"],
  ["weak-armor", "Weak Armor"],
]);

const HYPHENATED_BASE_SPECIES = new Set([
  "chien-pao",
  "chi-yu",
  "hakamo-o",
  "ho-oh",
  "jangmo-o",
  "kommo-o",
  "porygon-z",
  "ting-lu",
  "wo-chien",
]);

export function parseShowdownSet(input: string): ShowdownParseResult {
  const rawText = input;
  const normalizedInput = input.replace(/\r\n?/g, "\n").trim();

  if (!normalizedInput) {
    return {
      ok: false,
      errors: [
        {
          code: "empty-input",
          message: "Showdown set is empty",
        },
      ],
    };
  }

  const setBlocks = normalizedInput
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (setBlocks.length > 1) {
    const firstBlock = parseSingleSetBlock(setBlocks[0] ?? "", rawText);

    return {
      ok: false,
      errors: [
        {
          code: "multiple-sets",
          message: "Paste a single Showdown set",
        },
      ],
      partialBuild: firstBlock.ok ? firstBlock.build : firstBlock.partialBuild,
    };
  }

  return parseSingleSetBlock(normalizedInput, rawText);
}

function parseSingleSetBlock(input: string, rawText: string): ShowdownParseResult {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const warnings: ShowdownParseIssue[] = [];
  const headerLine = findHeaderLine(lines);

  if (!headerLine) {
    return {
      ok: false,
      errors: [
        {
          code: "missing-species",
          message: "Could not find a Pokemon species in the Showdown set",
        },
      ],
    };
  }

  const header = parseHeaderLine(headerLine);

  if (!header.speciesText) {
    return {
      ok: false,
      errors: [
        {
          code: "missing-species",
          message: "Could not find a Pokemon species in the Showdown set",
          rawText: headerLine,
        },
      ],
    };
  }

  const nature = parseNature(lines, warnings);
  const speed = parseSpeedInvestment(lines, warnings);
  const ability = parseAbility(lines);
  const parsedItem = parseModifier("item", header.itemText);
  const parsedAbility = parseModifier("ability", ability);
  const species = parseSpecies(header.speciesText);

  return {
    ok: true,
    build: {
      origin: "showdown",
      rawText,
      nickname: header.nickname,
      species,
      nature,
      speed,
      ability: parsedAbility.modifier,
      item: parsedItem.modifier,
      unsupportedSpeedModifiers: [
        ...parsedItem.unsupportedSpeedModifiers,
        ...parsedAbility.unsupportedSpeedModifiers,
      ],
    },
    warnings,
  };
}

function findHeaderLine(lines: readonly string[]) {
  return lines.find(
    (line) =>
      !line.startsWith("-") &&
      !/^Ability\s*:/i.test(line) &&
      !/^(EVs?|IVs?|SPs?)\s*:/i.test(line) &&
      !/^Tera Type\s*:/i.test(line) &&
      !/^[A-Za-z]+ Nature$/i.test(line),
  );
}

function parseHeaderLine(line: string) {
  const [pokemonText = "", itemText] = line.split("@", 2).map((part) => part.trim());
  const speciesParenthetical = Array.from(pokemonText.matchAll(/\(([^()]*)\)/g))
    .map((match) => ({ raw: match[0], value: match[1]?.trim() ?? "", index: match.index ?? 0 }))
    .filter(({ value }) => !isGender(value))
    .at(-1);

  if (speciesParenthetical) {
    const nickname = cleanNameText(pokemonText.slice(0, speciesParenthetical.index));

    return {
      nickname: nickname || undefined,
      speciesText: speciesParenthetical.value,
      itemText,
    };
  }

  return {
    speciesText: cleanNameText(stripGenderText(pokemonText)),
    itemText,
  };
}

function parseSpecies(rawSpeciesText: string): ShowdownParsedSpecies {
  const raw = cleanNameText(rawSpeciesText);
  const hyphenIndex = raw.indexOf("-");
  const rawSlug = toSourceSlug(raw);

  if (hyphenIndex === -1 || HYPHENATED_BASE_SPECIES.has(rawSlug)) {
    return {
      raw,
      name: raw,
    };
  }

  const name = cleanNameText(raw.slice(0, hyphenIndex));
  const form = cleanNameText(raw.slice(hyphenIndex + 1).replaceAll("-", " "));

  return {
    raw,
    name,
    form: form || undefined,
  };
}

function parseNature(lines: readonly string[], warnings: ShowdownParseIssue[]): Nature | null {
  const natureLine = lines.find((line) => /^[A-Za-z]+ Nature$/i.test(line));

  if (!natureLine) {
    return null;
  }

  const natureName = natureLine.replace(/\s+Nature$/i, "").toLowerCase();

  if (SPEED_POSITIVE_NATURES.has(natureName)) {
    return "positive";
  }

  if (SPEED_NEGATIVE_NATURES.has(natureName)) {
    return "negative";
  }

  if (NEUTRAL_NATURES.has(natureName)) {
    return "neutral";
  }

  warnings.push({
    code: "unrecognized-nature",
    message: `Could not recognize Showdown nature "${natureLine}"`,
    rawText: natureLine,
  });

  return null;
}

function parseSpeedInvestment(
  lines: readonly string[],
  warnings: ShowdownParseIssue[],
): ShowdownParsedSpeedInvestment | null {
  const statPointLine = lines.find((line) => /^SPs?\s*:/i.test(line));

  if (statPointLine) {
    const statPoints = parseSpeedValue(statPointLine);

    if (statPoints === null || statPoints > 32) {
      warnings.push(malformedSpeedInvestmentIssue(statPointLine));
      return null;
    }

    return {
      statPoints,
      rawText: statPointLine,
    };
  }

  const evLine = lines.find((line) => /^EVs?\s*:/i.test(line));

  if (!evLine) {
    return {
      evs: 0,
      statPoints: 0,
    };
  }

  const evs = parseSpeedValue(evLine);

  if (evs === null) {
    if (/\b(?:Spe|Speed)\b/i.test(evLine)) {
      warnings.push(malformedSpeedInvestmentIssue(evLine));
      return null;
    }

    return {
      evs: 0,
      statPoints: 0,
      rawText: evLine,
    };
  }

  if (evs > 252) {
    warnings.push(malformedSpeedInvestmentIssue(evLine));
    return null;
  }

  return {
    evs,
    statPoints: evsToChampionsStatPoints(evs),
    rawText: evLine,
  };
}

function parseAbility(lines: readonly string[]) {
  const abilityLine = lines.find((line) => /^Ability\s*:/i.test(line));

  if (!abilityLine) {
    return undefined;
  }

  return abilityLine.replace(/^Ability\s*:\s*/i, "").trim();
}

function parseModifier(kind: CustomBuildModifierInput["kind"], rawText: string | undefined) {
  const unsupportedSpeedModifiers: UnsupportedSpeedModifier[] = [];

  if (!rawText) {
    return {
      modifier: null,
      unsupportedSpeedModifiers,
    };
  }

  const source = toSourceSlug(rawText);
  const supported = kind === "item" ? SUPPORTED_SPEED_ITEMS : SUPPORTED_SPEED_ABILITIES;
  const unsupported = kind === "item" ? UNSUPPORTED_SPEED_ITEMS : UNSUPPORTED_SPEED_ABILITIES;
  const supportedLabel = supported.get(source);

  if (supportedLabel) {
    return {
      modifier: {
        kind,
        source,
        label: supportedLabel,
      },
      unsupportedSpeedModifiers,
    };
  }

  const unsupportedLabel = unsupported.get(source);

  if (unsupportedLabel) {
    unsupportedSpeedModifiers.push({
      kind,
      source,
      label: unsupportedLabel,
      reason: "unsupported",
      rawText,
    });
  }

  return {
    modifier: null,
    unsupportedSpeedModifiers,
  };
}

function parseSpeedValue(line: string) {
  const speedMatch = line.match(/(?:^|[/:\s])(\d+)\s*(?:Spe|Speed)\b/i);

  if (!speedMatch?.[1]) {
    return null;
  }

  return Number(speedMatch[1]);
}

function malformedSpeedInvestmentIssue(rawText: string): ShowdownParseIssue {
  return {
    code: "malformed-speed-investment",
    message: "Could not parse Speed investment from Showdown set",
    rawText,
  };
}

function evsToChampionsStatPoints(evs: number) {
  if (evs === 0) {
    return 0;
  }

  return Math.floor((evs + 4) / 8);
}

function isGender(text: string) {
  return /^(?:M|F)$/i.test(text.trim());
}

function stripGenderText(text: string) {
  return text.replace(/\s*\((?:M|F)\)\s*$/i, "");
}

function cleanNameText(text: string) {
  return stripGenderText(text).replaceAll("_", " ").replace(/\s+/g, " ").trim();
}

function toSourceSlug(text: string) {
  return cleanNameText(text)
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
