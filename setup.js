// setup.js — faction picker start screen (state + rendering)

// Setup state — independent of game state
var setupState = {
  playerCount: 2,
  selections: [null, null],
  active: true
};

// Faction info for display on setup cards
var FACTION_INFO = {
  ember: { passive: '+1 ATK near allies', resource: 'Cinders' },
  tide:  { passive: 'Walk on water, regen', resource: 'Flow' },
  stone: { passive: 'All units +2 HP', resource: 'Ore' },
  gale:  { passive: '+1 move, leap units', resource: 'Drift' }
};

// Sets player count and resets all selections
function setPlayerCount(n) {
  setupState.playerCount = n;
  setupState.selections = [];
  for (var i = 0; i < n; i++) setupState.selections.push(null);
  renderSetupScreen();
}

// Assigns or unassigns a faction to a player slot
function selectFaction(playerIndex, factionName) {
  if (setupState.selections[playerIndex] === factionName) {
    setupState.selections[playerIndex] = null;
  } else if (!isFactionTaken(factionName)) {
    setupState.selections[playerIndex] = factionName;
  }
  renderSetupScreen();
}

// Returns true if any slot has this faction
function isFactionTaken(factionName) {
  for (var i = 0; i < setupState.selections.length; i++) {
    if (setupState.selections[i] === factionName) return true;
  }
  return false;
}

// Returns which player index has this faction, or -1
function factionTakenBy(factionName) {
  for (var i = 0; i < setupState.selections.length; i++) {
    if (setupState.selections[i] === factionName) return i;
  }
  return -1;
}

// Returns true if all player slots have a faction selected
function isSetupComplete() {
  for (var i = 0; i < setupState.selections.length; i++) {
    if (!setupState.selections[i]) return false;
  }
  return true;
}

// Returns true if setup screen is active
function isSetupActive() {
  return setupState.active;
}

// Builds the begin button label showing matchup
function buildBeginLabel() {
  var names = [];
  for (var i = 0; i < setupState.selections.length; i++) {
    var s = setupState.selections[i];
    if (s) names.push(s.charAt(0).toUpperCase() + s.slice(1));
  }
  if (names.length < setupState.playerCount) return 'Select all factions';
  return 'Begin \u2014 ' + names.join(' vs ');
}

// ---- Rendering ----

// Builds HTML for the player count selector buttons
function buildCountSelector() {
  var html = '<div class="setup-counts">';
  for (var n = 2; n <= 4; n++) {
    var active = setupState.playerCount === n ? ' setup-count-active' : '';
    html += '<button class="setup-count-btn' + active + '" data-count="' + n + '">';
    html += n + ' Players</button>';
  }
  html += '</div>';
  return html;
}

// Builds HTML for one faction option card within a player slot
function buildFactionOption(factionKey, playerIndex) {
  var f = FACTIONS[factionKey];
  var info = FACTION_INFO[factionKey];
  var selected = setupState.selections[playerIndex] === factionKey;
  var takenBy = factionTakenBy(factionKey);
  var taken = takenBy >= 0 && takenBy !== playerIndex;
  var cls = 'setup-faction-card';
  if (selected) cls += ' setup-selected';
  if (taken) cls += ' setup-taken';
  var html = '<button class="' + cls + '" data-faction="' + factionKey + '" data-player="' + playerIndex + '"';
  if (taken) html += ' disabled';
  html += '>';
  html += '<span class="setup-fdot" style="background:' + f.color + '"></span>';
  html += '<span class="setup-fname">' + f.name + '</span>';
  if (selected) html += '<span class="setup-check">\u2713</span>';
  if (taken) html += '<span class="setup-taken-label">Taken</span>';
  html += '<span class="setup-fpassive">' + info.passive + '</span>';
  html += '</button>';
  return html;
}

// Builds HTML for one player slot with all faction options
function buildPlayerSlot(playerIndex) {
  var sel = setupState.selections[playerIndex];
  var html = '<div class="setup-slot">';
  html += '<div class="setup-slot-header">Player ' + (playerIndex + 1) + '</div>';
  html += '<div class="setup-faction-row">';
  var keys = ['ember', 'tide', 'stone', 'gale'];
  for (var i = 0; i < keys.length; i++) {
    html += buildFactionOption(keys[i], playerIndex);
  }
  html += '</div></div>';
  return html;
}

// Renders the full setup screen into the container
function renderSetupScreen() {
  var el = document.getElementById('setupScreen');
  if (!el) return;
  var complete = isSetupComplete();
  var html = '<div class="setup-inner">';
  html += '<div class="setup-title">Elemental Conquest</div>';
  html += '<div class="setup-subtitle">Choose your factions</div>';
  html += buildCountSelector();
  html += '<div class="setup-slots">';
  for (var i = 0; i < setupState.playerCount; i++) {
    html += buildPlayerSlot(i);
  }
  html += '</div>';
  html += '<button class="setup-begin" id="setupBegin"' + (complete ? '' : ' disabled') + '>';
  html += buildBeginLabel() + '</button>';
  html += '</div>';
  el.innerHTML = html;
}

// Hides the setup screen and starts the game
function beginGame() {
  if (!isSetupComplete()) return;
  setupState.active = false;
  var el = document.getElementById('setupScreen');
  if (el) el.classList.add('hidden');
}

// Returns the selected factions array for initGame
function getSelectedFactions() {
  return setupState.selections.slice();
}

// Shows the setup screen again (for New Game)
function showSetupScreen() {
  setupState.active = true;
  setupState.selections = [];
  for (var i = 0; i < setupState.playerCount; i++) {
    setupState.selections.push(null);
  }
  var el = document.getElementById('setupScreen');
  if (el) el.classList.remove('hidden');
  renderSetupScreen();
}