# Elemental Conquest

A turn-based strategy game for 2–4 players, played in a single browser tab. No install, no server, no dependencies — just open `index.html`.

## How to Play

1. Download all 8 files into one folder
2. Open `index.html` in any modern browser
3. That's it. No npm, no build step, no server

The tutorial launches automatically on first visit. Four players pass the screen between turns (hot-seat multiplayer). Each player controls one elemental faction on a 16×16 procedurally generated grid.

## The Four Factions

| Faction | Passive | Unique Resource | Exclusive Units |
|---------|---------|-----------------|-----------------|
| **Ember** | +1 ATK when adjacent to allied unit | Cinders (desert/plains) | Firebrand, Ashwalker, Pyreling |
| **Tide** | Can traverse water tiles, regen 1 HP/turn on water | Flow (water-adjacent) | Diver, Tidecaller, Maelstrom |
| **Stone** | All units +2 max HP | Ore (mountain) | Guardian, Delver, Colossus |
| **Gale** | +1 movement, can leap over units | Drift (open plains) | Skyrider, Drifter, Stormcaller |

## Win Conditions

There are two ways to win:

- **Altar Control** — Move a unit onto the central Altar tile and hold it for 3 consecutive turns
- **Capital Elimination** — Destroy all enemy capitals by occupying them with your units

## Tech Tree

Each faction has access to **5 shared techs** (cost Essence) and **3 faction-exclusive techs** (cost unique resource).

**Shared techs** unlock universal unit types: Riding → Rider, Sailing → Boat, Forestry → Explorer, Mining → Miner, Smithing → Knight.

**Faction techs** unlock the 3 exclusive units listed above. These use your faction's unique resource, giving you access to units no other faction can build.

## Controls

- **Click your unit** — Select it. Valid moves highlight in white, attackable enemies in red.
- **Click a highlighted tile** — Move there, or attack if an enemy occupies it.
- **Click your empty capital** — Open the recruit panel to build new units.
- **End Turn** — Collects resources, checks win conditions, passes to the next player.
- **Tech Tree** — Opens the research panel to spend resources on new unit types.

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Game shell, UI wiring, event handlers, resize logic |
| `game.js` | State machine, turn loop, resource collection, win conditions |
| `map.js` | Procedural 16×16 grid generation with terrain clustering |
| `factions.js` | Four faction definitions, shared and exclusive tech trees |
| `units.js` | 18 unit types, BFS pathfinding, combat formula, recruitment |
| `renderer.js` | All canvas drawing — pixel art terrain, 18 unit sprites, animations |
| `tutorial.js` | 12-step in-game tutorial overlay with spotlight highlighting |
| `style.css` | Parchment sidebar, full-screen canvas layout, overlays, responsive rules |

## Coding Constraints

This project follows strict rules throughout:

- Pure HTML, CSS, and JavaScript — zero frameworks, zero libraries, zero build tools
- Every function does exactly one thing and is under 30 lines
- No classes — plain objects and functions only
- Game state lives only in `game.js` — all other files are pure functions
- All pixel art uses only `ctx.fillRect()` — no `arc()`, `strokeRect()`, or `beginPath()`
- No external assets — everything is drawn in code
- One-line comment above every function

## Future Scope

- **AI opponent** — `ai.js` is planned in the file structure but not yet implemented
- **Sound effects and music**
- **Save / load game state**
- **Online multiplayer**
- **Mobile touch optimization**

## Built With

Plain HTML, CSS, and JavaScript. Nothing else.

## License

MIT — see [LICENSE](LICENSE) for details.
