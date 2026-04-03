// map.js — procedural map generation (pure functions, no state)

const MAP_SIZE = 16;

// Returns a random terrain type weighted toward plains
function randomTerrain() {
  const roll = Math.random();
  if (roll < 0.35) return 'plains';
  if (roll < 0.55) return 'forest';
  if (roll < 0.70) return 'mountain';
  if (roll < 0.85) return 'water';
  return 'desert';
}

// Creates one tile object with default empty values
function createTile(type) {
  return {
    type: type,
    resource: null,
    owner: null,
    unit: null,
    capital: false,
    altar: false
  };
}

// Builds a raw 16x16 grid of random terrain
function generateRawGrid() {
  const grid = [];
  for (let y = 0; y < MAP_SIZE; y++) {
    const row = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      row.push(createTile(randomTerrain()));
    }
    grid.push(row);
  }
  return grid;
}

// Counts how many of the 8 neighbours match a given terrain type
function countNeighboursOfType(grid, x, y, type) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= MAP_SIZE) continue;
      if (ny < 0 || ny >= MAP_SIZE) continue;
      if (grid[ny][nx].type === type) count++;
    }
  }
  return count;
}

// Smooths terrain so similar tiles cluster together naturally
function smoothGrid(grid) {
  const next = [];
  for (let y = 0; y < MAP_SIZE; y++) {
    const row = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      const current = grid[y][x].type;
      const same = countNeighboursOfType(grid, x, y, current);
      row.push(createTile(same >= 3 ? current : randomTerrain()));
    }
    next.push(row);
  }
  return next;
}

// Places the Altar at the exact centre of the map
function placeAltar(grid) {
  const cx = Math.floor(MAP_SIZE / 2);
  const cy = Math.floor(MAP_SIZE / 2);
  grid[cy][cx].type = 'plains';
  grid[cy][cx].altar = true;
  return grid;
}

// Assigns the correct resource type to each tile based on terrain
function assignResources(grid) {
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const tile = grid[y][x];
      if (tile.type === 'desert' || tile.type === 'plains') {
        tile.resource = 'cinders';
      } else if (tile.type === 'mountain') {
        tile.resource = 'ore';
      }
    }
  }
  return grid;
}

// Checks if a tile is adjacent to water (for Flow resource)
function isAdjacentToWater(grid, x, y) {
  return countNeighboursOfType(grid, x, y, 'water') > 0;
}

// Assigns water-adjacent resources (Flow) and open-plains resources (Drift)
function assignProximityResources(grid) {
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const tile = grid[y][x];
      if (tile.resource) continue;
      if (tile.type === 'water') {
        tile.resource = 'flow';
      } else if (isAdjacentToWater(grid, x, y)) {
        tile.resource = 'flow';
      } else if (tile.type === 'plains') {
        tile.resource = 'drift';
      }
    }
  }
  return grid;
}

// Places four faction capitals in the four corners of the map
function placeCapitals(grid) {
  const corners = [
    { x: 2, y: 2 },
    { x: MAP_SIZE - 3, y: 2 },
    { x: 2, y: MAP_SIZE - 3 },
    { x: MAP_SIZE - 3, y: MAP_SIZE - 3 }
  ];
  const factions = ['ember', 'tide', 'stone', 'gale'];
  for (let i = 0; i < 4; i++) {
    const pos = corners[i];
    grid[pos.y][pos.x].type = 'plains';
    grid[pos.y][pos.x].capital = true;
    grid[pos.y][pos.x].owner = factions[i];
  }
  return grid;
}

// Main entry point: generates a complete game-ready map
function generateMap() {
  let grid = generateRawGrid();
  grid = smoothGrid(grid);
  grid = smoothGrid(grid);
  grid = placeAltar(grid);
  grid = placeCapitals(grid);
  grid = assignResources(grid);
  grid = assignProximityResources(grid);
  return grid;
}