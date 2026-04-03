// units.js — unit types, placement, movement, combat (pure functions)

// Base stats for every unit type
const UNIT_TYPES = {
  warrior:     { attack: 2, defense: 2, hp: 10, maxHp: 10, movement: 1, cost: 2 },
  rider:       { attack: 3, defense: 1, hp: 10, maxHp: 10, movement: 2, cost: 3 },
  knight:      { attack: 4, defense: 3, hp: 15, maxHp: 15, movement: 1, cost: 5 },
  explorer:    { attack: 1, defense: 1, hp: 10, maxHp: 10, movement: 3, cost: 2 },
  miner:       { attack: 2, defense: 2, hp: 10, maxHp: 10, movement: 1, cost: 3 },
  boat:        { attack: 2, defense: 2, hp: 10, maxHp: 10, movement: 2, cost: 4 },
  firebrand:   { attack: 4, defense: 1, hp: 8,  maxHp: 8,  movement: 1, cost: 3 },
  ashwalker:   { attack: 2, defense: 3, hp: 12, maxHp: 12, movement: 1, cost: 2 },
  pyreling:    { attack: 5, defense: 2, hp: 10, maxHp: 10, movement: 1, cost: 4 },
  diver:       { attack: 3, defense: 2, hp: 10, maxHp: 10, movement: 2, cost: 3 },
  tidecaller:  { attack: 2, defense: 2, hp: 10, maxHp: 10, movement: 2, cost: 2 },
  maelstrom:   { attack: 4, defense: 3, hp: 12, maxHp: 12, movement: 2, cost: 4 },
  guardian:    { attack: 2, defense: 5, hp: 15, maxHp: 15, movement: 1, cost: 3 },
  delver:      { attack: 3, defense: 2, hp: 10, maxHp: 10, movement: 1, cost: 2 },
  colossus:    { attack: 5, defense: 4, hp: 20, maxHp: 20, movement: 1, cost: 4 },
  skyrider:    { attack: 3, defense: 1, hp: 8,  maxHp: 8,  movement: 3, cost: 3 },
  drifter:     { attack: 2, defense: 2, hp: 10, maxHp: 10, movement: 3, cost: 2 },
  stormcaller: { attack: 4, defense: 2, hp: 10, maxHp: 10, movement: 3, cost: 4 }
};

// Creates a new unit instance with faction passives applied
function createUnit(type, faction) {
  const base = UNIT_TYPES[type];
  if (!base) return null;
  const fDef = getFaction(faction);
  let hp = base.maxHp;
  let maxHp = base.maxHp;
  let movement = base.movement;
  if (fDef && fDef.passive === 'fortified') { hp += 2; maxHp += 2; }
  if (fDef && fDef.passive === 'swift') { movement += 1; }
  return {
    type: type, faction: faction,
    attack: base.attack, defense: base.defense,
    hp: hp, maxHp: maxHp,
    movement: movement, movesLeft: movement,
    hasAttacked: false
  };
}

// Places one starting warrior on each faction's capital tile
function placeStartingUnits(map, capitals, factions) {
  for (let i = 0; i < factions.length; i++) {
    const f = factions[i];
    const pos = capitals[f];
    if (!pos) continue;
    map[pos[0]][pos[1]].unit = createUnit('warrior', f);
  }
}

// Checks if a tile blocks movement for a given faction
function isTileBlocked(tile, faction) {
  if (tile.type === 'mountain') return true;
  if (tile.type === 'water') {
    const fDef = getFaction(faction);
    if (!fDef || fDef.passive !== 'aquatic') return true;
  }
  return false;
}

// Returns 4-directional neighbours within map bounds
function getNeighbours(row, col, size) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  const result = [];
  for (let i = 0; i < dirs.length; i++) {
    const nr = row + dirs[i][0];
    const nc = col + dirs[i][1];
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      result.push([nr, nc]);
    }
  }
  return result;
}

// Processes one BFS neighbour for movement, returns true if enqueued
function processMoveBFS(map, nr, nc, left, faction, canLeap, visited, moves, queue) {
  const key = nr + ',' + nc;
  if (visited[key]) return;
  const tile = map[nr][nc];
  if (isTileBlocked(tile, faction)) return;
  if (tile.unit && tile.unit.faction === faction) {
    if (canLeap) visited[key] = true;
    return;
  }
  visited[key] = true;
  moves.push([nr, nc]);
  if (tile.unit && tile.unit.faction !== faction) return;
  if (left - 1 > 0) queue.push([nr, nc, left - 1]);
}

