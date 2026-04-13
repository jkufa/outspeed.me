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

## Outputs

- `champions_pokedex.json`: normalized Pokemon records with local ids, display names, PokeAPI slugs, abilities, and stats.
- `speed_tier_combinations.json`: flat list of every generated Pokemon speed setup. Each entry includes Pokemon identity, EVs, nature, ability, item, and calculated `tier`.
- `speed_tiers.json`: grouped view of those same combinations by final speed tier, sorted from fastest to slowest. This shape is better for UI display.
- `speed_tiers.csv`: CSV version of `speed_tiers.json` for spreadsheet-style review.

## Commands

```bash
bun run ingest
bun run build-speed-tiers
```

Both commands accept positional path overrides, but default to repo-level files in `data/`.
