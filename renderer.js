// renderer.js — pixel art canvas drawing (pure functions, no state)

let TILE_SIZE = 40;
let CANVAS_SIZE = 640;
let MAP_OFFSET_X = 0;
let MAP_OFFSET_Y = 0;
let altarGlowPhase = 0;

// Updates the dynamic tile size and canvas size
function setRenderSize(tileSize, canvasW, canvasH, offX, offY) {
  TILE_SIZE = tileSize;
  CANVAS_SIZE = Math.max(canvasW, canvasH);
  MAP_OFFSET_X = offX;
  MAP_OFFSET_Y = offY;
}

// Returns the faction colour for owned tiles and capitals
function getFactionColor(owner) {
  const c = { ember:'#E8593C', tide:'#3B8BD4', stone:'#888780', gale:'#9FE1CB' };
  return c[owner] || null;
}

// ---- TERRAIN TILES ----

// Draws a plains tile with grass tufts
function drawPlainsTile(ctx, x, y, s) {
  const p = s / 40;
  ctx.fillStyle = '#5a7a32';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#6a8a3a';
  ctx.fillRect(x, y, s, 5*p);
  ctx.fillStyle = '#4a6a28';
  ctx.fillRect(x, y + 35*p, s, 5*p);
  ctx.fillRect(x + 5*p, y + 8*p, 4*p, 6*p);
  ctx.fillRect(x + 18*p, y + 9*p, 4*p, 5*p);
  ctx.fillRect(x + 29*p, y + 10*p, 4*p, 4*p);
  ctx.fillRect(x + 3*p, y + 22*p, 3*p, 4*p);
  ctx.fillRect(x + 25*p, y + 24*p, 3*p, 5*p);
  ctx.fillRect(x + 34*p, y + 25*p, 3*p, 4*p);
  ctx.fillStyle = '#7aaa40';
  ctx.fillRect(x + 7*p, y + 5*p, 2*p, 4*p);
  ctx.fillRect(x + 20*p, y + 6*p, 2*p, 4*p);
  ctx.fillRect(x + 31*p, y + 7*p, 2*p, 3*p);
  ctx.fillRect(x + 4*p, y + 19*p, 2*p, 3*p);
  ctx.fillRect(x + 27*p, y + 21*p, 2*p, 4*p);
  ctx.fillRect(x + 36*p, y + 22*p, 2*p, 3*p);
}

// Draws a forest tile with pixel trees
function drawForestTile(ctx, x, y, s) {
  const p = s / 40;
  ctx.fillStyle = '#2a4a18';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#1e3612';
  ctx.fillRect(x, y + 30*p, s, 10*p);
  drawPixelTree(ctx, x + 4*p, y + 4*p, p);
  drawPixelTree(ctx, x + 16*p, y + 7*p, p * 0.8);
  drawPixelTree(ctx, x + 28*p, y + 10*p, p * 0.7);
}

// Draws one pixel tree as stepped rects (trunk + canopy)
function drawPixelTree(ctx, x, y, p) {
  ctx.fillStyle = '#1e3612';
  ctx.fillRect(x + 4*p, y + 12*p, 4*p, 14*p);
  ctx.fillStyle = '#4a8a2a';
  ctx.fillRect(x + 1*p, y + 4*p, 10*p, 4*p);
  ctx.fillRect(x + 2*p, y + 8*p, 8*p, 4*p);
  ctx.fillStyle = '#3a6a22';
  ctx.fillRect(x + 0*p, y + 8*p, 12*p, 4*p);
  ctx.fillRect(x + 1*p, y + 12*p, 10*p, 3*p);
  ctx.fillStyle = '#4a8a2a';
  ctx.fillRect(x + 3*p, y + 1*p, 6*p, 4*p);
  ctx.fillRect(x + 4*p, y, 4*p, 2*p);
}

// Draws a mountain tile with peaks and snow caps
function drawMountainTile(ctx, x, y, s) {
  const p = s / 40;
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(x, y + 30*p, s, 10*p);
  drawPixelPeak(ctx, x + 3*p, y, p, 14, 30, '#7a726a');
  drawPixelPeak(ctx, x + 12*p, y, p, 16, 26, '#6a6258');
  drawPixelPeak(ctx, x + 24*p, y, p, 12, 28, '#7a726a');
  ctx.fillStyle = '#d8d0c8';
  ctx.fillRect(x + 15*p, y + 9*p, 10*p, 3*p);
  ctx.fillRect(x + 6*p, y + 12*p, 6*p, 2*p);
  ctx.fillRect(x + 27*p, y + 11*p, 5*p, 2*p);
}

// Draws a single stepped mountain peak
function drawPixelPeak(ctx, x, y, p, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 2*p, y + (h-8)*p, (w-4)*p, 8*p);
  ctx.fillRect(x + 4*p, y + (h-14)*p, (w-8)*p, 6*p);
  ctx.fillRect(x + 5*p, y + (h-18)*p, (w-10)*p, 4*p);
}

// Draws a water tile with wave strips and highlight flecks
function drawWaterTile(ctx, x, y, s) {
  const p = s / 40;
  ctx.fillStyle = '#1a6a9a';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#2a7aaa';
  ctx.fillRect(x, y + 7*p, s, 3*p);
  ctx.fillRect(x, y + 25*p, s, 3*p);
  ctx.fillStyle = '#0a4a7a';
  ctx.fillRect(x, y + 16*p, s, 3*p);
  ctx.fillRect(x, y + 33*p, s, 3*p);
  ctx.fillStyle = '#5aaacc';
  ctx.fillRect(x + 3*p, y + 9*p, 10*p, 1*p);
  ctx.fillRect(x + 20*p, y + 18*p, 12*p, 1*p);
  ctx.fillRect(x + 6*p, y + 27*p, 9*p, 1*p);
  ctx.fillRect(x + 25*p, y + 35*p, 11*p, 1*p);
}

