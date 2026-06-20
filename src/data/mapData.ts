import type { EnemyEncounter, ResourceOnMap } from '../types';

// 20 cols × 15 rows
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
    stacks: [
      { unitId: 'orc_soldier',    count: 12 },
      { unitId: 'orc_archer',     count: 6  },
    ],
    defeated: false, tileX: 11, tileY: 5,
  },
  {
    id: 'warg_raiders', name: 'Warg-Räuber',
    stacks: [{ unitId: 'orc_warg_rider', count: 6 }],
    defeated: false, tileX: 9, tileY: 9,
  },
  {
    id: 'troll_guard', name: 'Troll-Wächter',
    stacks: [
      { unitId: 'troll',       count: 1  },
      { unitId: 'orc_soldier', count: 8  },
    ],
    defeated: false, tileX: 14, tileY: 8,
  },
  {
    id: 'nazgul_vanguard', name: 'Voraustrupp des Schatten',
    stacks: [
      { unitId: 'nazgul',          count: 1  },
      { unitId: 'orc_warg_rider',  count: 5  },
    ],
    defeated: false, tileX: 16, tileY: 10,
  },
];

export const RESOURCES: ResourceOnMap[] = [
  { id: 'gold_1',   type: 'gold',     tileX: 4,  tileY: 5,  collected: false, goldValue: 200 },
  { id: 'gold_2',   type: 'gold',     tileX: 7,  tileY: 7,  collected: false, goldValue: 150 },
  { id: 'gold_3',   type: 'gold',     tileX: 12, tileY: 6,  collected: false, goldValue: 300 },
  { id: 'gold_4',   type: 'gold',     tileX: 10, tileY: 10, collected: false, goldValue: 250 },
  { id: 'art_1',    type: 'artifact', tileX: 8,  tileY: 6,  collected: false, artifactId: 'narsil_shard'  },
  { id: 'art_2',    type: 'artifact', tileX: 13, tileY: 4,  collected: false, artifactId: 'elendilmir'    },
  { id: 'art_3',    type: 'artifact', tileX: 14, tileY: 9,  collected: false, artifactId: 'ring_barahir'  },
  { id: 'art_4',    type: 'artifact', tileX: 6,  tileY: 11, collected: false, artifactId: 'mithril_armor' },
];

// Story triggers by "col,row"
export const STORY_TRIGGERS: Record<string, string> = {
  '5,2':   'intro',
  '9,5':   'eregion',
  '17,10': 'mordor_border',
};

export const VICTORY_TILE = { x: 17, y: 10 };
