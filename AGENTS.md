# AGENTS.md

## Task Completion & Requirements

- All of `bun fmt`, `bun lint`, and `bun typecheck` must pass before considering tasks completed unless the task is a documentation change.

## Project Snapshot

outspeed.me is a minimal webapp for displaying speed tier calculations and providing tools related to speed for Pokemon Champions.

This repository is a VERY EARLY WIP. Proposing sweeping changes that improve long-term maintainability is encouraged.

## Core Priorities

1. Performance first.
2. Reliability first.
3. Deterministic dataset generation.

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.

## Package Roles

- `@outspeedme/ingestor`: Data pipeline. This package turns source Pokemon data into normalized files the webapp can consume.

## Reference Repos & Docs

- PokeAPI: <https://github.com/PokeAPI/pokeapi>
- PokeAPI docs: <https://pokeapi.co/docs/v2>
