// game.js — state machine and turn engine (all game state lives here)

// Maps each faction to its unique resource type
const FACTION_RESOURCE = {
  ember: 'cinders',
  tide: 'flow',
  stone: 'ore',
  gale: 'drift'
};

// The single source of truth for all game state
const state = {
  map: null,
  factions: [],
  currentFaction: null,
  turnNumber: 1,
  altarHolder: null,
  altarTurns: 0,
  essence: {},
  uniqueResources: {},
  capitals: {},
  winner: null,
  phase: 'playing',
  researched: {},
  selectedUnit: null,
  validMoves: [],
  showHandoff: false,
  nextFaction: null
};

// Sets starting essence to 2 for each faction
function initEssence(factions) {
  const essence = {};
  const unique = {};
  for (let i = 0; i < factions.length; i++) {
    essence[factions[i]] = 2;
    unique[factions[i]] = 0;
  }
  return { essence: essence, uniqueResources: unique };
}

// Finds capital positions from the map grid
function findCapitals(map, factions) {
  const capitals = {};
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].capital && map[y][x].owner) {
        capitals[map[y][x].owner] = [y, x];
      }
    }
  }
  return capitals;
}

// Initialises the full game state, generates the map, returns state
function initGame(factions) {
  state.map = generateMap();
  state.factions = factions.slice();
  state.currentFaction = factions[0];
  state.turnNumber = 1;
  state.altarHolder = null;
  state.altarTurns = 0;
  state.winner = null;
  state.phase = 'playing';
  state.researched = {};
  state.selectedUnit = null;
  state.validMoves = [];
  state.showHandoff = false;
  state.nextFaction = null;
  const resources = initEssence(factions);
  state.essence = resources.essence;
  state.uniqueResources = resources.uniqueResources;
  state.capitals = findCapitals(state.map, factions);
  placeStartingUnits(state.map, state.capitals, factions);
  return state;
}

// Counts tiles owned by a faction, returns essence and unique resource gained
function collectResources(faction) {
  let essenceGain = 0;
  let uniqueGain = 0;
  const factionResource = FACTION_RESOURCE[faction];
  for (let y = 0; y < state.map.length; y++) {
    for (let x = 0; x < state.map[y].length; x++) {
      const tile = state.map[y][x];
      if (tile.owner !== faction) continue;
      essenceGain += 1;
      if (tile.resource === factionResource) uniqueGain += 1;
    }
  }
  state.essence[faction] += essenceGain;
  state.uniqueResources[faction] += uniqueGain;
  return { essence: essenceGain, uniqueResource: uniqueGain };
}

// Finds the altar tile on the map and returns it with its position
function findAltarTile(map) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].altar) return { tile: map[y][x], y: y, x: x };
    }
  }
  return null;
}

// Updates altar holder tracking and checks for altar win condition
function checkAltarControl() {
  const altar = findAltarTile(state.map);
  if (!altar) return;
  const owner = altar.tile.owner;
  if (owner && owner === state.altarHolder) {
    state.altarTurns += 1;
  } else if (owner) {
    state.altarHolder = owner;
    state.altarTurns = 1;
  } else {
    state.altarHolder = null;
    state.altarTurns = 0;
  }
  if (state.altarTurns >= 3) {
    state.winner = state.altarHolder;
    state.phase = 'gameover';
  }
}

// Checks if any faction's capital is occupied by an enemy unit
function checkCapitalElimination() {
  const eliminated = [];
  for (let i = 0; i < state.factions.length; i++) {
    const faction = state.factions[i];
    const pos = state.capitals[faction];
    if (!pos) continue;
    const tile = state.map[pos[0]][pos[1]];
    if (tile.unit && tile.unit.faction !== faction) {
      eliminated.push(faction);
    }
  }
  return eliminated;
}

// Removes a faction from the active factions list
function eliminateFaction(faction) {
  const index = state.factions.indexOf(faction);
  if (index !== -1) state.factions.splice(index, 1);
}

// Checks if only one faction remains — that faction wins
function checkLastStanding() {
  if (state.factions.length === 1) {
    state.winner = state.factions[0];
    state.phase = 'gameover';
  }
}

// Returns the index of the current faction in the factions array
function currentFactionIndex() {
  return state.factions.indexOf(state.currentFaction);
}

// Advances to the next faction's turn, wrapping around to the first
function advanceFaction() {
  const idx = currentFactionIndex();
  const next = (idx + 1) % state.factions.length;
  state.currentFaction = state.factions[next];
  if (next === 0) state.turnNumber += 1;
}

// Main end-turn function: collect, check win, advance turn
function endTurn() {
  if (state.phase === 'gameover') return state;
  state.selectedUnit = null;
  state.validMoves = [];
  collectResources(state.currentFaction);
  checkAltarControl();
  const eliminated = checkCapitalElimination();
  for (let i = 0; i < eliminated.length; i++) {
    eliminateFaction(eliminated[i]);
  }
  checkLastStanding();
  if (state.phase !== 'gameover') {
    advanceFaction();
    resetAllUnitsForFaction(state.map, state.currentFaction);
    applyTideRegen(state.map, state.currentFaction);
    state.showHandoff = true;
    state.nextFaction = state.currentFaction;
  }
  return state;
}

// Returns a read-only snapshot of current game state
function getState() {
  return Object.assign({}, state);
}

// Returns tile data plus game context for a given position
function getTileInfo(row, col) {
  if (row < 0 || row >= state.map.length) return null;
  if (col < 0 || col >= state.map[0].length) return null;
  const tile = state.map[row][col];
  return {
    tile: tile,
    row: row,
    col: col,
    isAltar: tile.altar,
    isCapital: tile.capital,
    altarHolder: tile.altar ? state.altarHolder : null,
    altarTurns: tile.altar ? state.altarTurns : 0
  };
}

// Selects a unit and computes valid moves
function selectUnit(row, col) {
  const tile = state.map[row][col];
  if (!tile.unit) return false;
  if (tile.unit.faction !== state.currentFaction) return false;
  state.selectedUnit = [row, col];
  state.validMoves = getValidMoves(state.map, row, col, MAP_SIZE);
  return true;
}

// Clears the current unit selection
function clearSelection() {
  state.selectedUnit = null;
  state.validMoves = [];
}

// Checks if a position is in the valid moves list
function isValidMove(row, col) {
  for (let i = 0; i < state.validMoves.length; i++) {
    if (state.validMoves[i][0] === row && state.validMoves[i][1] === col) {
      return true;
    }
  }
  return false;
}

// Handles a click on a valid move tile (move or attack)
function handleMoveOrAttack(toRow, toCol) {
  if (!state.selectedUnit) return null;
  const fRow = state.selectedUnit[0];
  const fCol = state.selectedUnit[1];
  const target = state.map[toRow][toCol];
  if (target.unit && target.unit.faction !== state.currentFaction) {
    const result = attackUnit(state.map, fRow, fCol, toRow, toCol, MAP_SIZE);
    clearSelection();
    return { action: 'attack', result: result };
  }
  moveUnit(state.map, fRow, fCol, toRow, toCol);
  clearSelection();
  return { action: 'move' };
}

// Dismisses the handoff screen so the next player can see the map
function dismissHandoff() {
  state.showHandoff = false;
  state.nextFaction = null;
}