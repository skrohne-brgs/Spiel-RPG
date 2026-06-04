export const TILE_SIZE = 48;
export const MAP_COLS = 20;
export const MAP_ROWS = 15;
export const SIDEBAR_WIDTH = 320;
export const GAME_WIDTH = MAP_COLS * TILE_SIZE + SIDEBAR_WIDTH; // 1280
export const GAME_HEIGHT = MAP_ROWS * TILE_SIZE;                // 720

export const T = {
  GRASS:     0,
  MOUNTAIN:  1,
  FOREST:    2,
  WATER:     3,
  RUINS:     4,
  ROAD:      5,
  WASTELAND: 6,
  TOWN:      7,
} as const;

export const TILE_CONFIG: Record<number, { name: string; color: number; walkable: boolean; moveCost: number }> = {
  [T.GRASS]:     { name: 'Grasland', color: 0x4a7a30, walkable: true,  moveCost: 1   },
  [T.MOUNTAIN]:  { name: 'Gebirge',  color: 0x6a5a4a, walkable: false, moveCost: 999 },
  [T.FOREST]:    { name: 'Wald',     color: 0x265c18, walkable: true,  moveCost: 2   },
  [T.WATER]:     { name: 'Wasser',   color: 0x1a5a8a, walkable: false, moveCost: 999 },
  [T.RUINS]:     { name: 'Ruinen',   color: 0x4a3a2a, walkable: true,  moveCost: 1   },
  [T.ROAD]:      { name: 'Straße',   color: 0x8a7050, walkable: true,  moveCost: 1   },
  [T.WASTELAND]: { name: 'Ödland',   color: 0x7a6030, walkable: true,  moveCost: 1   },
  [T.TOWN]:      { name: 'Stadt',    color: 0x3a3a5a, walkable: true,  moveCost: 1   },
};

export const COMBAT_COLS = 12; // 6 per side
export const COMBAT_ROWS = 5;
export const COMBAT_CELL_W = 80;
export const COMBAT_CELL_H = 75;
export const COMBAT_GRID_X = (GAME_WIDTH - COMBAT_COLS * COMBAT_CELL_W) / 2;
export const COMBAT_GRID_Y = 60;
