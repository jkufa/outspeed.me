# outspeed.me

Minimal webapp and data pipeline for Pokemon Champions speed tiers.

## Workspace

- `@outspeedme/ingestor`: builds normalized Pokemon data and speed tier outputs.
- `data/`: local source and generated data files. These files are not part of the package source contract.

## Commands

```bash
bun install
bun test
bun fmt
bun lint
bun typecheck
```

Ingestor-specific commands:

```bash
bun run --filter '@outspeedme/ingestor' ingest
bun run --filter '@outspeedme/ingestor' extract-sprites
bun run --filter '@outspeedme/ingestor' upload-sprites
bun run --filter '@outspeedme/ingestor' build-speed-tiers
```

`upload-sprites` requires `BLOB_READ_WRITE_TOKEN`. Sprite PNGs stay generated
local files and should not be committed.
