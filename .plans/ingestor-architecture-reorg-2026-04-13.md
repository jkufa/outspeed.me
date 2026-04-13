# Feature-Grouped Ingestor Split

## Summary

Reorganize ingestor around workflows, with cross-feature code grouped by concrete function instead of generic `shared`. Keep CLI commands, positional args, and generated data shapes unchanged.

Target shape:

```text
src/
  index.ts
  config.ts
  parser/
    csv.ts
    csv.test.ts
  pokedex/
    cli.ts
    ingest.ts
    parse-csv.ts
    parse-csv.test.ts
    pokeapi.ts
    slugs.ts
    slugs.test.ts
    normalize.ts
    normalize.test.ts
    types.ts
  speed-tiers/
    cli.ts
    build.ts
    calculate.ts
    calculate.test.ts
    output.ts
    output.test.ts
    rules.ts
    types.ts
```

## Key Changes

- `src/index.ts` becomes export barrel only. No executable script body.
- Current `src/index.ts` logic moves into `src/pokedex/*`:
  - `cli.ts`: Bun args/files/writes.
  - `ingest.ts`: orchestration from CSV rows to normalized Pokemon.
  - `parse-csv.ts`: map CSV rows into typed champions rows.
  - `slugs.ts`: PokeAPI slug transformation.
  - `pokeapi.ts`: fetch PokeAPI Pokemon + fallback behavior, untested unless needed later.
  - `normalize.ts`: transform PokeAPI response into local pokedex record.
  - `types.ts`: Pokedex/PokeAPI types.
- Current `src/build-speed-tiers.ts` logic moves into `src/speed-tiers/*`:
  - `cli.ts`: Bun args/files/writes.
  - `build.ts`: orchestration from pokedex records to all outputs.
  - `calculate.ts`: speed formula, modifiers, combination generation.
  - `output.ts`: tier grouping/sorting and CSV output.
  - `rules.ts`: level, IV, EVs, natures, items, supported speed abilities, combination filters.
  - `types.ts`: speed-tier types.
- `src/parser/csv.ts` owns generic CSV parsing/escaping helpers only.
- `src/config.ts` owns repo/data path defaults, PokeAPI base URL, and positional CLI arg resolution.
- Update package scripts:
  - `ingest`: `bun run src/pokedex/cli.ts`
  - `build-speed-tiers`: `bun run src/speed-tiers/cli.ts`

## Tests

Focus tests on transformation logic only. No PokeAPI call/fallback tests.

- `parser/csv.test.ts`
  - parse quoted commas.
  - parse escaped quotes.
  - serialize cells needing quotes.
- `pokedex/parse-csv.test.ts`
  - required headers.
  - optional `form` and `pokeapi_name`.
  - invalid `pokedex_number`.
  - missing `name`.
- `pokedex/slugs.test.ts`
  - normal punctuation cases: `Mr. Mime`, `Farfetch'd`, `Type: Null`.
  - mega cases: `Mega Charizard X`, `Mega Charizard Y`, generic mega.
  - `pokeapi_name` override wins.
- `pokedex/normalize.test.ts`
  - maps abilities to `{ name, isHidden, slot }`.
  - maps stats into `Record<string, number>`.
  - preserves local id, slug, pokedex number, and display name.
- `speed-tiers/calculate.test.ts`
  - level 50 speed formula for neutral/positive/negative natures.
  - Choice Scarf, double-speed abilities, Speed Boost.
  - unsupported ability error.
  - missing speed stat error.
  - combination filters exclude intended redundant combos.
- `speed-tiers/output.test.ts`
  - group tiers descending.
  - Pokemon sort by `pokedex_no`, then `id`, then `name`.
  - CSV output preserves headers and escapes cells.

## Assumptions

- Keep field names exactly as today: `pokedexNumber`, `pokedex_no`, `EVs`.
- Keep positional CLI args unchanged.
- No new runtime dependencies.
- `pokeapi.ts` remains small and injectable enough to test later, but not covered now.
- Completion gate for implementation: `bun fmt`, `bun lint`, `bun typecheck`, `bun test`.
