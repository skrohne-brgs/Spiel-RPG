import { T } from '../constants';
import type { EnemyEncounter } from '../types';

// 20 cols x 15 rows — W=water, G=grass, F=forest, M=mountain, R=ruins, P=road, D=wasteland, C=town
export const MAP_TILES: number[][] = [
  [3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
  [3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
  [3,3,3,3,0,7,5,0,2,2,0,0,0,0,1,1,1,1,1,1],
  [3,3,3,0,0,5,0,0,2,2,0,0,0,1,1,1,1,1,1,1],
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
    id: 'patrol_1',
    name: 'Ork-Patrouille',
    stacks: [{ unitId: 'orc_soldier', count: 8 }],
    defeated: false,
    tileX: 6, tileY: 4,
  },
  {
    id: 'orc_force',
    name: 'Ork-Streitmacht',
    stacks: [
      { unitId: 'orc_soldier', count: 15 },
      { unitId: 'orc_archer',  count: 5  },
    ],
    defeated: false,
    tileX: 11, tileY: 5,
  },
  {
    id: 'troll_guard',
    name: 'Troll-Wächter',
    stacks: [
      { unitId: 'troll',       count: 1  },
      { unitId: 'orc_soldier', count: 8  },
    ],
    defeated: false,
    tileX: 15, tileY: 8,
  },
];

// Tile coordinates that trigger story events
export const STORY_TRIGGERS: Record<string, string> = {
  '5,2':  'intro',
  '9,5':  'eregion',
  '17,10': 'mordor_border',
};

// Victory tile
export const VICTORY_TILE = { x: 17, y: 10 };
