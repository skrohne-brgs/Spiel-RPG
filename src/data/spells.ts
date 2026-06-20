export type SpellTarget = 'enemy_stack' | 'ally_stack' | 'all_enemies' | 'none';

export interface SpellDef {
  id: string;
  name: string;
  manaCost: number;
  description: string;
  target: SpellTarget;
  school: 'air' | 'fire' | 'earth' | 'water';
  icon: string;
}

export const SPELL_DEFS: Record<string, SpellDef> = {
  lightning_bolt: {
    id: 'lightning_bolt', name: 'Blitzstrahl', manaCost: 3, school: 'air', icon: '⚡',
    description: 'Trifft einen feindlichen Stapel für 20×Stärke Schaden.',
    target: 'enemy_stack',
  },
  healing: {
    id: 'healing', name: 'Heilung', manaCost: 4, school: 'water', icon: '✚',
    description: 'Heilt einen freundlichen Stapel um 30×Stärke Trefferpunkte.',
    target: 'ally_stack',
  },
  bless: {
    id: 'bless', name: 'Segen', manaCost: 2, school: 'air', icon: '✦',
    description: 'Erhöht den Schaden eines freundlichen Stapels um 50 % für diesen Zug.',
    target: 'ally_stack',
  },
  slow: {
    id: 'slow', name: 'Verlangsamung', manaCost: 2, school: 'earth', icon: '🐢',
    description: 'Halbiert die Geschwindigkeit eines feindlichen Stapels für 3 Runden.',
    target: 'enemy_stack',
  },
  fire_storm: {
    id: 'fire_storm', name: 'Feuersturm', manaCost: 7, school: 'fire', icon: '🔥',
    description: 'Trifft alle Feinde für 15×Stärke Schaden.',
    target: 'all_enemies',
  },
  mass_haste: {
    id: 'mass_haste', name: 'Masseneile', manaCost: 5, school: 'air', icon: '💨',
    description: 'Alle eigenen Einheiten erhalten +4 Geschwindigkeit für diese Runde.',
    target: 'none',
  },
};
