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
    description: (l) => `Fernkampf-Einheiten erhalten +${[15, 25, 35][l - 1] ?? l * 15}% Angriff.`,
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
  einigende_stimme: {
    id: 'einigende_stimme', name: 'Einigende Stimme', maxLevel: 1,
    description: () => 'Alle Einheiten erhalten sofort +2 ATK und +2 DEF. Elendils Wort vereint das Heer.',
  },
  kriegswut: {
    id: 'kriegswut', name: 'Kriegswut', maxLevel: 1,
    description: () => 'Held erhält +4 ATK. Alle Einheiten +2 ATK. Isildurs Zorn kennt keine Grenzen.',
  },
  eisenschild: {
    id: 'eisenschild', name: 'Eisenschild', maxLevel: 1,
    description: () => 'Alle Einheiten +3 DEF und +5 max. HP. Anárions Wille schützt das letzte Bollwerk.',
  },
};
