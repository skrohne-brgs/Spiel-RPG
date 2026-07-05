import { GOODS } from '../data/goods';
import type { GameState } from '../state';
import type { GameEvent } from './events';

// Firmenwert = Bargeld + Warenwert (zu Basispreisen bewertet).
export function companyValue(s: GameState): number {
  let value = s.gold;
  for (const good of GOODS) {
    value += (s.cargo[good.id] ?? 0) * good.basePrice;
  }
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
