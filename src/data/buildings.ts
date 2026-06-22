export type BuildingFaction = 'human' | 'elf' | 'dwarf' | 'any';

export type BuildingEffect =
  | { type: 'produce_unit'; unitId: string; count: number; intervalTurns: number }
  | { type: 'gold_per_turn'; amount: number }
  | { type: 'one_time_stat'; defense?: number; maxHp?: number }
  | { type: 'mana_restore' };

export interface BuildingDef {
  id: string;
  name: string;
  description: string;
  faction: BuildingFaction;
  cost: number;
  requires: string[];
  effect: BuildingEffect;
}

export const BUILDING_DEFS: BuildingDef[] = [
  {
    id: 'kaserne',
    name: 'Kaserne',
    description: '+2 Númenórische Krieger/Zug im Vorrat',
    faction: 'human',
    cost: 400,
    requires: [],
    effect: { type: 'produce_unit', unitId: 'numenorean_warrior', count: 2, intervalTurns: 1 },
  },
  {
    id: 'schiessstand',
    name: 'Schießstand',
    description: '+1 Númenórischer Bogenschütze/Zug im Vorrat (benötigt Kaserne)',
    faction: 'human',
    cost: 500,
    requires: ['kaserne'],
    effect: { type: 'produce_unit', unitId: 'numenorean_archer', count: 1, intervalTurns: 1 },
  },
  {
    id: 'elfenquartier',
    name: 'Elfenquartier',
    description: '+1 Elbischer Krieger/Zug im Vorrat',
    faction: 'elf',
    cost: 500,
    requires: [],
    effect: { type: 'produce_unit', unitId: 'elven_warrior', count: 1, intervalTurns: 1 },
  },
  {
    id: 'elfenreiterei',
    name: 'Elfenreiterei',
    description: '+1 Elbische Kavallerie alle 2 Züge im Vorrat (benötigt Elfenquartier)',
    faction: 'elf',
    cost: 800,
    requires: ['elfenquartier'],
    effect: { type: 'produce_unit', unitId: 'elven_cavalry', count: 1, intervalTurns: 2 },
  },
  {
    id: 'zwergen_schmiede',
    name: 'Zwergen-Schmiede',
    description: 'Einmalig beim Bau: alle Einheiten +1 DEF, +5 max. HP',
    faction: 'dwarf',
    cost: 600,
    requires: [],
    effect: { type: 'one_time_stat', defense: 1, maxHp: 5 },
  },
  {
    id: 'waffenkammer',
    name: 'Waffenkammer',
    description: '+1 Dúnedain-Waldläufer/Zug im Vorrat',
    faction: 'dwarf',
    cost: 400,
    requires: [],
    effect: { type: 'produce_unit', unitId: 'dunedain_ranger', count: 1, intervalTurns: 1 },
  },
  {
    id: 'marktplatz',
    name: 'Marktplatz',
    description: '+150 Gold/Zug',
    faction: 'any',
    cost: 350,
    requires: [],
    effect: { type: 'gold_per_turn', amount: 150 },
  },
  {
    id: 'magieturm',
    name: 'Magieturm',
    description: 'Bei jedem Stadtbesuch: Held stellt Mana vollständig wieder her',
    faction: 'any',
    cost: 700,
    requires: [],
    effect: { type: 'mana_restore' },
  },
];
