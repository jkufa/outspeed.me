# Spec: Custom Pokemon Builds in Speed Tiers

## Summary

Add local-persistent custom Pokemon builds to the speed tiers page so players can see where their own builds land in the current tier list.

V1 scope:

- manual build entry
- Pokemon Showdown paste/import
- local browser persistence only
- mobile support required
- all new UI built on `shadcn/ui`
- unsupported speed modifiers from Showdown are stripped and surfaced via notification
- user-facing investment language must use Champions terminology: `SP` / `32 SP`

## Product Goal

Players need to compare custom speed investments against the existing speed tier table.

Current table is useful for built-in spread assumptions, but players often run non-standard speed investment. Feature should let them add their own builds and see exact placement inside existing table without leaving page.

## Non-Goals

Do not do these in V1:

- accounts
- backend storage
- cross-device sync
- arbitrary server upload
- full battle-state simulator
- full support for every Showdown item/ability interaction
- expanding static generated dataset to every possible investment combination
- replacing current spreadsheet architecture

## Current Architecture

Re-reviewed current codebase. Important facts:

### Route and Data Loading

- `apps/webapp/src/routes/+page.server.ts`
  - prerendered
  - loads initial limited row slice via `speedTierStore.query(defaultSpeedTierQuery())`
- `apps/webapp/src/lib/server/speed-tier-store.ts`
  - reads `apps/webapp/static/assets/speed_tiers.json`
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-spreadsheet.svelte`
  - owns client state
  - hydrates by fetching full `/assets/speed_tiers.json`
  - switches from SSR display slice to full `SpeedTier[]`

### Filtering and Table Shaping

- `apps/webapp/src/lib/speed-tiers/filter.ts`
  - filters raw `SpeedTier[]`
  - then groups rows for display
- `apps/webapp/src/lib/speed-tiers/display.ts`
  - merges raw tier rows into display rows
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-table-rows.ts`
  - flattens display tiers to table rows
  - uses `pokemon.combinationId` as row key

### Current Type / Model Limits

- `apps/webapp/src/lib/speed-tiers/types.ts`
  - `SpeedEv = 0 | 252`
- `packages/ingestor/src/speed-tiers/types.ts`
  - same fixed EV model
- `apps/webapp/src/lib/speed-tiers/format.ts`
  - formatting assumes only `0 SP` or `32 SP`
- `apps/webapp/src/lib/speed-tiers/filter.ts`
  - spread filtering assumes fixed preset spread buckets only

### Current Speed Calculation Source of Truth

- `packages/ingestor/src/speed-tiers/calculate.ts`
- `packages/ingestor/src/speed-tiers/effects.ts`
- `packages/ingestor/src/speed-tiers/rules.ts`

Webapp does not currently reuse these directly.

## UX Requirements

### Core Experience

Add a `My builds` feature to existing speed tiers page.

User must be able to:

- open build UI from speed tiers page
- add custom build manually
- paste Showdown set and import it
- see custom build land in existing table at correct speed
- edit saved build
- delete saved build
- keep saved builds after refresh on same device

### Language and Terminology

Use Champions terminology in UI.

Requirements:

- user-facing input labels use `SP`, not `Speed EVs`
- input UI should reflect Champions-style speed stat-point investment
- existing table may continue using `SP` display
- do not introduce EV terminology in primary UI copy unless needed in helper text for parsing/import explanation

Feature exists because players may want builds outside current built-in max-speed assumptions. UI must support non-max custom SP investment, not only `0 SP` and `32 SP`.

### Input Modes

#### Manual Entry

Manual entry flow must support:

- species/form selection
- speed investment using Champions `SP` terminology
- speed nature choice
- optional supported speed item
- optional supported speed ability

Manual flow should be compact, fast, and easy to edit repeatedly.

#### Showdown Import

Showdown import flow must support:

- paste single set text
- parse relevant speed data
- preview resolved build before saving or immediately import with clear feedback
- clear recoverable errors

Parser may ignore non-speed-relevant lines.

### Visual Treatment

Custom builds must remain visually distinct from built-in rows.

Acceptable patterns:

- `Custom` badge
- `My build` badge
- source indicator in row details
- optional `My builds only` filter/toggle

Do not allow custom rows to disappear into built-in grouped rows if provenance becomes unclear.

### Notifications and Unsupported Modifiers

If imported Showdown build includes unsupported speed-affecting item or ability:

- strip unsupported modifier from imported result
- keep rest of build when possible
- show visible notification listing stripped modifiers
- calculate displayed speed using only supported modifiers

Do not reject whole import unless species/form cannot be resolved.

Notification copy should make clear:

- what got ignored
- that shown speed uses only supported effects

## UI Component Requirements

All new UI for this feature must use `shadcn/ui` as component foundation.

