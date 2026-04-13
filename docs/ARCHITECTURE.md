# Architecture

outspeed.me is split into a data pipeline and a future UI. The current codebase is focused on deterministic dataset generation for Pokemon Champions speed tiers.

## Priorities

1. Performance first.
2. Reliability first.
3. Deterministic dataset generation.

When output shape and implementation convenience conflict, prefer stable, explicit data contracts over frontend inference.

## Ingestor Pipeline

`@outspeedme/ingestor` owns all source-to-app data preparation.

```text
champions_pokedex.csv
  -> pokedex parser
  -> PokeAPI fetch
  -> normalized pokedex JSON
  -> speed tier combination builder
  -> grouped speed tier JSON + CSV review output
```

## Speed Tier Modules

- `types.ts`: public data contracts and calculation types.
- `rules.ts`: constants and inclusion rules for generated combinations.
- `effects.ts`: typed speed effect catalog. Ability/item labels, multipliers, and conditions live here.
- `calculate.ts`: stat math, speed calculation traces, and combination generation.
- `output.ts`: grouping, deterministic sorting, and CSV projection.
- `build.ts`: orchestration for generated outputs.
- `cli.ts`: file IO for command-line generation.

## Speed Tier Contract

The grouped JSON is the primary UI input. It is already shaped for the table:

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

## Effect Provenance

Speed-changing context must be emitted as typed `effects[]`, not inferred by the frontend from raw ability or item names.

This supports:

- clear chips such as `2x`, `Sand Rush`, `sand`
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

This keeps generated output stable and makes repeated Pokemon variants predictable in the UI.
