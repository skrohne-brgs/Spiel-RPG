import Phaser from 'phaser';
import { getCity } from '../data/cities';
import type { GameState } from '../state';
import type { GameEvent } from './events';
import { companyValue } from './milestones';
import { addReputation } from './politics';

// Familie als Nebenschauplatz: gelegentliche Ereignisse (Begegnung,
// Brautwerbung, Hochzeit, Kinder) mit kleinen dauerhaften Boni –
// kein eigenes Spielsystem.
export interface FamilyState {
  spouse: string | null;
  courting: { name: string; monthsLeft: number } | null;
  children: string[];
}

const PARTNERS = [
  'Sibylla Artzt', 'Ursula Meuting', 'Barbara Bäsinger', 'Clara Vöhlin',
  'Anton Lauginger', 'Veronika Gassner', 'Felicitas Rehlinger',
];

const CHILD_NAMES = [
  'Anna', 'Georg', 'Ulrich', 'Katharina', 'Jakob', 'Regina',
  'Raymund', 'Veronika', 'Hieronymus', 'Sibylla',
];

export function createFamily(): FamilyState {
  return { spouse: null, courting: null, children: [] };
}

const COURTSHIP_GIFT = 200;
const DOWRY = 800;

export function checkFamily(s: GameState): GameEvent[] {
  const events: GameEvent[] = [];
  const f = s.family;

  // Begegnung: ab 1496, mit etwas Ansehen und Vermögen.
  if (
    !f.spouse && !f.courting && s.year >= 1496 &&
    companyValue(s) >= 2000 && Math.random() < 0.06
  ) {
    const name = Phaser.Math.RND.pick(PARTNERS);
    const city = getCity(s.cityId).name;
    events.push({
      title: 'Eine Begegnung',
      text: `Auf dem Stadtfest zu ${city} begegnest du\n${name} – klug, wohlhabend und von gutem Namen.\nEin Werben verlangt Geschenke und Geduld.`,
      choices: [
        {
          label: `Um ${name} werben (${COURTSHIP_GIFT} fl.)`,
          enabled: s.gold >= COURTSHIP_GIFT,
          apply: (st) => {
            st.gold -= COURTSHIP_GIFT;
            st.family.courting = { name, monthsLeft: 3 };
          },
        },
        { label: 'Höflich bleiben' },
      ],
    });
    return events;
  }

  // Brautwerbung läuft: nach drei Monaten die Hochzeit.
  if (f.courting) {
    f.courting.monthsLeft -= 1;
    if (f.courting.monthsLeft <= 0) {
      const name = f.courting.name;
      f.courting = null;
      f.spouse = name;
      s.gold += DOWRY;
      addReputation(s, 10);
      events.push({
        title: 'Hochzeit!',
        text: `Ganz Augsburg feiert deine Vermählung mit ${name}.\nDie Mitgift bringt ${DOWRY} fl., dein Ansehen wächst –\nund dein Ehepartner führt fortan das Augsburger Kontor.`,
      });
    }
    return events;
  }

  // Kinder: verheiratet, bis zu vier, seltenes Ereignis.
  if (f.spouse && f.children.length < 4 && Math.random() < 0.025) {
    const name = Phaser.Math.RND.pick(
      CHILD_NAMES.filter((n) => !f.children.includes(n)),
    );
    f.children.push(name);
    addReputation(s, 2);
    const isFirst = f.children.length === 1;
    events.push({
      title: 'Ein Kind ist geboren',
      text: `${f.spouse} schenkt ${isFirst ? 'euch das erste Kind' : 'euch ein weiteres Kind'}:\n${name} Fugger. Die Zukunft des Hauses ist gesichert.`,
    });
  }

  return events;
}