// Draws a desert tile with sand ripples and pixel cacti
function drawDesertTile(ctx, x, y, s) {
  const p = s / 40;
  ctx.fillStyle = '#c4924a';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#b4823a';
  ctx.fillRect(x, y + 10*p, s, 2*p);
  ctx.fillRect(x, y + 32*p, s, 2*p);
  ctx.fillStyle = '#d4a25a';
  ctx.fillRect(x, y + 22*p, s, 2*p);
  drawPixelCactus(ctx, x + 5*p, y + 12*p, p);
  drawPixelCactus(ctx, x + 28*p, y + 15*p, p);
  ctx.fillStyle = '#a4723a';
  ctx.fillRect(x + 15*p, y + 25*p, 10*p, 4*p);
  ctx.fillStyle = '#d4aa6a';
  ctx.fillRect(x + 17*p, y + 27*p, 5*p, 2*p);
}

// Draws a single pixel cactus (stem + arms)
function drawPixelCactus(ctx, x, y, p) {
  ctx.fillStyle = '#9a6a28';
  ctx.fillRect(x + 1*p, y, 2*p, 10*p);
  ctx.fillStyle = '#7a9a40';
  ctx.fillRect(x + 3*p, y - 2*p, 1*p, 3*p);
  ctx.fillRect(x + 3*p, y + 1*p, 2*p, 1*p);
  ctx.fillRect(x, y + 3*p, 1*p, 3*p);
  ctx.fillRect(x - 1*p, y + 2*p, 2*p, 1*p);
}

// Draws the altar tile with animated golden pulse
function drawAltarTile(ctx, x, y, s) {
  const p = s / 40;
  ctx.fillStyle = '#5a4a2a';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#4a3a1a';
  ctx.fillRect(x + 2*p, y + 2*p, 36*p, 36*p);
  drawAltarDiamond(ctx, x, y, p);
  const pulse = 0.2 + 0.3 * Math.abs(Math.sin(altarGlowPhase));
  ctx.fillStyle = 'rgba(240, 208, 96, ' + pulse + ')';
  ctx.fillRect(x + 4*p, y + 4*p, 32*p, 32*p);
}

// Draws the nested diamond shape at altar center
function drawAltarDiamond(ctx, x, y, p) {
  ctx.fillStyle = '#2a2010';
  drawDiamondRects(ctx, x, y, p, 20, 5);
  ctx.fillStyle = '#8a7a3a';
  drawDiamondRects(ctx, x, y, p, 16, 8);
  ctx.fillStyle = '#c4a84a';
  drawDiamondRects(ctx, x, y, p, 12, 11);
  ctx.fillStyle = '#f0d060';
  drawDiamondRects(ctx, x, y, p, 6, 14);
  ctx.fillStyle = '#fff8c0';
  ctx.fillRect(x + 18*p, y + 18*p, 4*p, 4*p);
}

// Draws a diamond approximation as 3 horizontal rects
function drawDiamondRects(ctx, x, y, p, size, off) {
  const h = Math.floor(size / 3);
  ctx.fillRect(x + (20 - size/4)*p, y + off*p, (size/2)*p, h*p);
  ctx.fillRect(x + (20 - size/2)*p, y + (off + h)*p, size*p, h*p);
  ctx.fillRect(x + (20 - size/4)*p, y + (off + h*2)*p, (size/2)*p, h*p);
}

// Dispatches to the correct terrain draw function
function drawTile(ctx, tile, x, y) {
  const px = x * TILE_SIZE + MAP_OFFSET_X;
  const py = y * TILE_SIZE + MAP_OFFSET_Y;
  const s = TILE_SIZE;
  const fn = { plains: drawPlainsTile, forest: drawForestTile, mountain: drawMountainTile, water: drawWaterTile, desert: drawDesertTile };
  if (tile.altar) { drawAltarTile(ctx, px, py, s); return; }
  if (fn[tile.type]) fn[tile.type](ctx, px, py, s);
  else { ctx.fillStyle = '#555'; ctx.fillRect(px, py, s, s); }
}

// ---- OWNERSHIP ----

// Draws a faction ownership border using fillRect (no strokeRect)
function drawOwnership(ctx, tile, x, y) {
  if (!tile.owner) return;
  const px = x * TILE_SIZE + MAP_OFFSET_X, py = y * TILE_SIZE + MAP_OFFSET_Y, s = TILE_SIZE;
  ctx.fillStyle = getFactionColor(tile.owner);
  ctx.fillRect(px, py, s, 2);
  ctx.fillRect(px, py + s - 2, s, 2);
  ctx.fillRect(px, py, 2, s);
  ctx.fillRect(px + s - 2, py, 2, s);
}

// ---- RESOURCE ICONS ----

// Draws a pixel resource icon at tile top-right corner
function drawResourceIcon(ctx, tile, x, y) {
  if (!tile.resource) return;
  const px = x * TILE_SIZE + MAP_OFFSET_X + TILE_SIZE - 9;
  const py = y * TILE_SIZE + MAP_OFFSET_Y + 1;
  const fn = { cinders: drawCindersIcon, flow: drawFlowIcon, ore: drawOreIcon, drift: drawDriftIcon };
  if (fn[tile.resource]) fn[tile.resource](ctx, px, py);
}

// Draws cinders icon — flame shape in orange/yellow
function drawCindersIcon(ctx, x, y) {
  ctx.fillStyle = '#c03010';
  ctx.fillRect(x + 1, y + 4, 3, 4);
  ctx.fillRect(x + 4, y + 3, 3, 4);
  ctx.fillStyle = '#ff7030';
  ctx.fillRect(x + 2, y + 2, 2, 3);
  ctx.fillRect(x + 5, y + 1, 2, 3);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x + 3, y, 2, 3);
}