Requirements:

- use `shadcn/ui` primitives/components as basis for all new controls
- do not introduce separate component system
- do not build ad-hoc custom primitives when an equivalent `shadcn/ui` component exists
- custom styling is fine
- resulting UI should still feel consistent with current app

Before implementing, inspect existing component usage in repo and extend current patterns where possible.

## Mobile Requirements

Feature must fully support mobile.

Requirements:

- manual entry usable on narrow screens
- Showdown import usable on narrow screens
- notifications/errors readable on mobile
- `My builds` controls integrate with current mobile filter/drawer patterns where appropriate
- custom rows remain understandable in mobile list/table layout
- touch targets, spacing, scroll behavior, and modal/drawer behavior must be tested on small screens
- avoid hover-only affordances
- avoid desktop-only wide inline form layouts without stacked/mobile fallback

## Data Scope

### Supported Species / Forms in V1

V1 should support only Champions species/forms already present in current dataset.

Reason:

- keeps mapping deterministic
- avoids freeform species resolution
- avoids new external data dependency in runtime flow
- matches page purpose

If Showdown import references unsupported species/form, import should fail with clear message.

### Persistence Scope

Persistence is local browser only.

Requirements:

- saved builds survive refresh
- saved builds survive browser restart on same device
- no server sync
- no URL-share requirement in V1

UI should say something like `Saved on this device`.

## Domain Model Requirements

Introduce custom-build-specific types instead of forcing all custom logic into current fixed `SpeedEv = 0 | 252` model.

Suggested concepts:

- `CustomBuildInput`
- `CustomBuildStored`
- `CustomBuildResolved`
- normalized custom row output that can be converted into `SpeedTierPokemon`-compatible shape for rendering

Custom rows must produce enough data for existing table pipeline:

- stable `combinationId`
- `spread`
- `effects`
- `finalSpeed`
- `name`
- `pokedexNo`
- `slug`
- `sprite` if available

## IDs and Identity

Do not reuse built-in row identity assumptions blindly.

Requirements:

- custom rows must use stable, non-colliding identifiers
- `combinationId` must be unique across built-in and custom rows
- row identity must remain safe for:
  - expansion
  - find navigation
  - sorting
  - mobile grouping

Recommended shape:

- `custom:<id>|species:<id>|...`

## Technical Requirements

### Shared Speed Calculation

Do not duplicate speed formula in webapp.

Refactor or extract runtime-safe shared logic from current ingestor speed modules:

- `packages/ingestor/src/speed-tiers/calculate.ts`
- `packages/ingestor/src/speed-tiers/effects.ts`
- `packages/ingestor/src/speed-tiers/rules.ts`

Goal:

- one source of truth for speed math
- one source of truth for modeled modifiers
- browser-safe shared module usable from webapp
- no Bun CLI/runtime dependency in shared runtime path

### Keep Built-In Dataset Static

Do not expand generated `speed_tiers.json` to all possible custom SP combinations.

Built-in tiers remain static, finite, precomputed data.

Custom builds are computed at runtime only for user-created entries.

### Merge Point

Recommended architecture:

1. load built-in `SpeedTier[]` as today
2. load local custom builds after hydration
3. resolve custom builds into normalized runtime rows
4. group custom rows into `SpeedTier[]` by final speed
5. merge custom tiers with built-in tiers in memory
6. run merged data through existing filter/display/table flow

This keeps V1 local and avoids server changes.

### SSR Strategy

Do not move custom-build logic into server load for V1.

Requirements:

- prerender continues to serve built-in initial page
- local custom builds hydrate client-side only
- after hydration, custom rows merge into in-memory data
- page must not break if local storage is empty, corrupt, or unavailable

### Spread / Investment Model

Current app assumes fixed spread presets. V1 must support arbitrary custom Champions SP investment.

Requirements:

- do not silently coerce arbitrary custom SP values into existing preset spread buckets
- built-in spread filters may remain preset-based
- custom rows must not be mislabeled as `0 SP` or `32 SP` when they are not
- if current display formatting cannot represent arbitrary custom SP correctly, extend formatting for custom rows

If needed, built-in and custom spread display/filter logic may diverge internally, but user-facing output must stay accurate.

### Modifier Support Policy

Current modeled modifier set is narrow.

V1 should only compute supported speed-affecting modifiers accurately.

Unsupported Showdown speed modifiers should be:

- stripped
- surfaced in notification
- excluded from final speed math

Do not invent guessed math.

### Showdown Parser Packaging

Showdown parser can live in its own package.

Recommended if implementation is non-trivial.

Suggested package options:

- `packages/showdown-parser`
- `packages/pokemon-showdown-import`

Package requirements:

