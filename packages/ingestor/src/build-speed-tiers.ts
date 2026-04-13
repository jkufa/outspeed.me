import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type HeldItem = "choice-scarf";
type Nature = "neutral" | "positive" | "negative";
type SpeedEv = 0 | 252;

type PokedexPokemon = {
  id: number;
  slug: string;
  pokedexNumber: number;
  name: string;
  abilities: {
    name: string;
  }[];
  stats: Record<string, number>;
};

type SpeedTierPokemon = {
  id: number;
  pokedex_no: number;
  name: string;
  EVs: SpeedEv;
  ability: string | null;
  nature: Nature;
  item: HeldItem | null;
};

type SpeedTier = {
  tier: number;
  pokemon: SpeedTierPokemon[];
};

type SpeedTierCombination = SpeedTierPokemon & {
  tier: number;
};

type CombinationContext = {
  evs: SpeedEv;
  nature: Nature;
  ability: string | null;
  item: HeldItem | null;
};

type CombinationRule = {
  name: string;
  shouldInclude: (context: CombinationContext) => boolean;
};

const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SOURCE_DIR, "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const DEFAULT_INPUT = resolve(REPO_ROOT, "data/champions_pokedex.json");
const DEFAULT_OUTPUT_JSON = resolve(REPO_ROOT, "data/speed_tiers.json");
const DEFAULT_OUTPUT_CSV = resolve(REPO_ROOT, "data/speed_tiers.csv");
const DEFAULT_OUTPUT_COMBINATIONS = resolve(REPO_ROOT, "data/speed_tier_combinations.json");
const LEVEL = 50;
const IV = 31;
const SPEED_EVS: SpeedEv[] = [0, 252];
const NATURES: Nature[] = ["neutral", "positive", "negative"];
const HELD_ITEMS: (HeldItem | null)[] = [null, "choice-scarf"];
const DOUBLE_SPEED_ABILITIES = new Set(["chlorophyll", "sand-rush", "slush-rush", "swift-swim"]);
const STAGE_SPEED_ABILITIES = new Set(["speed-boost"]);
const COMBINATION_RULES: CombinationRule[] = [
  {
    name: "skip speed boosts with negative nature",
    shouldInclude: ({ ability, item, nature }) =>
      nature !== "negative" || (ability === null && item === null),
  },
  {
    name: "skip choice scarf with neutral nature and no speed EVs",
    shouldInclude: ({ evs, item, nature }) => nature !== "neutral" || evs !== 0 || item === null,
  },
];

async function main() {
  const { inputPath, outputJsonPath, outputCsvPath, outputCombinationsPath } = parseArgs(
    Bun.argv.slice(2),
  );
  const pokedex = (await Bun.file(inputPath).json()) as PokedexPokemon[];
  const combinations = buildSpeedTierCombinations(pokedex);
  const tiers = groupBySpeedTier(combinations);

  await Bun.$`mkdir -p ${dirname(outputJsonPath)}`;
  await Promise.all([
    Bun.write(outputCombinationsPath, `${JSON.stringify(combinations, null, 2)}\n`),
    Bun.write(outputJsonPath, `${JSON.stringify(tiers, null, 2)}\n`),
    Bun.write(outputCsvPath, toCsv(tiers)),
  ]);

  console.error(
    `Wrote ${combinations.length} combinations across ${tiers.length} tiers to ${outputJsonPath}`,
  );
}

function parseArgs(args: string[]) {
  const [inputArg, outputJsonArg, outputCsvArg, outputCombinationsArg] = args;

  return {
    inputPath: resolve(inputArg ?? DEFAULT_INPUT),
    outputJsonPath: resolve(outputJsonArg ?? DEFAULT_OUTPUT_JSON),
    outputCsvPath: resolve(outputCsvArg ?? DEFAULT_OUTPUT_CSV),
    outputCombinationsPath: resolve(outputCombinationsArg ?? DEFAULT_OUTPUT_COMBINATIONS),
  };
}