// Draws flow icon — wave lines in blue
function drawFlowIcon(ctx, x, y) {
  ctx.fillStyle = '#1a6aaa';
  ctx.fillRect(x, y + 1, 7, 2);
  ctx.fillStyle = '#2a8acc';
  ctx.fillRect(x + 1, y + 4, 6, 2);
  ctx.fillStyle = '#5abae8';
  ctx.fillRect(x, y + 7, 7, 1);
}

// Draws ore icon — rock cluster in grey
function drawOreIcon(ctx, x, y) {
  ctx.fillStyle = '#7a726a';
  ctx.fillRect(x, y + 3, 4, 4);
  ctx.fillStyle = '#9a9288';
  ctx.fillRect(x + 3, y + 1, 4, 4);
  ctx.fillStyle = '#aaa298';
  ctx.fillRect(x + 2, y + 5, 5, 3);
  ctx.fillStyle = '#c8c0b0';
  ctx.fillRect(x + 4, y + 2, 2, 2);
}

// Draws drift icon — wind lines in teal
function drawDriftIcon(ctx, x, y) {
  ctx.fillStyle = '#3a8a6a';
  ctx.fillRect(x, y + 1, 7, 1);
  ctx.fillRect(x, y + 5, 7, 1);
  ctx.fillStyle = '#4aaa88';
  ctx.fillRect(x + 1, y + 3, 6, 1);
  ctx.fillStyle = '#5abaa0';
  ctx.fillRect(x + 2, y + 7, 4, 1);
}

// ---- CAPITAL MARKER ----

// Draws a pixel-art capital flag marker
function drawCapital(ctx, tile, x, y) {
  const px = x * TILE_SIZE + MAP_OFFSET_X, py = y * TILE_SIZE + MAP_OFFSET_Y;
  const p = TILE_SIZE / 40;
  const c = getFactionColor(tile.owner) || '#fff';
  ctx.fillStyle = '#3a3020';
  ctx.fillRect(px + 18*p, py + 10*p, 2*p, 22*p);
  ctx.fillStyle = c;
  ctx.fillRect(px + 20*p, py + 10*p, 12*p, 8*p);
  ctx.fillRect(px + 20*p, py + 14*p, 10*p, 4*p);
}


// ---- UNIT SPRITES ----

// Returns [primary, secondary] armor colors for a faction
function getFactionColors(faction) {
  var c = { ember:['#c03a10','#e04a18'], tide:['#1a6aaa','#2a8acc'], stone:['#6a6258','#7a726a'], gale:['#2a6a52','#3a8a6a'] };
  return c[faction] || ['#888','#999'];
}

// Sprite dispatch table mapping unit type to draw function
var UNIT_SPRITES = {
  warrior: drawWarriorSprite, rider: drawRiderSprite, knight: drawKnightSprite,
  explorer: drawExplorerSprite, miner: drawMinerSprite, boat: drawBoatSprite,
  firebrand: drawFirebrandSprite, ashwalker: drawAshwalkerSprite, pyreling: drawPyrelingSprite,
  diver: drawDiverSprite, tidecaller: drawTidecallerSprite, maelstrom: drawMaelstromSprite,
  guardian: drawGuardianSprite, delver: drawDelverSprite, colossus: drawColossusSprite,
  skyrider: drawSkyriderSprite, drifter: drawDrifterSprite, stormcaller: drawStormcallerSprite
};

// Routes to the correct sprite function based on unit type
function drawUnit(ctx, unit, x, y) {
  var px = x * TILE_SIZE + MAP_OFFSET_X, py = y * TILE_SIZE + MAP_OFFSET_Y;
  var p = TILE_SIZE / 40;
  var fn = UNIT_SPRITES[unit.type];
  if (fn) fn(ctx, unit.faction, px, py, p);
  drawFactionBorder(ctx, unit.faction, px, py);
  drawUnitHpBar(ctx, unit, x, y);
}

// Draws a thin faction-colored border around the unit tile
function drawFactionBorder(ctx, faction, px, py) {
  var s = TILE_SIZE;
  ctx.fillStyle = getFactionColor(faction) || '#888';
  ctx.fillRect(px, py, s, 1);
  ctx.fillRect(px, py+s-1, s, 1);
  ctx.fillRect(px, py, 1, s);
  ctx.fillRect(px+s-1, py, 1, s);
}

// ---- SHARED UNIT SPRITES (use faction colors for armor) ----

// Draws a standard warrior in faction colors
function drawWarriorSprite(ctx, faction, x, y, p) {
  var c = getFactionColors(faction);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+14*p,y+4*p,12*p,10*p);
  ctx.fillRect(x+15*p,y+13*p,10*p,14*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+12*p,y+6*p,16*p,8*p);
  ctx.fillRect(x+13*p,y+15*p,14*p,10*p);
  ctx.fillStyle = '#ffcc88';
  ctx.fillRect(x+16*p,y+8*p,3*p,3*p);
  ctx.fillRect(x+22*p,y+8*p,3*p,3*p);
  ctx.fillRect(x+8*p,y+14*p,5*p,8*p);
  ctx.fillRect(x+27*p,y+14*p,5*p,8*p);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(x+4*p,y+13*p,5*p,2*p);
  ctx.fillRect(x+4*p,y+11*p,2*p,12*p);
  drawWarriorLegs(ctx, c, x, y, p);
}

// Draws warrior legs
function drawWarriorLegs(ctx, c, x, y, p) {
  ctx.fillStyle = c[0];
  ctx.fillRect(x+14*p,y+26*p,5*p,12*p);
  ctx.fillRect(x+21*p,y+26*p,5*p,12*p);
  ctx.fillStyle = '#555';
  ctx.fillRect(x+13*p,y+36*p,6*p,4*p);
  ctx.fillRect(x+21*p,y+36*p,6*p,4*p);
}

