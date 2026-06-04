export interface Position { x: number; y: number; }

export interface UnitDef {
  id: string;
  name: string;
  faction: 'player' | 'enemy';
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;   // 1 = melee, >1 = ranged tiles
  color: number;
  symbol: string;
}

export interface UnitStack extends UnitDef {
  count: number;
  currentHp: number;
}

export interface HeroData {
  name: string;
  title: string;
  attack: number;
  defense: number;
  knowledge: number;
  leadership: number;
  level: number;
  experience: number;
}

export interface EnemyEncounter {
  id: string;
  name: string;
  stacks: Array<{ unitId: string; count: number }>;
  defeated: boolean;
  tileX: number;
  tileY: number;
}

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface StoryEvent {
  id: string;
  lines: DialogLine[];
  onComplete?: string;
}

export interface CombatStack extends UnitStack {
  gridX: number;
  gridY: number;
  hasActed: boolean;
}

export interface GameState {
  hero: HeroData;
  playerArmy: UnitStack[];
  heroTile: Position;
  defeatedEnemies: string[];
  triggeredEvents: string[];
}
