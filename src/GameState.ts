import type { GameState, HeroData, UnitStack } from './types';
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

export let state: GameState = buildInitialState('elendil');

export function buildInitialState(heroId: string): GameState {
  const hero = makeHero(heroId);
  const def = HERO_DEFS.find(h => h.id === heroId)!;
  const playerArmy = def.startingArmy.map(s => makeStack(s.unitId, s.count));
  return {
    hero,
    playerArmy,
    heroTile: { x: 5, y: 2 },
    gold: 500,
    defeatedEnemies: [],
    triggeredEvents: [],
    collectedResources: [],
    spellCastThisCombat: false,
  };
}

export function resetState(heroId: string): void {
  state = buildInitialState(heroId);
}

export function isEventTriggered(id: string): boolean {
  return state.triggeredEvents.includes(id);
}
export function triggerEvent(id: string): void {
  if (!state.triggeredEvents.includes(id)) state.triggeredEvents.push(id);
}
export function defeatEnemy(id: string): void {
  if (!state.defeatedEnemies.includes(id)) state.defeatedEnemies.push(id);
}
export function isEnemyDefeated(id: string): boolean {
  return state.defeatedEnemies.includes(id);
}
export function collectResource(id: string): void {
  if (!state.collectedResources.includes(id)) state.collectedResources.push(id);
}
export function isResourceCollected(id: string): boolean {
  return state.collectedResources.includes(id);
}

export function gainExperience(amount: number): void {
  state.hero.experience += amount;
  const needed = state.hero.level * 1000;
  if (state.hero.experience >= needed) {
    state.hero.level++;
    state.hero.experience -= needed;
  }
}

export function applySkill(skillId: string): void {
  const h = state.hero;
  const lvl = (h.skills[skillId] ?? 0) + 1;
  h.skills[skillId] = lvl;
  switch (skillId) {
    case 'sorcery':     h.maxMana += 10; h.mana = Math.min(h.mana + 10, h.maxMana); h.spellPower++; break;
    case 'leadership':  state.playerArmy.forEach(u => { u.attack++; u.defense++; }); break;
    case 'resistance':  state.playerArmy.forEach(u => { u.defense++; }); break;
    case 'offense':     state.playerArmy.forEach(u => { u.attack++; }); break;
    case 'logistics':   break; // handled in movement
    case 'tactics':     break; // handled in combat
    case 'archery':     break; // handled in combat
  }
}

export function applyArtifact(artifactId: string): void {
  if (state.hero.artifacts.includes(artifactId)) return;
  state.hero.artifacts.push(artifactId);

  const { ARTIFACTS } = require('./data/artifacts');
  const art = ARTIFACTS.find((a: { id: string }) => a.id === artifactId);
  if (!art) return;
  const h = state.hero;
  const b = art.bonuses;
  if (b.attack)     h.attack     += b.attack;
  if (b.defense)    h.defense    += b.defense;
  if (b.knowledge)  h.knowledge  += b.knowledge;
  if (b.maxMana)  { h.maxMana    += b.maxMana; h.mana = Math.min(h.mana + b.maxMana, h.maxMana); }
  if (b.spellPower) h.spellPower += b.spellPower;
}

export function movementPoints(): number {
  const logLevel = state.hero.skills['logistics'] ?? 0;
  return 8 + logLevel * 2;
}