// Draws a mounted rider — horse body + armored rider on top
function drawRiderSprite(ctx, faction, x, y, p) {
  var c = getFactionColors(faction);
  ctx.fillStyle = '#9B7924';
  ctx.fillRect(x+4*p,y+24*p,32*p,6*p);
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(x+6*p,y+26*p,28*p,12*p);
  drawRiderHorseLegs(ctx, x, y, p);
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(x+30*p,y+20*p,6*p,10*p);
  ctx.fillRect(x+28*p,y+14*p,10*p,8*p);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+14*p,y+12*p,10*p,8*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+15*p,y+8*p,8*p,6*p);
  ctx.fillRect(x+16*p,y+5*p,6*p,5*p);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(x+2*p,y+13*p,10*p,2*p);
}

// Draws rider horse legs
function drawRiderHorseLegs(ctx, x, y, p) {
  ctx.fillStyle = '#7a5a10';
  ctx.fillRect(x+2*p,y+30*p,6*p,10*p);
  ctx.fillRect(x+10*p,y+36*p,6*p,8*p);
  ctx.fillRect(x+22*p,y+36*p,6*p,8*p);
  ctx.fillRect(x+30*p,y+30*p,6*p,10*p);
}

// Draws heavy knight in full plate armor
function drawKnightSprite(ctx, faction, x, y, p) {
  var c = getFactionColors(faction);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+10*p,y+14*p,20*p,18*p);
  ctx.fillRect(x+12*p,y+4*p,16*p,12*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+8*p,y+16*p,24*p,14*p);
  ctx.fillRect(x+10*p,y+6*p,20*p,8*p);
  ctx.fillStyle = '#3a3230';
  ctx.fillRect(x+14*p,y+8*p,12*p,4*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+4*p,y+14*p,8*p,6*p);
  ctx.fillRect(x+28*p,y+14*p,8*p,6*p);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+4*p,y+18*p,6*p,10*p);
  ctx.fillRect(x+30*p,y+18*p,6*p,10*p);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(x+32*p,y+4*p,4*p,20*p);
  ctx.fillRect(x+30*p,y+14*p,8*p,3*p);
  drawKnightLegs(ctx, c, x, y, p);
}

// Draws knight wide legs
function drawKnightLegs(ctx, c, x, y, p) {
  ctx.fillStyle = c[0];
  ctx.fillRect(x+11*p,y+30*p,8*p,12*p);
  ctx.fillRect(x+21*p,y+30*p,8*p,12*p);
}

// Draws explorer with wide-brim hat and walking stick
function drawExplorerSprite(ctx, faction, x, y, p) {
  var c = getFactionColors(faction);
  ctx.fillStyle = '#6B4A10';
  ctx.fillRect(x+8*p,y+6*p,24*p,4*p);
  ctx.fillStyle = '#7B5A20';
  ctx.fillRect(x+12*p,y+2*p,16*p,8*p);
  ctx.fillStyle = '#d4956a';
  ctx.fillRect(x+14*p,y+8*p,12*p,8*p);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x+16*p,y+10*p,3*p,3*p);
  ctx.fillRect(x+22*p,y+10*p,3*p,3*p);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+14*p,y+14*p,12*p,16*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+10*p,y+18*p,4*p,8*p);
  ctx.fillStyle = '#8B6A30';
  ctx.fillRect(x+28*p,y+8*p,3*p,28*p);
  drawExplorerLegs(ctx, x, y, p);
}

// Draws explorer legs
function drawExplorerLegs(ctx, x, y, p) {
  ctx.fillStyle = '#6B4A10';
  ctx.fillRect(x+14*p,y+28*p,5*p,14*p);
  ctx.fillRect(x+21*p,y+28*p,5*p,14*p);
  ctx.fillStyle = '#4a3010';
  ctx.fillRect(x+13*p,y+40*p,7*p,4*p);
  ctx.fillRect(x+20*p,y+40*p,7*p,4*p);
}

// Draws miner with hard hat, lamp, and pickaxe
function drawMinerSprite(ctx, faction, x, y, p) {
  var c = getFactionColors(faction);
  ctx.fillStyle = '#EFA820';
  ctx.fillRect(x+12*p,y+4*p,16*p,8*p);
  ctx.fillStyle = '#CF8810';
  ctx.fillRect(x+10*p,y+8*p,20*p,4*p);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x+18*p,y+2*p,6*p,4*p);
  ctx.fillStyle = '#ffff88';
  ctx.fillRect(x+19*p,y+1*p,4*p,3*p);
  ctx.fillStyle = '#d4956a';
  ctx.fillRect(x+14*p,y+10*p,12*p,6*p);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+12*p,y+14*p,16*p,18*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+10*p,y+16*p,20*p,14*p);
  ctx.fillStyle = '#8B6A30';
  ctx.fillRect(x+26*p,y+10*p,3*p,24*p);
  ctx.fillStyle = '#888';
  ctx.fillRect(x+22*p,y+8*p,10*p,4*p);
  drawMinerLegs(ctx, c, x, y, p);
}

// Draws miner legs
function drawMinerLegs(ctx, c, x, y, p) {
  ctx.fillStyle = c[0];
  ctx.fillRect(x+12*p,y+30*p,6*p,12*p);
  ctx.fillRect(x+22*p,y+30*p,6*p,12*p);
}

// Draws a sailboat — not humanoid, uses hull+sail+flag
function drawBoatSprite(ctx, faction, x, y, p) {
  var c = getFactionColors(faction);
  ctx.fillStyle = '#1a5a8a';
  ctx.fillRect(x,y+32*p,40*p,8*p);
  ctx.fillStyle = '#2a7aaa';
  ctx.fillRect(x,y+30*p,40*p,4*p);
  ctx.fillStyle = c[0];
  ctx.fillRect(x+4*p,y+26*p,32*p,8*p);
  ctx.fillStyle = '#8B6A30';
  ctx.fillRect(x+18*p,y+6*p,4*p,22*p);
  ctx.fillStyle = '#e8dcc8';
  ctx.fillRect(x+8*p,y+6*p,12*p,16*p);
  ctx.fillStyle = c[1];
  ctx.fillRect(x+8*p,y+8*p,10*p,2*p);
  ctx.fillRect(x+8*p,y+14*p,8*p,2*p);
  ctx.fillStyle = '#cc3322';
  ctx.fillRect(x+22*p,y+4*p,8*p,5*p);
}

