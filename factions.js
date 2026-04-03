// factions.js — faction definitions and tech trees (pure data + functions)

// All four factions with passives, colours, and tech trees
const FACTIONS = {
  ember: {
    name: 'Ember',
    color: '#E8593C',
    uniqueResource: 'cinders',
    passive: 'packBonus',
    startingUnit: 'warrior',
    exclusiveTechs: ['inferno', 'ashwalk', 'pyre']
  },
  tide: {
    name: 'Tide',
    color: '#3B8BD4',
    uniqueResource: 'flow',
    passive: 'aquatic',
    startingUnit: 'warrior',
    exclusiveTechs: ['deepdive', 'surge', 'whirlpool']
  },
  stone: {
    name: 'Stone',
    color: '#888780',
    uniqueResource: 'ore',
    passive: 'fortified',
    startingUnit: 'warrior',
    exclusiveTechs: ['bulwark', 'quarry', 'rampart']
  },
  gale: {
    name: 'Gale',
    color: '#9FE1CB',
    uniqueResource: 'drift',
    passive: 'swift',
    startingUnit: 'warrior',
    exclusiveTechs: ['updraft', 'tailwind', 'cyclone']
  }
};

// Shared tech definitions available to all factions
const SHARED_TECHS = {
  riding:   { cost: 3, essence: true,  unlocks: 'rider' },
  sailing:  { cost: 4, essence: true,  unlocks: 'boat' },
  forestry: { cost: 2, essence: true,  unlocks: 'explorer' },
  mining:   { cost: 3, essence: true,  unlocks: 'miner' },
  smithing: { cost: 5, essence: true,  unlocks: 'knight' }
};

// Faction-exclusive tech definitions costing unique resources
const EXCLUSIVE_TECHS = {
  inferno:   { cost: 3, essence: false, unlocks: 'firebrand' },
  ashwalk:   { cost: 2, essence: false, unlocks: 'ashwalker' },
  pyre:      { cost: 4, essence: false, unlocks: 'pyreling' },
  deepdive:  { cost: 3, essence: false, unlocks: 'diver' },
  surge:     { cost: 2, essence: false, unlocks: 'tidecaller' },
  whirlpool: { cost: 4, essence: false, unlocks: 'maelstrom' },
  bulwark:   { cost: 3, essence: false, unlocks: 'guardian' },
  quarry:    { cost: 2, essence: false, unlocks: 'delver' },
  rampart:   { cost: 4, essence: false, unlocks: 'colossus' },
  updraft:   { cost: 3, essence: false, unlocks: 'skyrider' },
  tailwind:  { cost: 2, essence: false, unlocks: 'drifter' },
  cyclone:   { cost: 4, essence: false, unlocks: 'stormcaller' }
};

// Returns the faction definition object for a given name
function getFaction(name) {
  return FACTIONS[name] || null;
}

// Returns all tech keys available to a faction (shared + exclusive)
function getFactionTechKeys(factionName) {
  const faction = FACTIONS[factionName];
  if (!faction) return [];
  const shared = Object.keys(SHARED_TECHS);
  return shared.concat(faction.exclusiveTechs);
}

// Returns the tech definition for a given tech key
function getTechDef(techKey) {
  return SHARED_TECHS[techKey] || EXCLUSIVE_TECHS[techKey] || null;
}

// Checks if a faction can afford a tech given current game state
function canAffordTech(factionName, techKey, gameState) {
  const def = getTechDef(techKey);
  if (!def) return false;
  if (def.essence) {
    return gameState.essence[factionName] >= def.cost;
  }
  return gameState.uniqueResources[factionName] >= def.cost;
}

// Researches a tech: deducts cost, marks researched, returns success
function researchTech(factionName, techKey, gameState) {
  if (!gameState.researched) gameState.researched = {};
  if (!gameState.researched[factionName]) gameState.researched[factionName] = {};
  if (gameState.researched[factionName][techKey]) return false;
  if (!canAffordTech(factionName, techKey, gameState)) return false;
  const def = getTechDef(techKey);
  if (def.essence) {
    gameState.essence[factionName] -= def.cost;
  } else {
    gameState.uniqueResources[factionName] -= def.cost;
  }
  gameState.researched[factionName][techKey] = true;
  return true;
}

// Returns techs not yet researched that the faction can afford
function getAvailableTechs(factionName, gameState) {
  const keys = getFactionTechKeys(factionName);
  if (!gameState.researched) gameState.researched = {};
  if (!gameState.researched[factionName]) gameState.researched[factionName] = {};
  const available = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (gameState.researched[factionName][key]) continue;
    available.push({ key: key, def: getTechDef(key) });
  }
  return available;
}

// Checks if a faction has researched a specific tech
function hasTech(factionName, techKey, gameState) {
  if (!gameState.researched) return false;
  if (!gameState.researched[factionName]) return false;
  return gameState.researched[factionName][techKey] === true;
}
