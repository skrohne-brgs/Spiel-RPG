import Phaser from 'phaser';
import { CITIES } from '../data/cities';
import { GOODS, getGood } from '../data/goods';
import type { GameState } from '../state';
import type { GameEvent } from './events';

// Kaufbare Privilegien: Gegenleistungen der Fürsten für treue Dienste.
export interface PrivilegeDef {
  id: string;
  name: string;
  cost: number;
  repReq: number; // benötigte Reputation
  description: string;
}

export const PRIVILEGES: PrivilegeDef[] = [
  {
    id: 'zollfreiheit',
    name: 'Kaiserliche Zollfreiheit',
    cost: 2000,
    repReq: 20,
    description: 'Keine Wegzölle mehr auf deinen Reisen.',
  },
  {
    id: 'monopol_tirol',
    name: 'Bergbaumonopol Tirol',
    cost: 4000,
    repReq: 35,
    description: 'Erz, Kupfer und Silber sind in Innsbruck 20 % günstiger.',
  },
  {
    id: 'salzregal',
    name: 'Salzregal zu Krakau',
    cost: 3500,
    repReq: 35,
    description: 'Dein Salzbergwerk fördert 2 zusätzliche Einheiten im Monat.',
  },
];

// Rivalisierende Handelshäuser mit eigenem Vermögen.
export interface Rival {
  id: string;
  name: string;
  wealth: number;
}

export function createRivals(): Rival[] {
  return [
    { id: 'welser', name: 'Die Welser', wealth: 4000 },
    { id: 'medici', name: 'Die Medici', wealth: 8000 },
    { id: 'hochstetter', name: 'Die Höchstetter', wealth: 2500 },
  ];
}

// Rivalen wirtschaften jeden Monat; gelegentlich greifen sie in einen
// Markt ein und bewegen dort spürbar den Preis.
export function runRivals(s: GameState): GameEvent[] {
  const events: GameEvent[] = [];
  for (const r of s.rivals) {
    r.wealth = Math.round(r.wealth * (1 + 0.005 + Math.random() * 0.025));
  }
  if (Math.random() < 0.12) {
    const rival = Phaser.Math.RND.pick(s.rivals);
    const city = Phaser.Math.RND.pick(CITIES);
    const good = Phaser.Math.RND.pick(GOODS);
    if (Math.random() < 0.5) {
      s.market[city.id][good.id] = Math.min(2, s.market[city.id][good.id] * 1.5);
      events.push({
        title: `${rival.name} kaufen auf`,
        text: `${rival.name} kaufen alles ${getGood(good.id).name}\nin ${city.name} auf – der Preis springt in die Höhe.`,
      });
    } else {
      s.market[city.id][good.id] = Math.max(0.4, s.market[city.id][good.id] * 0.6);
      events.push({
        title: `${rival.name} fluten den Markt`,
        text: `${rival.name} werfen große Mengen ${getGood(good.id).name}\nin ${city.name} auf den Markt – der Preis stürzt ab.`,
      });
    }
  }
  return events;
}

export function addReputation(s: GameState, amount: number): void {
  s.reputation = Math.max(0, Math.min(100, s.reputation + amount));
}