// ---- EMBER EXCLUSIVE SPRITES ----

// Draws firebrand body — hooded figure with fire cloak
function drawFirebrandSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#8a1a04';
  ctx.fillRect(x+10*p,y+14*p,20*p,20*p);
  ctx.fillStyle = '#aa2a08';
  ctx.fillRect(x+8*p,y+16*p,24*p,18*p);
  ctx.fillStyle = '#e84818';
  ctx.fillRect(x+8*p,y+30*p,4*p,6*p);
  ctx.fillRect(x+16*p,y+30*p,4*p,8*p);
  ctx.fillRect(x+24*p,y+30*p,4*p,6*p);
  ctx.fillStyle = '#ff7030';
  ctx.fillRect(x+12*p,y+32*p,4*p,4*p);
  ctx.fillRect(x+28*p,y+32*p,4*p,4*p);
  drawFirebrandHead(ctx, x, y, p);
  drawFirebrandStaff(ctx, x, y, p);
}

// Draws firebrand hooded head with fire crown
function drawFirebrandHead(ctx, x, y, p) {
  ctx.fillStyle = '#8a1a04';
  ctx.fillRect(x+12*p,y+4*p,16*p,12*p);
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(x+14*p,y+6*p,12*p,8*p);
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(x+16*p,y+8*p,8*p,4*p);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x+17*p,y+9*p,3*p,2*p);
  ctx.fillRect(x+21*p,y+9*p,3*p,2*p);
  ctx.fillStyle = '#e84818';
  ctx.fillRect(x+14*p,y,4*p,6*p);
  ctx.fillRect(x+20*p,y,4*p,5*p);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x+16*p,y,3*p,3*p);
  ctx.fillRect(x+22*p,y,3*p,3*p);
}

// Draws firebrand fire staff
function drawFirebrandStaff(ctx, x, y, p) {
  ctx.fillStyle = '#3a1a08';
  ctx.fillRect(x+28*p,y+4*p,3*p,26*p);
  ctx.fillStyle = '#e84818';
  ctx.fillRect(x+26*p,y+2*p,6*p,4*p);
  ctx.fillStyle = '#ff9020';
  ctx.fillRect(x+27*p,y,5*p,3*p);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x+28*p,y,4*p,2*p);
}

// Draws ashwalker — wide body, face mask, tower shield
function drawAshwalkerSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(x+10*p,y+14*p,20*p,20*p);
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(x+8*p,y+16*p,24*p,18*p);
  ctx.fillStyle = '#888';
  ctx.fillRect(x+6*p,y+18*p,2*p,2*p);
  ctx.fillRect(x+32*p,y+22*p,2*p,2*p);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x+12*p,y+4*p,16*p,12*p);
  ctx.fillStyle = '#4a3a28';
  ctx.fillRect(x+14*p,y+6*p,12*p,8*p);
  ctx.fillStyle = '#cc4400';
  ctx.fillRect(x+15*p,y+7*p,4*p,3*p);
  ctx.fillRect(x+22*p,y+7*p,4*p,3*p);
  ctx.fillStyle = '#222';
  ctx.fillRect(x+14*p,y+12*p,12*p,2*p);
  drawAshwalkerShield(ctx, x, y, p);
}

// Draws ashwalker shield and legs
function drawAshwalkerShield(ctx, x, y, p) {
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(x+4*p,y+14*p,8*p,12*p);
  ctx.fillStyle = '#cc4400';
  ctx.fillRect(x+7*p,y+16*p,2*p,8*p);
  ctx.fillRect(x+5*p,y+19*p,6*p,2*p);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x+11*p,y+32*p,7*p,12*p);
  ctx.fillRect(x+22*p,y+32*p,7*p,12*p);
}

// Draws pyreling — slim demon with wings, horns, tail
function drawPyrelingSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#cc2200';
  ctx.fillRect(x+14*p,y+14*p,12*p,18*p);
  ctx.fillStyle = '#e83310';
  ctx.fillRect(x+12*p,y+16*p,16*p,14*p);
  ctx.fillStyle = '#aa1a00';
  ctx.fillRect(x+2*p,y+10*p,10*p,16*p);
  ctx.fillRect(x+28*p,y+10*p,10*p,16*p);
  ctx.fillStyle = '#cc2200';
  ctx.fillRect(x+13*p,y+4*p,14*p,12*p);
  ctx.fillStyle = '#ff4422';
  ctx.fillRect(x+13*p,y+2*p,4*p,6*p);
  ctx.fillRect(x+24*p,y+2*p,4*p,6*p);
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(x+15*p,y+8*p,4*p,3*p);
  ctx.fillRect(x+22*p,y+8*p,4*p,3*p);
  ctx.fillStyle = '#cc2200';
  ctx.fillRect(x+20*p,y+30*p,3*p,8*p);
  ctx.fillStyle = '#ff4422';
  ctx.fillRect(x+22*p,y+36*p,4*p,4*p);
}

// ---- TIDE EXCLUSIVE SPRITES ----

// Draws diver — round helmet, tanks, flippers, harpoon
function drawDiverSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#0a3a6a';
  ctx.fillRect(x+13*p,y+14*p,14*p,18*p);
  ctx.fillStyle = '#1a5a9a';
  ctx.fillRect(x+11*p,y+16*p,18*p,14*p);
  ctx.fillStyle = '#1a5a9a';
  ctx.fillRect(x+11*p,y+3*p,18*p,14*p);
  ctx.fillStyle = '#2a6aaa';
  ctx.fillRect(x+13*p,y+2*p,14*p,14*p);
  ctx.fillStyle = '#0a2a4a';
  ctx.fillRect(x+14*p,y+5*p,12*p,8*p);
  ctx.fillStyle = '#5aaaff';
  ctx.fillRect(x+16*p,y+7*p,4*p,4*p);
  ctx.fillStyle = '#0a3a6a';
  ctx.fillRect(x+27*p,y+10*p,5*p,14*p);
  ctx.fillRect(x+8*p,y+38*p,12*p,5*p);
  ctx.fillRect(x+20*p,y+38*p,12*p,5*p);
  ctx.fillStyle = '#aaa';
  ctx.fillRect(x+3*p,y+18*p,10*p,2*p);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(x+2*p,y+17*p,3*p,4*p);
}