- pure parse/normalize utilities only
- no Svelte dependency
- no UI notification logic
- testable independently
- webapp remains owner of:
  - import UX
  - validation messaging
  - notifications
  - mapping parsed result into custom build store

## Integration Requirements

### State Ownership

Keep top-level ownership in:

- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-spreadsheet.svelte`

This component already owns:

- loaded tier state
- filters
- find state
- sort-linked row order state

Extend it to own:

- custom build collection
- custom build hydration state
- merged built-in + custom tier state

### Filtering

Current filter system lives in:

- `apps/webapp/src/lib/speed-tiers/types.ts`
- `apps/webapp/src/lib/speed-tiers/filter.ts`
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/filters/*`

Requirements:

- existing built-in filters must keep working
- custom rows should participate naturally where semantics remain valid
- add explicit source-aware affordance if needed, e.g. `My builds only`
- do not redesign whole filter model unless necessary
- species filter should continue to work with rows from same Champions species

### Display Grouping

Current display grouping lives in:

- `apps/webapp/src/lib/speed-tiers/display.ts`

Requirements:

- review grouping key carefully
- ensure custom rows do not collapse invisibly into built-in grouped display rows
- preserve source distinction
- preserve row clarity on both desktop and mobile

### Table Behavior

Current row flattening lives in:

- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-table-rows.ts`

Requirements:

- sorting still works
- find still works
- expansion still works
- mobile rendering still works
- custom row identities remain stable

## Suggested New Modules

Webapp-side likely additions:

- `apps/webapp/src/lib/custom-builds/types.ts`
- `apps/webapp/src/lib/custom-builds/store.ts`
- `apps/webapp/src/lib/custom-builds/persistence.ts`
- `apps/webapp/src/lib/custom-builds/resolve.ts`
- `apps/webapp/src/lib/custom-builds/validation.ts`

Possible parser package:

- `packages/showdown-parser` or similar

Possible shared runtime calc extraction:

- shared package/module used by both ingestor and webapp

## Acceptance Criteria

### Functional

- user can add custom build manually on desktop and mobile
- user can import supported Showdown set on desktop and mobile
- user can edit and delete custom builds
- custom builds persist locally across refresh
- custom build appears in correct speed tier position in main table
- custom rows are visibly distinct from built-in rows
- unsupported imported speed modifiers are stripped and surfaced in notification
- built-in spreadsheet behavior still works

### Technical

- no duplicated speed formula between ingestor and webapp
- no server/API dependency added for V1
- no expansion of static generated dataset to all custom combinations
- local storage failures or corrupt data do not crash page
- all new UI uses `shadcn/ui` as base

### Quality

Per repo rules, before task done:

- `bun fmt`
- `bun lint`
- `bun typecheck`

Add focused tests where they reduce regression risk.

## Test Plan Expectations

High-signal tests only.

### Shared Math

- arbitrary custom SP investment cases
- nature effects
- modeled modifiers
- rounding/floor behavior parity

### Showdown Parser

- happy path
- unsupported species/form
- unsupported speed-affecting item/ability gets stripped
- malformed input recovery

### Persistence

- empty storage
- valid storage
- corrupt storage
- schema version handling

### UI Integration

- add build
- edit build
- delete build
- hydration merge into table
- mobile layout behavior
- source distinction visible
- sort/find still work with custom rows present

## Likely File Targets

Current architecture files likely to change:

- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-spreadsheet.svelte`
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-table.svelte`
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-table-rows.ts`
- `apps/webapp/src/lib/speed-tiers/types.ts`
- `apps/webapp/src/lib/speed-tiers/filter.ts`
- `apps/webapp/src/lib/speed-tiers/display.ts`
- `apps/webapp/src/lib/speed-tiers/format.ts`

Current source-of-truth calc files to extract from:

- `packages/ingestor/src/speed-tiers/calculate.ts`
- `packages/ingestor/src/speed-tiers/effects.ts`
- `packages/ingestor/src/speed-tiers/rules.ts`
- `packages/ingestor/src/speed-tiers/types.ts`

## Implementation Order

1. extract shared runtime-safe speed calculator
2. define custom build domain model and local storage schema
3. implement runtime resolution from custom build to tier rows
4. merge custom rows into client-side spreadsheet state
5. add manual-entry UI with `shadcn/ui`
6. add edit/delete flow
7. add Showdown import flow
8. add notification flow for stripped modifiers
9. add source-aware row treatment/filtering
10. verify mobile behavior
11. add focused tests
12. run `bun fmt`, `bun lint`, `bun typecheck`

## Guardrails

- correctness over breadth
- no guessed speed math
- no backend in V1
- no breaking prerender flow
- no misleading SP labels
- no invisible collapse of custom rows into built-in display groups
- extend current app patterns, do not build parallel UI system