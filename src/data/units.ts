import type { UnitDef } from '../types';

export const UNIT_DEFS: Record<string, UnitDef> = {
  // ── Player units ──────────────────────────────────────────────────────────
  numenorean_warrior: {
    id: 'numenorean_warrior', name: 'Númenórischer Krieger',
    faction: 'player', maxHp: 15, attack: 5, defense: 4, speed: 4, range: 1, moveRange: 3,
    color: 0x4a78c0, symbol: 'K',
  },
  numenorean_archer: {
    id: 'numenorean_archer', name: 'Númenórischer Bogenschütze',
    faction: 'player', maxHp: 10, attack: 4, defense: 2, speed: 5, range: 5, moveRange: 3,
    color: 0x3aa060, symbol: 'B',
  },
  dunedain_ranger: {
    id: 'dunedain_ranger', name: 'Dúnedain-Waldläufer',
    faction: 'player', maxHp: 12, attack: 6, defense: 3, speed: 7, range: 4, moveRange: 5,
    color: 0x5a8040, symbol: 'R',
  },
  elven_warrior: {
    id: 'elven_warrior', name: 'Elben-Krieger Gil-galads',
    faction: 'player', maxHp: 14, attack: 7, defense: 5, speed: 6, range: 1, moveRange: 4,
    color: 0xc0c040, symbol: 'E',
  },
  elven_cavalry: {
    id: 'elven_cavalry', name: 'Elben-Kavallerie',
    faction: 'player', maxHp: 22, attack: 9, defense: 5, speed: 8, range: 1, moveRange: 5,
    color: 0xe0d060, symbol: 'V',
  },
  // ── Enemy units ───────────────────────────────────────────────────────────
  orc_soldier: {
    id: 'orc_soldier', name: 'Ork-Soldat',
    faction: 'enemy', maxHp: 10, attack: 4, defense: 2, speed: 3, range: 1, moveRange: 2,
    color: 0x6a3010, symbol: 'O',
  },
  orc_archer: {
    id: 'orc_archer', name: 'Ork-Bogenschütze',
    faction: 'enemy', maxHp: 8, attack: 5, defense: 1, speed: 4, range: 5, moveRange: 3,
    color: 0x804010, symbol: 'S',
  },
  orc_warg_rider: {
    id: 'orc_warg_rider', name: 'Warg-Reiter',
    faction: 'enemy', maxHp: 15, attack: 7, defense: 3, speed: 7, range: 1, moveRange: 5,
    color: 0x8a4018, symbol: 'W',
  },
  troll: {
    id: 'troll', name: 'Stein-Troll',
    faction: 'enemy', maxHp: 60, attack: 12, defense: 6, speed: 2, range: 1, moveRange: 2,
    color: 0x505850, symbol: 'T',
  },
  nazgul: {
    id: 'nazgul', name: 'Nazgûl',
    faction: 'enemy', maxHp: 80, attack: 15, defense: 8, speed: 7, range: 1, moveRange: 4,
    color: 0x2a1a3a, symbol: 'N',
  },
  easterling_warrior: {
    id: 'easterling_warrior', name: 'Rhûn-Krieger',
    faction: 'enemy', maxHp: 18, attack: 6, defense: 4, speed: 5, range: 1, moveRange: 3,
    color: 0x8b4513, symbol: 'R',
  },
  easterling_rider: {
    id: 'easterling_rider', name: 'Rhûn-Reiter',
    faction: 'enemy', maxHp: 20, attack: 9, defense: 4, speed: 9, range: 1, moveRange: 5,
    color: 0xa0522d, symbol: 'C',
  },
  cave_troll: {
    id: 'cave_troll', name: 'Höhlentroll',
    faction: 'enemy', maxHp: 80, attack: 14, defense: 8, speed: 2, range: 1, moveRange: 2,
    color: 0x3a4030, symbol: 'H',
  },
  saurons_lieutenant: {
    id: 'saurons_lieutenant', name: 'Saurons Leutnant',
    faction: 'enemy', maxHp: 120, attack: 18, defense: 12, speed: 6, range: 1, moveRange: 4,
    color: 0x2a1a2a, symbol: 'L',
  },
};