// Draws tidecaller — robes with waves, coral crown, glowing orb
function drawTidecallerSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#0a4a7a';
  ctx.fillRect(x+10*p,y+14*p,20*p,24*p);
  ctx.fillStyle = '#1a6aaa';
  ctx.fillRect(x+8*p,y+18*p,24*p,20*p);
  ctx.fillStyle = '#3a9add';
  ctx.fillRect(x+10*p,y+22*p,20*p,2*p);
  ctx.fillRect(x+10*p,y+30*p,20*p,2*p);
  ctx.fillStyle = '#1a6aaa';
  ctx.fillRect(x+13*p,y+4*p,14*p,12*p);
  ctx.fillStyle = '#00ddff';
  ctx.fillRect(x+15*p,y+8*p,4*p,3*p);
  ctx.fillRect(x+22*p,y+8*p,4*p,3*p);
  drawTidecallerCrown(ctx, x, y, p);
  drawTidecallerOrb(ctx, x, y, p);
}

// Draws tidecaller coral crown
function drawTidecallerCrown(ctx, x, y, p) {
  ctx.fillStyle = '#ff6644';
  ctx.fillRect(x+12*p,y,4*p,6*p);
  ctx.fillRect(x+22*p,y,4*p,5*p);
  ctx.fillStyle = '#ff8855';
  ctx.fillRect(x+17*p,y,4*p,7*p);
  ctx.fillRect(x+27*p,y+1*p,3*p,4*p);
}

// Draws tidecaller glowing orb on staff
function drawTidecallerOrb(ctx, x, y, p) {
  ctx.fillStyle = '#0a3a6a';
  ctx.fillRect(x+28*p,y+10*p,3*p,24*p);
  ctx.fillStyle = '#1a6aaa';
  ctx.fillRect(x+25*p,y+8*p,8*p,8*p);
  ctx.fillStyle = '#00ddff';
  ctx.fillRect(x+27*p,y+9*p,5*p,6*p);
  ctx.fillStyle = '#88ffff';
  ctx.fillRect(x+28*p,y+10*p,3*p,4*p);
}

// Draws maelstrom — massive water warrior with huge fists
function drawMaelstromSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#0a3a6a';
  ctx.fillRect(x+8*p,y+12*p,24*p,22*p);
  ctx.fillStyle = '#1a5a9a';
  ctx.fillRect(x+6*p,y+14*p,28*p,18*p);
  ctx.fillStyle = '#5aaacc';
  ctx.fillRect(x+10*p,y+20*p,20*p,2*p);
  ctx.fillRect(x+8*p,y+24*p,24*p,2*p);
  ctx.fillStyle = '#2a6aaa';
  ctx.fillRect(x+10*p,y+2*p,20*p,12*p);
  ctx.fillStyle = '#3a8acc';
  ctx.fillRect(x+6*p,y,28*p,6*p);
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(x+12*p,y+6*p,6*p,4*p);
  ctx.fillRect(x+22*p,y+6*p,6*p,4*p);
  ctx.fillStyle = '#0a3a6a';
  ctx.fillRect(x+2*p,y+12*p,6*p,16*p);
  ctx.fillRect(x+32*p,y+12*p,6*p,16*p);
  ctx.fillStyle = '#1a6aaa';
  ctx.fillRect(x,y+16*p,4*p,8*p);
  ctx.fillRect(x+36*p,y+16*p,4*p,8*p);
}

// ---- STONE EXCLUSIVE SPRITES ----

// Draws guardian — tower shield dominates left half, sword right
function drawGuardianSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x+2*p,y+8*p,16*p,30*p);
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x+3*p,y+9*p,14*p,28*p);
  ctx.fillStyle = '#7a726a';
  ctx.fillRect(x+5*p,y+11*p,10*p,24*p);
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x+9*p,y+11*p,2*p,24*p);
  ctx.fillRect(x+5*p,y+22*p,10*p,2*p);
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x+16*p,y+12*p,16*p,20*p);
  ctx.fillRect(x+16*p,y+2*p,16*p,12*p);
  ctx.fillStyle = '#7a726a';
  ctx.fillRect(x+14*p,y+4*p,20*p,8*p);
  ctx.fillStyle = '#3a3230';
  ctx.fillRect(x+18*p,y+6*p,12*p,4*p);
  ctx.fillStyle = '#aaa';
  ctx.fillRect(x+30*p,y+10*p,4*p,24*p);
}

// Draws delver — goggles, stocky body, drill arm extending right
function drawDelverSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x+11*p,y+14*p,18*p,18*p);
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x+9*p,y+16*p,22*p,14*p);
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x+12*p,y+4*p,16*p,12*p);
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x+10*p,y+6*p,20*p,8*p);
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(x+12*p,y+7*p,6*p,5*p);
  ctx.fillRect(x+22*p,y+7*p,6*p,5*p);
  ctx.fillStyle = '#ffcc44';
  ctx.fillRect(x+13*p,y+8*p,4*p,3*p);
  ctx.fillRect(x+23*p,y+8*p,4*p,3*p);
  drawDelverDrill(ctx, x, y, p);
}