function buildSpeedTierCombinations(pokedex: PokedexPokemon[]): SpeedTierCombination[] {
  return pokedex.flatMap((pokemon) =>
    SPEED_EVS.flatMap((evs) =>
      NATURES.flatMap((nature) => {
        const unmodifiedSpeed = calculateUnmodifiedSpeed(getBaseSpeed(pokemon), evs, nature);
        const abilities = [null, ...getSpeedAbilityNames(pokemon)];

        return HELD_ITEMS.flatMap((item) =>
          abilities.flatMap((ability) => {
            const context = { evs, nature, ability, item };

            if (!shouldIncludeCombination(context)) {
              return [];
            }

            return {
              id: pokemon.id,
              pokedex_no: pokemon.pokedexNumber,
              name: pokemon.name,
              EVs: evs,
              ability,
              nature,
              item,
              tier: calculateSpeedTier(unmodifiedSpeed, ability, item),
            };
          }),
        );
      }),
    ),
  );
}

function shouldIncludeCombination(context: CombinationContext) {
  return COMBINATION_RULES.every((rule) => rule.shouldInclude(context));
}

function getBaseSpeed(pokemon: PokedexPokemon) {
  const speed = pokemon.stats.speed;

  if (speed === undefined) {
    throw new Error(`Missing speed stat for ${pokemon.slug}`);
  }

  return speed;
}

function calculateSpeedTier(
  unmodifiedSpeed: number,
  ability: string | null,
  item: HeldItem | null,
) {
  let speed = applyAbilityModifier(unmodifiedSpeed, ability);

  if (item === "choice-scarf") {
    speed = Math.floor(speed * 1.5);
  }

  return speed;
}

function calculateUnmodifiedSpeed(baseSpeed: number, evs: SpeedEv, nature: Nature) {
  const statBeforeNature =
    Math.floor(((2 * baseSpeed + IV + Math.floor(evs / 4)) * LEVEL) / 100) + 5;

  return Math.floor(statBeforeNature * getNatureModifier(nature));
}

function getSpeedAbilityNames(pokemon: PokedexPokemon) {
  return pokemon.abilities
    .map((ability) => ability.name)
    .filter(
      (abilityName) =>
        DOUBLE_SPEED_ABILITIES.has(abilityName) || STAGE_SPEED_ABILITIES.has(abilityName),
    );
}

function applyAbilityModifier(speed: number, ability: string | null) {
  if (!ability) {
    return speed;
  }

  if (DOUBLE_SPEED_ABILITIES.has(ability)) {
    return speed * 2;
  }

  if (STAGE_SPEED_ABILITIES.has(ability)) {
    return Math.floor(speed * 1.5);
  }

  throw new Error(`Unsupported speed ability: ${ability}`);
}

function getNatureModifier(nature: Nature) {
  if (nature === "positive") {
    return 1.1;
  }

  if (nature === "negative") {
    return 0.9;
  }

  return 1;
}

function groupBySpeedTier(combinations: SpeedTierCombination[]): SpeedTier[] {
  const tiers = new Map<number, SpeedTierPokemon[]>();

  for (const combination of combinations) {
    const { tier, ...pokemon } = combination;
    const tierPokemon = tiers.get(tier) ?? [];
    tierPokemon.push(pokemon);
    tiers.set(tier, tierPokemon);
  }

  return [...tiers.entries()]
    .sort(([leftTier], [rightTier]) => rightTier - leftTier)
    .map(([tier, pokemon]) => ({
      tier,
      pokemon: pokemon.sort((leftPokemon, rightPokemon) => {
        if (leftPokemon.pokedex_no !== rightPokemon.pokedex_no) {
          return leftPokemon.pokedex_no - rightPokemon.pokedex_no;
        }

        if (leftPokemon.id !== rightPokemon.id) {
          return leftPokemon.id - rightPokemon.id;
        }

        return leftPokemon.name.localeCompare(rightPokemon.name);
      }),
    }));
}

function toCsv(tiers: SpeedTier[]) {
  const rows = [["tier", "id", "pokedex_no", "name", "EVs", "ability", "nature", "item"]];

  for (const tier of tiers) {
    for (const pokemon of tier.pokemon) {
      rows.push([
        String(tier.tier),
        String(pokemon.id),
        String(pokemon.pokedex_no),
        pokemon.name,
        String(pokemon.EVs),
        pokemon.ability ?? "",
        pokemon.nature,
        pokemon.item ?? "",
      ]);
    }
  }

  return `${rows.map((row) => row.map(toCsvCell).join(",")).join("\n")}\n`;
}

function toCsvCell(value: string) {
  if (!/[",\n]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

await main();
