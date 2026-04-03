# Contributing to Elemental Conquest

Thanks for your interest. Here's how to get involved.

## Running Locally

Open `index.html` in any modern browser. There is no build step, no server, no install. That's the whole setup.

## Coding Rules

Any contribution must respect these constraints:

1. **One job per function, under 30 lines.** If a function does two things, split it. If it exceeds 30 lines, break it into sub-functions.
2. **No classes.** Plain objects and functions only.
3. **State lives only in `game.js`.** Every other file exports pure functions that take input and return output.
4. **No external libraries.** Zero dependencies. No npm, no CDN imports, no frameworks.
5. **Pixel art uses only `ctx.fillRect()`.** No `arc()`, `strokeRect()`, `beginPath()`, or external image assets.
6. **One-line comment above every function** explaining what it does.
7. **One job per file.** Don't mix rendering logic into game state, or game state into UI wiring.

## Suggesting Features

Open a GitHub issue describing what you'd like to see. Include:

- What the feature does
- Which file(s) it would likely touch
- Whether it adds new files or modifies existing ones

## Planned but Not Yet Built

**`ai.js`** — an AI opponent is planned in the file structure but has not been implemented. The game currently supports hot-seat multiplayer only. If you want to tackle this, open an issue first to discuss the approach.

## Submitting Changes

1. Fork the repository
2. Create a branch for your change
3. Make your changes following the coding rules above
4. Test by opening `index.html` and playing through a few turns
5. Open a pull request with a clear description of what changed and why
