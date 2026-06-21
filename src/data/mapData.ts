import type { EnemyEncounter, ResourceOnMap } from '../types';

// 20 cols × 15 rows — 0=Gras 1=Berg 2=Wald 3=Wasser 4=Ruinen 5=Straße 6=Ödland 7=Stadt
export const MAP_TILES: number[][] = [
  [3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
  [3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
  [3,3,3,3,0,7,5,0,2,2,0,0,0,0,1,1,1,1,1,1],
  [3,3,3,0,0,5,0,7,2,2,0,0,0,1,1,1,1,1,1,1],
  [3,3,0,0,5,5,5,0,0,0,4,4,0,1,1,1,1,1,1,1],
  [3,3,0,0,0,5,0,0,0,4,4,4,0,0,1,1,1,1,1,1],
  [3,0,0,0,2,5,2,0,0,4,4,0,0,0,0,1,1,1,1,1],
  [3,0,0,2,2,5,2,2,0,0,0,0,0,0,6,6,1,1,1,1],
  [3,3,0,0,2,5,0,0,0,0,0,0,6,6,6,6,6,1,1,1],
  [3,3,0,0,0,5,5,5,0,0,0,6,6,6,6,6,6,6,1,1],
  [3,3,3,0,0,0,5,0,0,0,6,6,6,6,6,6,6,6,6,1],
  [3,3,3,3,0,0,5,0,0,6,6,6,6,6,6,6,6,6,6,6],
  [3,3,3,3,3,0,5,5,6,6,6,6,6,6,6,6,6,6,6,6],
  [3,3,3,3,3,3,0,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [3,3,3,3,3,3,3,6,6,6,6,6,6,6,6,6,6,6,6,6],
];

export const ENEMY_ENCOUNTERS: EnemyEncounter[] = [
  {
    id: 'patrol_1', name: 'Ork-Patrouille',
    stacks: [{ unitId: 'orc_soldier', count: 8 }],
    defeated: false, tileX: 6, tileY: 4,
  },
  {
    id: 'orc_force', name: 'Ork-Streitmacht',
    stacks: [{ unitId: 'orc_soldier', count: 12 }, { unitId: 'orc_archer', count: 6 }],
    defeated: false, tileX: 11, tileY: 5,
  },
  {
    id: 'warg_raiders', name: 'Warg-Räuber',
    stacks: [{ unitId: 'orc_warg_rider', count: 6 }],
    defeated: false, tileX: 9, tileY: 9,
  },
  {
    id: 'troll_guard', name: 'Troll-Wächter',
    stacks: [{ unitId: 'troll', count: 1 }, { unitId: 'orc_soldier', count: 8 }],
    defeated: false, tileX: 14, tileY: 8,
  },
  {
    id: 'nazgul_vanguard', name: 'Voraustrupp des Schatten',
    stacks: [{ unitId: 'nazgul', count: 1 }, { unitId: 'orc_warg_rider', count: 5 }],
    defeated: false, tileX: 16, tileY: 10,
  },
  {
    id: 'forest_ambush', name: 'Hinterhalt im Wald',
    stacks: [{ unitId: 'orc_archer', count: 10 }, { unitId: 'orc_soldier', count: 5 }],
    defeated: false, tileX: 4, tileY: 7,
  },
  {
    id: 'wasteland_horde', name: 'Horde des Ödlands',
    stacks: [{ unitId: 'orc_soldier', count: 18 }, { unitId: 'orc_warg_rider', count: 4 }],
    defeated: false, tileX: 12, tileY: 11,
  },
  {
    id: 'mountain_troll', name: 'Bergriese',
    stacks: [{ unitId: 'troll', count: 2 }],
    defeated: false, tileX: 15, tileY: 3,
  },
];

export const RESOURCES: ResourceOnMap[] = [
  { id: 'gold_1', type: 'gold',     tileX: 4,  tileY: 5,  collected: false, goldValue: 200 },
  { id: 'gold_2', type: 'gold',     tileX: 7,  tileY: 7,  collected: false, goldValue: 150 },
  { id: 'gold_3', type: 'gold',     tileX: 12, tileY: 6,  collected: false, goldValue: 300 },
  { id: 'gold_4', type: 'gold',     tileX: 10, tileY: 10, collected: false, goldValue: 250 },
  { id: 'gold_5', type: 'gold',     tileX: 3,  tileY: 10, collected: false, goldValue: 175 },
  { id: 'gold_6', type: 'gold',     tileX: 8,  tileY: 12, collected: false, goldValue: 400 },
  { id: 'art_1',  type: 'artifact', tileX: 8,  tileY: 6,  collected: false, artifactId: 'narsil_shard'  },
  { id: 'art_2',  type: 'artifact', tileX: 13, tileY: 4,  collected: false, artifactId: 'elendilmir'    },
  { id: 'art_3',  type: 'artifact', tileX: 14, tileY: 9,  collected: false, artifactId: 'ring_barahir'  },
  { id: 'art_4',  type: 'artifact', tileX: 6,  tileY: 11, collected: false, artifactId: 'mithril_armor' },
];

export const STORY_TRIGGERS: Record<string, string> = {
  '5,2':   'intro',
  '9,5':   'eregion',
  '4,6':   'forest_warning',
  '6,8':   'ancient_road',
  '10,7':  'wasteland_signs',
  '17,10': 'mordor_border',
};

export const VICTORY_TILE = { x: 17, y: 10 };
