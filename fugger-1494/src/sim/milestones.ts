import { getGood } from '../data/goods';
import { getBuilding } from '../data/buildings';
import {
  WAREHOUSE_COST, WAREHOUSE_STEP, WAREHOUSE_UPGRADE_COST, WAGON_COST,
} from '../constants';
import { stockValue } from '../state';
import type { GameState } from '../state';
import type { GameEvent } from './events';

// Firmenwert = Bargeld + alle Waren (Wagen, Lager, Manufakturen, Fuhrwerke)
// zu Basispreisen + Kaufwert von Manufakturen, Lagern und Fuhrwerken.
export function companyValue(s: GameState): number {
  let value = s.gold + stockValue(s.cargo);
  for (const [id, b] of Object.entries(s.buildings)) {
    const def = getBuilding(id);
    value += def.cost + b.output * getGood(def.outputGood).basePrice + stockValue(b.input);
  }
  for (const w of Object.values(s.warehouses)) {
    const steps = w.capacity / WAREHOUSE_STEP;
    value += WAREHOUSE_COST + (steps - 1) * WAREHOUSE_UPGRADE_COST + stockValue(w.stock);
  }
  for (const w of s.wagons) {
    value += WAGON_COST + stockValue(w.cargo);
  }
  for (const loan of s.loans) value += loan.amount;
  value -= s.debt;
  return Math.round(value);
}

interface Milestone {
  id: string;
  when(s: GameState): boolean;
  event: GameEvent;
  apply?(s: GameState): void;
}

function dateReached(s: GameState, year: number, month: number): boolean {
  return s.year > year || (s.year === year && s.month >= month);
}

const MILESTONES: Milestone[] = [
  {
    id: 'worms1495',
    when: (s) => dateReached(s, 1495, 7), // August 1495
    event: {
      title: 'Reichstag zu Worms',
      text: 'König Maximilian verkündet den Ewigen Landfrieden.\nFehden sind fortan verboten – die Straßen\nwerden sicherer für deine Wagenzüge.',
    },
    apply: (s) => {
      s.flags.landfriede = true;
    },
  },
  {
    id: 'indien1499',
    when: (s) => dateReached(s, 1499, 8), // September 1499
    event: {
      title: 'Seeweg nach Indien!',
      text: 'Vasco da Gama ist nach Lissabon zurückgekehrt –\nmit Schiffen voller Pfeffer. Die Gewürzpreise\nin Lissabon brechen ein.',
    },
    apply: (s) => {
      s.market['lissabon']['gewuerze'] = 0.4;
    },
  },
  {
    id: 'kredit1',
    when: (s) => s.flags.kreditVergeben === true,
    event: {
      title: 'Bankier der Fürsten',
      text: 'Zum ersten Mal leiht dein Haus einem Fürsten Geld.\nWer den Mächtigen Kredit gibt, dem öffnen sich Türen –\nund wer weiß, was sie eines Tages als Pfand bieten.',
    },
  },
  {
    id: 'wert1000',
    when: (s) => companyValue(s) >= 1000,
    event: {
      title: 'Angesehener Kaufmann',
      text: 'Dein Firmenwert übersteigt 1.000 Gulden.\nIn den Kontoren Augsburgs nennt man\ndeinen Namen mit Respekt.',
    },
  },
  {
    id: 'wert5000',
    when: (s) => companyValue(s) >= 5000,
    event: {
      title: 'Handelsherr',
      text: 'Dein Firmenwert übersteigt 5.000 Gulden.\nDie Zünfte hören auf dein Wort,\nund Fürsten grüßen zuerst.',
    },
  },
  {
    id: 'wert25000',
    when: (s) => companyValue(s) >= 25000,
    event: {
      title: '„Der Reiche“',
      text: 'Dein Firmenwert übersteigt 25.000 Gulden.\nGanz Europa spricht von dir, wie einst\nvon Jakob Fugger dem Reichen.',
    },
  },
];

// Prüft alle noch nicht ausgelösten Meilensteine; gibt fällige Events zurück.
export function checkMilestones(s: GameState): GameEvent[] {
  const fired: GameEvent[] = [];
  for (const m of MILESTONES) {
    if (s.milestones.includes(m.id)) continue;
    if (!m.when(s)) continue;
    s.milestones.push(m.id);
    m.apply?.(s);
    fired.push(m.event);
  }
  return fired;
}
