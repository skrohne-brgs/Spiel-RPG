import type { GameState, HeroData, UnitStack } from './types';
import { MAP_COLS, MAP_ROWS } from './constants';
import { UNIT_DEFS } from './data/units';
import { HERO_DEFS } from './data/heroes';

function makeStack(unitId: string, count: number): UnitStack {
  const def = UNIT_DEFS[unitId];
  if (!def) throw new Error(`Unknown unit: ${unitId}`);
  return { ...def, count, currentHp: def.maxHp };
}

function makeHero(heroId: string): HeroData {
  const def = HERO_DEFS.find(h => h.id === heroId);
  if (!def) throw new Error(`Unknown hero: ${heroId}`);
  return { ...def, artifacts: [], skills: { ...def.skills } };
}

function emptyFog(): number[][] {
  return Array.from({ length: MAP_ROWS }, () => new Array(MAP_COLS).fill(0));
}

export let state: GameState = buildInitialState('elendil');

export function buildInitialState(heroId: string): GameState {
  const hero = makeHero(heroId);
  const def  = HERO_DEFS.find(h => h.id === heroId)!;
  return {
    hero,
    playerArmy: def.startingArmy.map(s => makeStack(s.unitId, s.count)),
    heroTile:   { x: 5, y: 2 },
    gold:       500,
    defeatedEnemies:    [],
    triggeredEvents:    [],
    collectedResources: [],
    spellCastThisCombat: false,
    fogMap: emptyFog(),
  };
}

export function resetState(heroId: string): void {
  state = buildInitialState(heroId);
}

// ── Fog of War ────────────────────────────────────────────────────────────────

/** Cube-coordinate hex distance for odd-r offset grid */
function hexDist(c1: number, r1: number, c2: number, r2: number): number {
  const q1 = c1 - Math.floor((r1 - (r1 & 1)) / 2);
  const q2 = c2 - Math.floor((r2 - (r2 & 1)) / 2);
  return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((-q1 - r1) - (-q2 - r2))) / 2;
}

export function updateFog(col: number, row: number, radius = 4): void {
  for (let r = 0; r < MAP_ROWS; r++)
    for (let c = 0; c < MAP_COLS; c++)
      if (state.fogMap[r][c] === 2) state.fogMap[r][c] = 1;
  for (let r = 0; r < MAP_ROWS; r++)
    for (let c = 0; c < MAP_COLS; c++)
      if (hexDist(c, r, col, row) <= radius) state.fogMap[r][c] = 2;
}

// ── Auto-Save ─────────────────────────────────────────────────────────────────

const SAVE_KEY = 'mittelerde_v1';

export function saveGame(): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* storage quota */ }
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as GameState;
    if (!saved.fogMap) saved.fogMap = emptyFog();
    state = saved;
    return true;
  } catch { return false; }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isEventTriggered(id: string): boolean  { return state.triggeredEvents.includes(id); }
export function triggerEvent(id: string): void         { if (!state.triggeredEvents.includes(id)) state.triggeredEvents.push(id); }
export function defeatEnemy(id: string): void          { if (!state.defeatedEnemies.includes(id)) state.defeatedEnemies.push(id); }
export function isEnemyDefeated(id: string): boolean   { return state.defeatedEnemies.includes(id); }
export function collectResource(id: string): void      { if (!state.collectedResources.includes(id)) state.collectedResources.push(id); }
export function isResourceCollected(id: string): boolean { return state.collectedResources.includes(id); }

export function gainExperience(amount: number): void {
  state.hero.experience += amount;
  const needed = state.hero.level * 1000;
  if (state.hero.experience >= needed) { state.hero.level++; state.hero.experience -= needed; }
}

export function applySkill(skillId: string): void {
  const h = state.hero;
  h.skills[skillId] = (h.skills[skillId] ?? 0) + 1;
  switch (skillId) {
    case 'sorcery':    h.maxMana += 10; h.mana = Math.min(h.mana + 10, h.maxMana); h.spellPower++; break;
    case 'leadership': state.playerArmy.forEach(u => { u.attack++; u.defense++; }); break;
    case 'resistance': state.playerArmy.forEach(u => { u.defense++; }); break;
    case 'offense':    state.playerArmy.forEach(u => { u.attack++; }); break;
    default: break;
  }
}

export function applyArtifact(artifactId: string): void {
  if (state.hero.artifacts.includes(artifactId)) return;
  state.hero.artifacts.push(artifactId);
  const { ARTIFACTS } = require('./data/artifacts');
  const art = ARTIFACTS.find((a: { id: string }) => a.id === artifactId);
  if (!art) return;
  const h = state.hero, b = art.bonuses;
  if (b.attack)     h.attack     += b.attack;
  if (b.defense)    h.defense    += b.defense;
  if (b.knowledge)  h.knowledge  += b.knowledge;
  if (b.maxMana)  { h.maxMana    += b.maxMana; h.mana = Math.min(h.mana + b.maxMana, h.maxMana); }
  if (b.spellPower) h.spellPower += b.spellPower;
}

export function movementPoints(): number {
  return 8 + (state.hero.skills['logistics'] ?? 0) * 2;
}
