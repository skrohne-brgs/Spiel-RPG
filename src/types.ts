export interface Position { x: number; y: number; }

export interface UnitDef {
  id: string;
  name: string;
  faction: 'player' | 'enemy';
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  moveRange: number;
  color: number;
  symbol: string;
}

export interface UnitStack extends UnitDef {
  count: number;
  currentHp: number;
}

export interface HeroData {
  id: string;
  name: string;
  title: string;
  attack: number;
  defense: number;
  knowledge: number;
  leadership: number;
  level: number;
  experience: number;
  mana: number;
  maxMana: number;
  spellPower: number;
  skills: Record<string, number>;
  spells: string[];
  artifacts: string[];
  startingArmy: Array<{ unitId: string; count: number }>;
  lore: string;
  color: number;
}

export interface SkillDef {
  id: string;
  name: string;
  maxLevel: number;
  description: (level: number) => string;
}

export interface EnemyEncounter {
  id: string;
  name: string;
  stacks: Array<{ unitId: string; count: number }>;
  defeated: boolean;
  tileX: number;
  tileY: number;
}

export interface DialogLine { speaker: string; text: string; }

export interface StoryEvent {
  id: string;
  lines: DialogLine[];
  onComplete?: string;
}

export interface CombatStack extends UnitStack {
  gridX: number;
  gridY: number;
  hasActed: boolean;
  blessed: boolean;
  slowed: boolean;
  slowedTurns: number;
  cid: string;
}

export interface ResourceOnMap {
  id: string;
  type: 'gold' | 'artifact';
  tileX: number;
  tileY: number;
  collected: boolean;
  goldValue?: number;
  artifactId?: string;
}

export interface GameState {
  hero: HeroData;
  playerArmy: UnitStack[];
  heroTile: Position;
  gold: number;
  defeatedEnemies: string[];
  triggeredEvents: string[];
  collectedResources: string[];
  spellCastThisCombat: boolean;
}