// Draws delver drill arm extending right
function drawDelverDrill(ctx, x, y, p) {
  ctx.fillStyle = '#7a726a';
  ctx.fillRect(x+26*p,y+18*p,10*p,6*p);
  ctx.fillStyle = '#888';
  ctx.fillRect(x+34*p,y+15*p,4*p,12*p);
  ctx.fillStyle = '#aaa';
  ctx.fillRect(x+36*p,y+13*p,3*p,4*p);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(x+37*p,y+17*p,2*p,4*p);
  ctx.fillStyle = '#aaa';
  ctx.fillRect(x+36*p,y+21*p,3*p,4*p);
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(x+12*p,y+30*p,7*p,12*p);
  ctx.fillRect(x+21*p,y+30*p,7*p,12*p);
}

// Draws colossus body — widest unit, fills most of tile
function drawColossusSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x+6*p,y+12*p,28*p,24*p);
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x+4*p,y+14*p,32*p,20*p);
  ctx.fillStyle = '#7a726a';
  ctx.fillRect(x+8*p,y+16*p,24*p,16*p);
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(x+10*p,y+18*p,2*p,10*p);
  ctx.fillRect(x+18*p,y+20*p,2*p,12*p);
  ctx.fillRect(x+26*p,y+18*p,2*p,8*p);
  drawColossusHead(ctx, x, y, p);
  drawColossusFists(ctx, x, y, p);
}

// Draws colossus head with golden eyes
function drawColossusHead(ctx, x, y, p) {
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x+8*p,y+2*p,24*p,12*p);
  ctx.fillStyle = '#7a726a';
  ctx.fillRect(x+6*p,y+4*p,28*p,8*p);
  ctx.fillStyle = '#3a3230';
  ctx.fillRect(x+10*p,y+5*p,8*p,5*p);
  ctx.fillRect(x+22*p,y+5*p,8*p,5*p);
  ctx.fillStyle = '#c8a840';
  ctx.fillRect(x+11*p,y+6*p,6*p,3*p);
  ctx.fillRect(x+23*p,y+6*p,6*p,3*p);
}

// Draws colossus massive fists and legs
function drawColossusFists(ctx, x, y, p) {
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(x,y+12*p,6*p,20*p);
  ctx.fillRect(x+34*p,y+12*p,6*p,20*p);
  ctx.fillStyle = '#6a6258';
  ctx.fillRect(x,y+28*p,8*p,8*p);
  ctx.fillRect(x+32*p,y+28*p,8*p,8*p);
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(x+6*p,y+34*p,12*p,10*p);
  ctx.fillRect(x+22*p,y+34*p,12*p,10*p);
}

// ---- GALE EXCLUSIVE SPRITES ----

// Draws skyrider — wind mount below, aerodynamic rider on top
function drawSkyriderSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#2a6a52';
  ctx.fillRect(x+4*p,y+24*p,32*p,10*p);
  ctx.fillStyle = '#3a8a6a';
  ctx.fillRect(x+6*p,y+22*p,28*p,8*p);
  ctx.fillStyle = '#4aaa88';
  ctx.fillRect(x,y+24*p,8*p,6*p);
  ctx.fillRect(x+32*p,y+24*p,8*p,6*p);
  ctx.fillStyle = '#2a6a52';
  ctx.fillRect(x+14*p,y+10*p,12*p,14*p);
  ctx.fillStyle = '#3a8a6a';
  ctx.fillRect(x+12*p,y+12*p,16*p,10*p);
  ctx.fillRect(x+14*p,y+2*p,12*p,10*p);
  ctx.fillStyle = '#4aaa88';
  ctx.fillRect(x+18*p,y,6*p,6*p);
  ctx.fillStyle = '#0a2a1a';
  ctx.fillRect(x+14*p,y+6*p,12*p,4*p);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(x+15*p,y+7*p,10*p,2*p);
  drawSkyriderStreamers(ctx, x, y, p);
}

// Draws skyrider side streamers
function drawSkyriderStreamers(ctx, x, y, p) {
  ctx.fillStyle = '#3a8a6a';
  ctx.fillRect(x,y+14*p,14*p,3*p);
  ctx.fillRect(x+26*p,y+14*p,14*p,3*p);
  ctx.fillStyle = '#2a6a52';
  ctx.fillRect(x,y+18*p,10*p,2*p);
  ctx.fillStyle = '#1a4a3a';
  ctx.fillRect(x+13*p,y+22*p,5*p,8*p);
  ctx.fillRect(x+22*p,y+22*p,5*p,8*p);
}

// Draws drifter — billowing cloak, wind mask, floating daggers
function drawDrifterSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#1a4a3a';
  ctx.fillRect(x+10*p,y+14*p,20*p,24*p);
  ctx.fillStyle = '#2a6a52';
  ctx.fillRect(x+8*p,y+18*p,24*p,20*p);
  ctx.fillStyle = '#1a4a3a';
  ctx.fillRect(x+4*p,y+20*p,8*p,14*p);
  ctx.fillRect(x+28*p,y+18*p,8*p,16*p);
  ctx.fillStyle = '#2a6a52';
  ctx.fillRect(x+13*p,y+4*p,14*p,12*p);
  ctx.fillStyle = '#3a8a6a';
  ctx.fillRect(x+14*p,y+6*p,12*p,8*p);
  ctx.fillStyle = '#0a1a10';
  ctx.fillRect(x+14*p,y+7*p,12*p,2*p);
  ctx.fillRect(x+14*p,y+11*p,12*p,2*p);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(x+16*p,y+8*p,8*p,2*p);
  drawDrifterDaggers(ctx, x, y, p);
}

// Draws drifter floating daggers and wind dots
function drawDrifterDaggers(ctx, x, y, p) {
  ctx.fillStyle = '#5abaa0';
  ctx.fillRect(x+2*p,y+10*p,2*p,10*p);
  ctx.fillRect(x+36*p,y+12*p,2*p,10*p);
  ctx.fillStyle = '#88ddbb';
  ctx.fillRect(x+2*p,y+9*p,3*p,2*p);
  ctx.fillRect(x+35*p,y+11*p,3*p,2*p);
  ctx.fillStyle = '#3a8a6a';
  ctx.fillRect(x+2*p,y+26*p,2*p,2*p);
  ctx.fillRect(x+36*p,y+24*p,2*p,2*p);
}