// BFS to find all tiles a unit can move to this turn
function getValidMoves(map, row, col, size) {
  const unit = map[row][col].unit;
  if (!unit || unit.movesLeft <= 0) return [];
  const faction = unit.faction;
  const fDef = getFaction(faction);
  const canLeap = fDef && fDef.passive === 'swift';
  const visited = {};
  const queue = [[row, col, unit.movesLeft]];
  visited[row + ',' + col] = true;
  const moves = [];
  while (queue.length > 0) {
    const cur = queue.shift();
    const neighbours = getNeighbours(cur[0], cur[1], size);
    for (let i = 0; i < neighbours.length; i++) {
      processMoveBFS(map, neighbours[i][0], neighbours[i][1], cur[2], faction, canLeap, visited, moves, queue);
    }
  }
  return moves;
}

// Moves a unit from one tile to another, claims ownership
function moveUnit(map, fromRow, fromCol, toRow, toCol) {
  const unit = map[fromRow][fromCol].unit;
  if (!unit) return map;
  const dist = Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol);
  unit.movesLeft = Math.max(0, unit.movesLeft - dist);
  map[toRow][toCol].unit = unit;
  map[toRow][toCol].owner = unit.faction;
  map[fromRow][fromCol].unit = null;
  return map;
}

// Counts allied units adjacent to a position (for Ember pack bonus)
function countAdjacentAllies(map, row, col, faction, size) {
  const neighbours = getNeighbours(row, col, size);
  let count = 0;
  for (let i = 0; i < neighbours.length; i++) {
    const t = map[neighbours[i][0]][neighbours[i][1]];
    if (t.unit && t.unit.faction === faction) count++;
  }
  return count;
}

// Resolves combat between attacker and defender units
function attackUnit(map, aRow, aCol, dRow, dCol, size) {
  const attacker = map[aRow][aCol].unit;
  const defender = map[dRow][dCol].unit;
  if (!attacker || !defender) return null;
  let atkPower = attacker.attack;
  const aFaction = getFaction(attacker.faction);
  if (aFaction && aFaction.passive === 'packBonus') {
    const allies = countAdjacentAllies(map, aRow, aCol, attacker.faction, size);
    if (allies > 0) atkPower += 1;
  }
  const dmgToDefender = Math.round((atkPower / defender.defense) * 4.5);
  const dmgToAttacker = Math.round((defender.attack / attacker.defense) * 4.5);
  defender.hp -= dmgToDefender;
  attacker.hp -= dmgToAttacker;
  attacker.hasAttacked = true;
  attacker.movesLeft = 0;
  const result = { attackerDmg: dmgToAttacker, defenderDmg: dmgToDefender, killed: false };
  if (defender.hp <= 0) {
    map[dRow][dCol].unit = null;
    result.killed = true;
  }
  if (attacker.hp <= 0) {
    map[aRow][aCol].unit = null;
  }
  return result;
}

// Resets a unit's movement and attack for a new turn
function resetUnitTurn(unit) {
  unit.movesLeft = unit.movement;
  unit.hasAttacked = false;
}

// Resets all units belonging to a faction on the map
function resetAllUnitsForFaction(map, faction) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const u = map[y][x].unit;
      if (u && u.faction === faction) resetUnitTurn(u);
    }
  }
}

// Applies Tide passive: regen 1 HP on water tiles at turn start
function applyTideRegen(map, faction) {
  const fDef = getFaction(faction);
  if (!fDef || fDef.passive !== 'aquatic') return;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const tile = map[y][x];
      if (!tile.unit || tile.unit.faction !== faction) continue;
      if (tile.type === 'water') {
        tile.unit.hp = Math.min(tile.unit.hp + 1, tile.unit.maxHp);
      }
    }
  }
}

// Returns unit types the faction can recruit (has tech + can afford)
function getRecruitableUnits(factionName, gameState) {
  const available = [{ type: 'warrior', cost: UNIT_TYPES.warrior.cost }];
  if (!gameState.researched || !gameState.researched[factionName]) {
    return available;
  }
  const researched = gameState.researched[factionName];
  const allTechs = Object.assign({}, SHARED_TECHS, EXCLUSIVE_TECHS);
  const keys = Object.keys(researched);
  for (let i = 0; i < keys.length; i++) {
    const tech = allTechs[keys[i]];
    if (tech && tech.unlocks) {
      const ut = UNIT_TYPES[tech.unlocks];
      if (ut) available.push({ type: tech.unlocks, cost: ut.cost });
    }
  }
  return available;
}

// Places a new unit on a tile if affordable and tile is empty
function recruitUnit(map, row, col, type, faction, gameState) {
  const tile = map[row][col];
  if (tile.unit) return false;
  if (!tile.capital || tile.owner !== faction) return false;
  const base = UNIT_TYPES[type];
  if (!base) return false;
  if (gameState.essence[faction] < base.cost) return false;
  gameState.essence[faction] -= base.cost;
  tile.unit = createUnit(type, faction);
  tile.unit.movesLeft = 0;
  tile.unit.hasAttacked = true;
  return true;
}