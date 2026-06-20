import type { SkillDef } from '../types';

export const SKILL_DEFS: Record<string, SkillDef> = {
  leadership: {
    id: 'leadership', name: 'Führungsstärke', maxLevel: 3,
    description: (l) => `Alle Einheiten erhalten +${l} ATK und +${l} DEF durch hohe Moral.`,
  },
  tactics: {
    id: 'tactics', name: 'Taktik', maxLevel: 3,
    description: (l) => `Einheiten erhalten +${l} Geschwindigkeit im Kampf.`,
  },
  sorcery: {
    id: 'sorcery', name: 'Zauberei', maxLevel: 3,
    description: (l) => `+${l * 10} maximales Mana und +${l} Zauberstärke.`,
  },
  archery: {
    id: 'archery', name: 'Bogenschützenkunst', maxLevel: 3,
    description: (l) => `Fernkampf-Einheiten erhalten +${l * 20}% Angriff.`,
  },
  resistance: {
    id: 'resistance', name: 'Widerstand', maxLevel: 3,
    description: (l) => `Alle Einheiten erhalten +${l} Verteidigung.`,
  },
  offense: {
    id: 'offense', name: 'Angriff', maxLevel: 3,
    description: (l) => `Alle Einheiten erhalten +${l} Angriff.`,
  },
  logistics: {
    id: 'logistics', name: 'Logistik', maxLevel: 3,
    description: (l) => `+${l * 2} Bewegungspunkte pro Zug auf der Abenteuerkarte.`,
  },
};
