import type { StoryEvent } from '../types';

export const STORY_EVENTS: Record<string, StoryEvent> = {
  intro: {
    id: 'intro',
    lines: [
      { speaker: 'Elendil', text: 'Wir haben überlebt. Númenor ist versunken, aber unser Volk lebt noch.' },
      { speaker: 'Anárion', text: 'Vater... Saurons Schergen streifen bereits durch Eriador. Sein Schatten wächst.' },
      { speaker: 'Elendil', text: 'Dann werden wir ihn zurückdrängen. Wir errichten Gondor und Arnor – unsere Reiche werden stark sein. Doch zuerst müssen wir den Weg nach Osten sichern.' },
      { speaker: 'Anárion', text: 'Ich stehe an Eurer Seite, Vater. Bis zum Ende.' },
    ],
  },
  eregion: {
    id: 'eregion',
    lines: [
      { speaker: 'Elendil', text: 'Diese Ruinen... das ist Eregion. Hier lebten die Gwaith-i-Mírdain, die Meisterhandwerker der Elben.' },
      { speaker: 'Anárion', text: 'Celebrimbor hat hier die Ringe der Macht geschmiedet. Sauron hat ihn betrogen und diesen Ort danach vernichtet.' },
      { speaker: 'Elendil', text: 'Ein Mahnmal für alle, die Saurons Täuschung trauten. Wir werden diesen Fehler nicht wiederholen.' },
      { speaker: 'Anárion', text: 'Vorwärts dann – Mordor liegt noch im Osten.' },
    ],
  },
  mordor_border: {
    id: 'mordor_border',
    lines: [
      { speaker: 'Anárion', text: 'Vater – dort liegt Mordor. Ich spüre Saurons Dunkelheit von hier aus.' },
      { speaker: 'Elendil', text: 'Wir sind nicht stark genug, allein gegen ihn zu kämpfen. Wir brauchen die Elben.' },
      { speaker: 'Anárion', text: 'Gil-galad wird uns nicht alleinlassen. Die Letzte Allianz... sie muss gebildet werden.' },
      { speaker: 'Elendil', text: 'Eriador ist befreit. Kehrt heim, mein Sohn. Wir haben Boten zu senden und Könige zu überzeugen. Die letzte große Allianz zwischen Elben und Menschen wird Saurons Herrschaft brechen!' },
    ],
    onComplete: 'victory',
  },
  combat_win: {
    id: 'combat_win',
    lines: [
      { speaker: 'Elendil', text: 'Der Feind weicht zurück. Númenórs Erben kämpfen noch.' },
    ],
  },
  combat_lose: {
    id: 'combat_lose',
    lines: [
      { speaker: 'Anárion', text: 'Wir wurden überwältigt... Rückzug, Vater!' },
      { speaker: 'Elendil', text: 'Wir müssen unsere Kräfte neu sammeln.' },
    ],
    onComplete: 'gameover',
  },
};
