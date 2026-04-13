# Architecture

`outspeed.me` has two main systems:

1. **Web app**: SvelteKit UI for the spreadsheet, outspeed quiz, and speed calculator.
2. **Ingestor**: Local script that builds versioned CSV/JSON dataset artifacts from PokeAPI.

The ingestor does not run in the web request path. It takes a curated Pokémon list, fetches and normalizes PokeAPI data, applies Pokémon Champions-specific rules, validates the result, and writes generated artifacts into `data/`.

The SvelteKit app loads those generated artifacts server-side. The spreadsheet page renders the dataset as a static HTML table. The quiz page uses the in-memory JSON dataset to select two rows and ask which Pokémon outspeeds the other. The speed calculator lets users choose a Pokémon, nature, item, ability, and speed point investment, then computes an effective speed value and compares it against the same in-memory dataset.

Shared dataset types, validation, speed calculation, sorting, and comparison logic live in a shared package. This keeps the ingestor, quiz, spreadsheet, and calculator aligned around one canonical speed model.
