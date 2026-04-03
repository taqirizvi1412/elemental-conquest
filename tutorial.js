// tutorial.js — step-by-step in-game tutorial (state + rendering)

// Tutorial state — independent of game state
const tutorialState = {
  active: false,
  step: 0,
  totalSteps: 12
};

// Returns the 12 tutorial step definitions
function getTutorialSteps() {
  return [
    { title: 'Welcome', body: 'Elemental Conquest is a turn-based strategy game for 2\u20134 players. Each player controls a faction fighting to dominate the world. Pass the screen between turns.', highlight: null, arrowDir: null, position: 'center' },
    { title: 'The Map', body: 'This is your world \u2014 a 16\u00d716 grid of terrain tiles. Each terrain type provides different resources and affects movement. Your capital is in the corner.', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' },
    { title: 'Your Faction', body: 'You are playing as the current faction. Each faction has a unique passive ability and a special resource only they can harvest. Learn your strengths.', highlight: '#resourceInfo', arrowDir: 'right', position: 'left' },
    { title: 'Essence', body: 'Essence (E) is your main currency. You earn 1 per turn for each tile you own. Spend it on units and shared technologies. You start with 2.', highlight: '#resourceInfo', arrowDir: 'right', position: 'left' },
    { title: 'Unique Resource', body: 'Your faction also earns a unique resource from specific terrain tiles. This unlocks your faction\u2019s exclusive tech branch \u2014 abilities no other faction has.', highlight: '#resourceInfo', arrowDir: 'right', position: 'left' },
    { title: 'Selecting a Unit', body: 'Click your warrior on the map to select it. Valid move tiles will highlight in white. Enemy tiles highlight in red \u2014 you can attack them directly.', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' },
    { title: 'Moving', body: 'Click a highlighted white tile to move your unit there. Units have limited movement per turn \u2014 Warriors move 1 tile. You can move then attack in the same turn.', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' },
    { title: 'Combat', body: 'Move onto an enemy tile to attack. Damage is calculated from Attack vs Defense stats. Weaker units should avoid stronger enemies. Destroyed units are removed immediately.', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' },
    { title: 'Claiming Tiles', body: 'Any tile your unit moves onto becomes owned by your faction. Owned tiles earn you Essence each turn. Expand aggressively early \u2014 more tiles means more income.', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' },
    { title: 'The Tech Tree', body: 'Click \u201cTech Tree\u201d to research upgrades. Shared techs unlock new unit types for everyone. Faction techs use your unique resource and give exclusive advantages.', highlight: '#btnTech', arrowDir: 'right', position: 'left' },
    { title: 'Recruiting Units', body: 'Click your empty capital tile to recruit new units. Different unit types have different stats and costs. Unlock more unit types through the tech tree.', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' },
    { title: 'Win Conditions', body: 'Two ways to win: hold the central Altar tile (the glowing diamond) for 3 consecutive turns, OR destroy all enemy capitals. Now end your turn and pass the screen!', highlight: '#gameCanvas', arrowDir: 'left', position: 'right' }
  ];
}

// Activates the tutorial from step 0
function startTutorial() {
  tutorialState.active = true;
  tutorialState.step = 0;
  renderTutorialOverlay();
}

// Advances to the next step or finishes the tutorial
function nextTutorialStep() {
  tutorialState.step += 1;
  if (tutorialState.step >= tutorialState.totalSteps) {
    finishTutorial();
    return;
  }
  renderTutorialOverlay();
}

// Deactivates the tutorial and cleans up DOM
function skipTutorial() {
  finishTutorial();
}

// Marks tutorial complete, removes overlay, sets localStorage
function finishTutorial() {
  tutorialState.active = false;
  tutorialState.step = 0;
  removeTutorialOverlay();
  try { localStorage.setItem('tutorialSeen', '1'); } catch (e) {}
}

// Returns true if tutorial is currently active
function isTutorialActive() {
  return tutorialState.active;
}

// Returns the current step definition object
function getCurrentTutorialStep() {
  return getTutorialSteps()[tutorialState.step] || null;
}

// ---- Rendering ----

// Creates or updates the full tutorial overlay DOM
function renderTutorialOverlay() {
  removeTutorialOverlay();
  const step = getCurrentTutorialStep();
  if (!step) return;
  const container = document.createElement('div');
  container.id = 'tutorialContainer';
  if (step.highlight) {
    container.appendChild(createSpotlight(step.highlight));
  } else {
    container.appendChild(createBackdrop());
  }
  container.appendChild(createTooltip(step));
  document.body.appendChild(container);
}

// Removes the tutorial overlay from the DOM
function removeTutorialOverlay() {
  const el = document.getElementById('tutorialContainer');
  if (el) el.remove();
}

// Creates the fullscreen dim backdrop for welcome step
function createBackdrop() {
  const el = document.createElement('div');
  el.className = 'tutorial-backdrop';
  return el;
}

// Creates a spotlight element around the highlighted element
function createSpotlight(selector) {
  const target = document.querySelector(selector);
  const el = document.createElement('div');
  el.className = 'tutorial-spotlight';
  if (!target) return el;
  const rect = target.getBoundingClientRect();
  el.style.left = (rect.left - 6) + 'px';
  el.style.top = (rect.top - 6) + 'px';
  el.style.width = (rect.width + 12) + 'px';
  el.style.height = (rect.height + 12) + 'px';
  return el;
}

// Builds the tooltip HTML content
function buildTooltipHTML(step) {
  const num = tutorialState.step + 1;
  const total = tutorialState.totalSteps;
  let html = '<h3>' + step.title + '</h3>';
  html += '<p>' + step.body + '</p>';
  html += '<div class="tutorial-step-counter">Step ' + num + ' of ' + total + '</div>';
  html += '<div class="tutorial-actions">';
  html += '<button class="tutorial-next" id="tutNext">';
  html += (num < total ? 'Next' : 'Got it!') + '</button>';
  html += '<button class="tutorial-skip" id="tutSkip">Skip tutorial</button>';
  html += '</div>';
  return html;
}

// Creates and positions the tooltip element
function createTooltip(step) {
  const el = document.createElement('div');
  el.className = 'tutorial-tooltip';
  if (step.arrowDir) el.classList.add('tutorial-arrow-' + step.arrowDir);
  el.innerHTML = buildTooltipHTML(step);
  positionTooltip(el, step);
  el.querySelector('#tutNext').addEventListener('click', nextTutorialStep);
  el.querySelector('#tutSkip').addEventListener('click', skipTutorial);
  return el;
}

// Positions the tooltip relative to the highlighted element
function positionTooltip(el, step) {
  if (!step.highlight || step.position === 'center') {
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    return;
  }
  requestAnimationFrame(function() {
    positionTooltipDeferred(el, step);
  });
}

// Deferred positioning after element is in DOM for measurement
function positionTooltipDeferred(el, step) {
  const target = document.querySelector(step.highlight);
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const tw = el.offsetWidth || 300;
  const th = el.offsetHeight || 200;
  var top = 0, left = 0;
  if (step.position === 'right') {
    left = rect.right + 16;
    top = rect.top + rect.height / 2 - th / 2;
  } else if (step.position === 'left') {
    left = rect.left - tw - 16;
    top = rect.top + rect.height / 2 - th / 2;
  }
  top = clampValue(top, 8, window.innerHeight - th - 8);
  left = clampValue(left, 8, window.innerWidth - tw - 8);
  el.style.top = top + 'px';
  el.style.left = left + 'px';
  el.style.transform = 'none';
}

// Clamps a number between min and max
function clampValue(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

// Returns true if tutorial has been seen before
function hasTutorialBeenSeen() {
  try { return localStorage.getItem('tutorialSeen') === '1'; } catch (e) { return false; }
}