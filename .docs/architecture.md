# Architecture

`outspeed.me` splits into two systems:

1. **Web app**: SvelteKit UI that consumes generated speed-tier artifacts.
2. **Ingestor**: local data pipeline that turns source Pokemon data into normalized artifacts in `data/`.

Current focus is deterministic dataset generation for Pokemon Champions speed tiers. The ingestor never runs in the web request path.

## Priorities

1. Performance first.
2. Reliability first.
3. Deterministic dataset generation.

When output shape and implementation convenience conflict, prefer stable, explicit data contracts over frontend inference.

## Data Pipeline

`@outspeedme/ingestor` owns source-to-app data preparation:

```text
champions_pokedex.csv
  -> pokedex parser
  -> PokeAPI fetch
  -> normalized pokedex JSON
  -> speed tier combination builder
  -> grouped speed tier JSON + CSV review output
```

Generated artifacts:

- `data/champions_pokedex.json`: normalized Pokemon input.
- `data/speed_tier_combinations.json`: flat calculated combinations.
- `data/speed_tiers.json`: grouped UI contract, sorted by speed.
- `data/speed_tiers.csv`: review-friendly projection.

## Speed Tier Modules

- `types.ts`: public data contracts and calculation types.
- `rules.ts`: inclusion rules for generated combinations.
- `effects.ts`: typed speed effect catalog for abilities, items, multipliers, and conditions.
- `calculate.ts`: stat math, calculation traces, and combination generation.
- `output.ts`: grouping, deterministic sorting, and CSV projection.
- `build.ts`: orchestration for generated outputs.
- `cli.ts`: file IO for command-line generation.

## UI Contract

`speed_tiers.json` is primary web app input. It is already shaped for the table:

```text
Speed | Pokemon | Spread | Effects
```

Example:

```json
{
  "speed": 308,
  "pokemon": [
    {
      "id": 153,
      "pokedexNo": 530,
      "name": "Excadrill",
      "spread": {
        "nature": "positive",
        "evs": 252,
        "ivs": 31,
        "level": 50,
        "rawSpeed": 154
      },
      "effects": [
        {
          "kind": "ability",
          "source": "sand-rush",
          "label": "Sand Rush",
          "multiplier": 2,
          "condition": "sand"
        }
      ],
      "finalSpeed": 308
    }
  ]
}
```

The web app should load generated artifacts server-side. Spreadsheet, quiz, and calculator views should share the same dataset types, speed calculation, sorting, and comparison logic instead of reimplementing speed rules locally.

## Effect Provenance

Speed-changing context must be emitted as typed `effects[]`, not inferred by the frontend from ability or item names.

This supports:

- clear chips such as `2x`, `Sand Rush`, and `sand`
- filters by effect kind or condition
- stacked modifiers such as ability plus Choice Scarf
- future field, weather, terrain, Tailwind, and stage effects

## Sorting

Grouped tiers sort by speed descending. Pokemon within a speed group sort deterministically by:

1. Pokedex number
2. Local id
3. Name
4. Nature rank: positive, neutral, negative
5. EVs descending
6. Formatted effects

Stable sorting keeps generated output reproducible and repeated Pokemon variants predictable in the UI.
