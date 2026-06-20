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

// ── Hex grid constants (pointy-top, odd-r offset) ─────────────────────────────
export const HEX_SIZE   = 27;                         // circumradius (vertex→centre)
export const HEX_W      = Math.sqrt(3) * HEX_SIZE;   // ≈46.77  (hex width)
export const HEX_H      = 2 * HEX_SIZE;              // 54      (hex height)
export const HEX_ROW_H  = 1.5 * HEX_SIZE;            // 40.5    (row spacing)
// Vertically centre the hex grid inside the 720 px map area.
// Grid height = (MAP_ROWS-1)*HEX_ROW_H + HEX_H = 14*40.5 + 54 = 621 px
export const HEX_OFFSET_Y = Math.round((GAME_HEIGHT - ((MAP_ROWS - 1) * HEX_ROW_H + HEX_H)) / 2); // ≈50

export const COMBAT_COLS = 12; // 6 per side
export const COMBAT_ROWS = 5;
export const COMBAT_CELL_W = 80;
export const COMBAT_CELL_H = 75;
export const COMBAT_GRID_X = (GAME_WIDTH - COMBAT_COLS * COMBAT_CELL_W) / 2;
export const COMBAT_GRID_Y = 60;
