# @outspeedme/ingestor

Data pipeline for Outspeed. This package turns source Pokemon data into normalized files the app can consume.

## Purpose

- Ingest the champions pokedex CSV from `data/champions_pokedex.csv`.
- Fetch Pokemon details from PokeAPI.
- Write normalized pokedex data to `data/champions_pokedex.json`.
- Build speed tier outputs from the normalized pokedex:
  - `data/speed_tiers.json`
  - `data/speed_tiers.csv`
  - `data/speed_tier_combinations.json`
  - `apps/webapp/src/lib/generated/speed_tiers.json`
  - `apps/webapp/static/assets/speed_tiers.json`

## Outputs

- `champions_pokedex.json`: normalized Pokemon records with local ids, display names, PokeAPI slugs, abilities, and stats.
- `speed_tier_combinations.json`: flat list of every generated Pokemon speed setup. Each entry includes Pokemon identity, spread, typed speed effects, final speed, and `speed`.
- `speed_tiers.json`: grouped view of those same combinations by final speed, sorted from fastest to slowest. This is the primary UI contract.
- `speed_tiers.csv`: compact review sheet with `speed`, Pokemon identity, formatted spread, and formatted effects.

The webapp consumes `apps/webapp/src/lib/generated/speed_tiers.json` for the
server-rendered initial table. The browser fetches the public copy from
`apps/webapp/static/assets/speed_tiers.json` after hydration for full filtering.

## Speed Tier Contract

The UI should render speed tiers from grouped JSON:

```ts
type SpeedTier = {
  speed: number;
  pokemon: SpeedTierPokemon[];
};

type SpeedTierPokemon = {
  combinationId: string;
  id: number;
  pokedexNo: number;
  name: string;
  spread: {
    nature: "neutral" | "positive" | "negative";
    evs: 0 | 252;
    ivs: number;
    level: number;
    rawSpeed: number;
  };
  effects: SpeedEffect[];
  finalSpeed: number;
};
```

`effects` are typed so the frontend does not need to infer that `chlorophyll` means `2x` speed in sun or that `choice-scarf` is an item.

```ts
type SpeedEffect = {
  kind: "ability" | "item" | "field" | "weather" | "terrain" | "stage";
  source: string;
  label: string;
  multiplier?: number;
  stage?: number;
  condition?: string;
};
```

Recommended table columns:

```text
Speed | Pokemon | Spread | Effects
```

## Commands

```bash
bun run ingest
bun run build-speed-tiers
```

Both commands accept positional path overrides, but default to repo-level files in `data/`.

See `docs/ARCHITECTURE.md` at the repo root for module responsibilities and pipeline flow.
