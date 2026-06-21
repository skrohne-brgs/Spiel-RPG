export interface Position { x: number; y: number; }

export interface MissionCity {
  id: string; name: string; description: string;
  tileX: number; tileY: number;
  recruitOptions: Array<{ unitId: string; cost: number; available: number }>;
}

export type VictoryCondition =
  | { type: 'reach' }
  | { type: 'artifact'; artifactId: string }
  | { type: 'boss_then_reach'; enemyId: string }
  | { type: 'artifact_then_reach'; artifactId: string };

export interface LoreItem {
  id: string;
  title: string;
  text: string;
  tileX: number;
  tileY: number;
}

export interface SideObjective {
  id: string;
  description: string;
  type: 'defeat_all_enemies' | 'collect_all_gold' | 'discover_all_lore' | 'defeat_enemy';
  enemyId?: string;
  goldReward?: number;
  unitReward?: { unitId: string; count: number };
}

export interface MissionData {
  id: string; title: string; subtitle: string; description: string;
  mapTiles: number[][];
  enemies: EnemyEncounter[];
  resources: ResourceOnMap[];
  storyTriggers: Record<string, string>;
  cities: MissionCity[];
  victoryTile: { x: number; y: number };
  startTile: { x: number; y: number };
  victoryEventId: string;
  introEventId?: string;
  victoryCondition: VictoryCondition;
  phaseOneEventId?: string;
  loreItems?: LoreItem[];
  sideObjectives?: SideObjective[];
}

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
  skillPoints: number;
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
  fogMap: number[][];  // 0=unentdeckt  1=gesehen  2=sichtbar
  currentMissionIdx: number;   // 0–4
  completedMissions: number[];
  missionVictoryPhase: number;  // 0=start  1=first condition met  2=done
  collectedLore: string[];
  completedSideObjectives: string[];
}