// Draws stormcaller body — storm robes with lightning pattern
function drawStormcallerSprite(ctx, f, x, y, p) {
  ctx.fillStyle = '#1a3a2a';
  ctx.fillRect(x+10*p,y+14*p,20*p,24*p);
  ctx.fillStyle = '#2a5a40';
  ctx.fillRect(x+8*p,y+16*p,24*p,22*p);
  ctx.fillStyle = '#88ffcc';
  ctx.fillRect(x+12*p,y+20*p,6*p,2*p);
  ctx.fillRect(x+14*p,y+22*p,4*p,2*p);
  ctx.fillRect(x+16*p,y+24*p,6*p,2*p);
  ctx.fillStyle = '#aaffdd';
  ctx.fillRect(x+22*p,y+18*p,6*p,2*p);
  ctx.fillRect(x+24*p,y+20*p,4*p,2*p);
  drawStormcallerHead(ctx, x, y, p);
  drawStormcallerOrbs(ctx, x, y, p);
}

// Draws stormcaller head with lightning spike crown
function drawStormcallerHead(ctx, x, y, p) {
  ctx.fillStyle = '#2a5a40';
  ctx.fillRect(x+13*p,y+4*p,14*p,12*p);
  ctx.fillStyle = '#3a6a50';
  ctx.fillRect(x+14*p,y+6*p,12*p,8*p);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(x+15*p,y+8*p,4*p,3*p);
  ctx.fillRect(x+22*p,y+8*p,4*p,3*p);
  ctx.fillStyle = '#88ffcc';
  ctx.fillRect(x+13*p,y,3*p,6*p);
  ctx.fillRect(x+22*p,y,3*p,6*p);
  ctx.fillStyle = '#aaffdd';
  ctx.fillRect(x+16*p,y,3*p,5*p);
  ctx.fillStyle = '#ccffee';
  ctx.fillRect(x+19*p,y,3*p,5*p);
  ctx.fillRect(x+25*p,y+1*p,3*p,4*p);
}

// Draws stormcaller floating storm orbs and raised arms
function drawStormcallerOrbs(ctx, x, y, p) {
  ctx.fillStyle = '#2a5a40';
  ctx.fillRect(x+2*p,y+16*p,6*p,6*p);
  ctx.fillRect(x+32*p,y+18*p,6*p,6*p);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(x+3*p,y+17*p,4*p,4*p);
  ctx.fillStyle = '#88ffcc';
  ctx.fillRect(x+33*p,y+19*p,4*p,4*p);
  ctx.fillStyle = '#1a3a2a';
  ctx.fillRect(x+4*p,y+14*p,8*p,6*p);
  ctx.fillRect(x+28*p,y+14*p,8*p,6*p);
}

// ---- HP BAR ----

// Draws a pixel HP bar below the unit
function drawUnitHpBar(ctx, unit, x, y) {
  const px = x * TILE_SIZE + MAP_OFFSET_X + 4;
  const py = y * TILE_SIZE + MAP_OFFSET_Y + TILE_SIZE - 5;
  const w = TILE_SIZE - 8;
  const ratio = unit.hp / unit.maxHp;
  ctx.fillStyle = '#111';
  ctx.fillRect(px, py, w, 3);
  ctx.fillStyle = ratio > 0.5 ? '#5cb85c' : ratio > 0.25 ? '#d4a843' : '#c44';
  ctx.fillRect(px, py, Math.round(w * ratio), 3);
}

// ---- HOVER ----

// Draws a highlight border using fillRect when tile is hovered
function drawHover(ctx, x, y) {
  const px = x * TILE_SIZE + MAP_OFFSET_X, py = y * TILE_SIZE + MAP_OFFSET_Y, s = TILE_SIZE;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(px, py, s, 1);
  ctx.fillRect(px, py + s - 1, s, 1);
  ctx.fillRect(px, py, 1, s);
  ctx.fillRect(px + s - 1, py, 1, s);
}

// ---- MAIN RENDER ----

// Renders the entire map grid to the canvas
function renderMap(ctx, grid) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#0a0b0f';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      drawTile(ctx, tile, x, y);
      drawResourceIcon(ctx, tile, x, y);
      drawOwnership(ctx, tile, x, y);
      if (tile.capital && !tile.unit) drawCapital(ctx, tile, x, y);
      if (tile.unit) drawUnit(ctx, tile.unit, x, y);
    }
  }
}

// Draws highlight overlay on tiles the selected unit can reach
function renderMoveHighlights(ctx, validMoves, grid) {
  for (let i = 0; i < validMoves.length; i++) {
    const r = validMoves[i][0], c = validMoves[i][1];
    const px = c * TILE_SIZE + MAP_OFFSET_X, py = r * TILE_SIZE + MAP_OFFSET_Y;
    ctx.fillStyle = grid[r][c].unit ? 'rgba(230,60,60,0.35)' : 'rgba(255,255,255,0.2)';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  }
}

// Draws a bright gold border around the selected unit's tile
function renderSelectedUnit(ctx, row, col) {
  const px = col * TILE_SIZE + MAP_OFFSET_X, py = row * TILE_SIZE + MAP_OFFSET_Y, s = TILE_SIZE;
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(px, py, s, 2);
  ctx.fillRect(px, py + s - 2, s, 2);
  ctx.fillRect(px, py, 2, s);
  ctx.fillRect(px + s - 2, py, 2, s);
}

// Renders just the hover effect on top of the map
function renderHover(ctx, grid, hoverX, hoverY) {
  if (hoverX < 0 || hoverY < 0) return;
  if (hoverX >= grid[0].length || hoverY >= grid.length) return;
  drawHover(ctx, hoverX, hoverY);
}

// Advances the altar glow animation phase
function tickAltarGlow() {
  altarGlowPhase += 0.04;
}