import type { GameState, UnitStack } from './types';
import { UNIT_DEFS } from './data/units';

function makeStack(unitId: string, count: number): UnitStack {
  const def = UNIT_DEFS[unitId];
  if (!def) throw new Error(`Unknown unit: ${unitId}`);
  return { ...def, count, currentHp: def.maxHp };
}

export const state: GameState = {
  hero: {
    name: 'Elendil',
    title: 'Fürst von Andúnië',
    attack: 3,
    defense: 3,
    knowledge: 2,
    leadership: 4,
    level: 1,
    experience: 0,
  },
  playerArmy: [
    makeStack('numenorean_warrior', 10),
    makeStack('numenorean_archer', 5),
  ],
  heroTile: { x: 5, y: 2 },
  defeatedEnemies: [],
  triggeredEvents: [],
};

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

export function gainExperience(amount: number): void {
  state.hero.experience += amount;
  const needed = state.hero.level * 1000;
  if (state.hero.experience >= needed) {
    state.hero.level++;
    state.hero.experience -= needed;
    state.hero.attack++;
    state.hero.defense++;
  }
}
