# Parallel Work Plan: Custom Pokemon Builds

## Summary

This feature can be split across multiple agents, but only after a small contract-setting phase. The main risk is agents touching the same spreadsheet shell file at once, especially `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-spreadsheet.svelte`.

Best strategy:

1. Run Phase 0 first.
2. Start Agent A and Agent B in parallel.
3. Start Agent C after Agent A's shared calculator contract exists; C can mock parser output until B finishes.
4. Start Agent D after Phase 0; D can mock store actions until C finishes.
5. Start Agent E after C resolver shape and D UI events are stable.
6. Agent F runs after integration, with small test work possible earlier.

## Phase 0: Contract Setup

One agent should go first and define shared interfaces. This is the coordination step that keeps later agents from inventing incompatible models.

Deliverables:

- custom build domain types
- shared speed calculator API
- Showdown parser output shape
- storage schema version
- row conversion contract into `SpeedTierPokemon`
- supported-modifier metadata shape
- source/provenance representation for custom rows

Recommended outputs:

- type definitions or stubs in agreed file locations
- short contract note in PR/commit description
- no large UI implementation yet

## Agent A: Shared Speed Runtime

Scope:

- extract runtime-safe speed calculation from ingestor
- support arbitrary Champions `SP`
- keep ingestor using same math
- add math tests

Likely files:

- `packages/ingestor/src/speed-tiers/calculate.ts`
- `packages/ingestor/src/speed-tiers/effects.ts`
- `packages/ingestor/src/speed-tiers/rules.ts`
- possible new shared package/module

Output contract:

- function to calculate raw/final speed from base speed, SP, nature, item, ability
- supported modifier metadata
- no UI dependencies
- browser-safe runtime path

Can run in parallel with:

- Agent B after Phase 0

Blocks:

- Agent C final resolver implementation

## Agent B: Showdown Parser Package

Scope:

- create parser package if warranted
- parse single Showdown set
- normalize species, item, ability, speed investment, and nature into agreed output shape
- mark unsupported modifiers so webapp can strip and notify
- add parser tests

Likely files:

- `packages/showdown-parser/*`
- or `packages/pokemon-showdown-import/*`

Output contract:

- pure parser result
- no Svelte dependency
- no UI notification logic
- no direct local-storage dependency
- Champions dataset lookup should be injected or done by webapp resolver, not hard-coded into parser

Can run in parallel with:

- Agent A after Phase 0
- Agent D if D uses mocked parser output

Blocks:

- final Showdown import wiring

## Agent C: Custom Build Store and Resolver

Scope:

- implement local storage persistence
- validate custom builds
- resolve saved builds into `SpeedTierPokemon`-compatible rows
- merge custom rows with built-in `SpeedTier[]`
- handle corrupt or old local-storage data safely

Likely files:

- `apps/webapp/src/lib/custom-builds/types.ts`
- `apps/webapp/src/lib/custom-builds/store.ts`
- `apps/webapp/src/lib/custom-builds/persistence.ts`
- `apps/webapp/src/lib/custom-builds/resolve.ts`
- `apps/webapp/src/lib/custom-builds/validation.ts`
- possibly `apps/webapp/src/lib/speed-tiers/*`

Depends on:

- Phase 0 contracts
- Agent A calculator API

Can mock:

- Agent B parser result shape until parser package lands

Blocks:

- Agent E spreadsheet integration

## Agent D: UI Components

Scope:

- build `My builds` UI with `shadcn/ui`
- manual entry UI
- import tab/surface shell
- edit/delete UI
- notifications for stripped modifiers
- mobile layout

Likely files:

- new components under `apps/webapp/src/lib/components/speed-tier-spreadsheet/`
- or a new nearby custom-builds component folder

Requirements:

- all new controls use `shadcn/ui` as foundation
- no parallel component system
- mobile support is required
- no hover-only actions
- keep props/events explicit so final wiring stays clean

Depends on:

- Phase 0 contracts

Can mock:

- store actions from Agent C
- parser result from Agent B

Blocks:

- Agent E final UI wiring

## Agent E: Spreadsheet Integration

Scope:

- wire custom builds into `speed-tier-spreadsheet.svelte`
- preserve SSR/prerender behavior
- load local builds after hydration
- merge built-in and custom tiers
- add source-aware filtering/display grouping
- ensure custom row badge/source treatment survives grouping
- verify sort/find/mobile behavior

Likely files:

- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-spreadsheet.svelte`
- `apps/webapp/src/lib/speed-tiers/display.ts`
- `apps/webapp/src/lib/speed-tiers/filter.ts`
- `apps/webapp/src/lib/speed-tiers/format.ts`
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-table-rows.ts`
- `apps/webapp/src/lib/components/speed-tier-spreadsheet/speed-tier-table.svelte`

Depends on:

- Agent C resolver shape
- Agent D UI props/events
- Agent A calculator through C

Important caveat:

- `speed-tier-spreadsheet.svelte` is the highest-conflict file. Avoid having Agents C, D, and E all edit it independently.
- Preferred split:
  - Agent C builds pure store/resolver modules and tests, but does not wire spreadsheet.
  - Agent D builds standalone UI components with props/events, but does not own spreadsheet state.
  - Agent E does final wiring in `speed-tier-spreadsheet.svelte`.

Blocks:

- final QA pass

## Agent F: QA and E2E

Scope:

- add tests across parser, storage, resolver, and UI behavior
- verify mobile behavior
- run required repo checks

Likely files:

- package-level unit tests
- `apps/e2e/tests/*`
- targeted webapp tests if present

Required checks:

- `bun fmt`
- `bun lint`
- `bun typecheck`

Do not run:

- `bun test`

Use:

- `bun run test`

Depends on:

- integrated work from Agents A-E for final pass

Can start early:

- parser tests with Agent B
- calculator tests with Agent A
- persistence tests with Agent C

## Orchestration Strategy

Recommended workflow:

1. Parent/orchestrator agent performs Phase 0 and records contracts.
2. Parent launches Agent A and Agent B in parallel.
3. When Agent A completes, parent launches or unblocks Agent C with calculator contract.
4. Parent launches Agent D after Phase 0, using stubbed store/parser contracts.
5. Parent launches Agent E only after C and D have stable integration points.
6. Parent launches Agent F after integration, or lets F start earlier on isolated tests.

## Can One Agent Start Another?

Usually, do not rely on a worker agent directly spawning the next worker.

Recommended pattern:

- use one parent/orchestrator agent to manage dependencies
- worker Agent A finishes and reports its contract, changed files, and handoff notes
- parent/orchestrator reads A's output, then starts Agent C with those details

This is safer because the parent has full project context and can avoid conflicting edits. It also keeps branch/worktree ownership clearer.

If using tooling that supports nested agent launch from a worker, still prefer explicit handoff back to parent unless the workflow is designed for nested orchestration. Nested launches make dependency tracking, conflict handling, and final merge responsibility harder.

## Conflict Avoidance Rules

- Only Agent E should do final edits to `speed-tier-spreadsheet.svelte`.
- Agent D should produce standalone components with documented props/events.
- Agent C should produce pure modules and tests, not UI wiring.
- Agent A should avoid webapp UI files.
- Agent B should avoid webapp UI files and local-storage files.
- Agents should not independently change shared type contracts after Phase 0 without reporting back to the parent/orchestrator.

## Recommended Handoff Format

Each agent should report:

- files changed
- exported functions/types added
- assumptions made
- known gaps
- commands/tests run
- next agent dependency notes

For Agent A specifically, handoff should include:

- exact calculator function signatures
- how `SP` maps into stat formula inputs
- supported modifier list and metadata shape
- examples covering one no-modifier build and one supported modifier build

For Agent C specifically, handoff should include:

- storage key and schema version
- resolver input/output examples
- behavior for corrupt local storage
- merge behavior for custom rows with same final speed as built-in rows