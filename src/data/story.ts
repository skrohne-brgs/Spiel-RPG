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

  forest_warning: {
    id: 'forest_warning',
    lines: [
      { speaker: 'Anárion', text: 'Vater, die Waldränder – sie sind voller feindlicher Späher. Die Orks haben Bogenschützen in den Bäumen positioniert.' },
      { speaker: 'Elendil', text: 'Dann halten wir die Augen offen. Ein Hinterhalt im Wald ist keine Niederlage – wenn wir vorbereitet sind.' },
      { speaker: 'Anárion', text: 'Unsere Waldläufer haben mehr Erfahrung als diese Orks. Wir kämpfen uns durch.' },
    ],
  },

  ancient_road: {
    id: 'ancient_road',
    lines: [
      { speaker: 'Elendil', text: 'Seht ihr das, mein Sohn? Diese Straße ist alt – älter als Númenors Einfluss in Mittelerde. Hier marschierten einst die Heere der Elben.' },
      { speaker: 'Anárion', text: 'Sie führt direkt nach Osten. Wenn Saurons Kräfte diese Route halten, schneiden sie uns von den Bergpässen ab.' },
      { speaker: 'Elendil', text: 'Dann müssen wir sie zurückerobern. Diese Straße gehört wieder den freien Völkern Mittelerdes.' },
    ],
  },

  wasteland_signs: {
    id: 'wasteland_signs',
    lines: [
      { speaker: 'Anárion', text: 'Diese Erde... verbrannt, verwüstet. Das ist kein natürliches Ödland. Saurons Feuer haben hier gewütet.' },
      { speaker: 'Elendil', text: 'Ja. Das Ödland erstreckt sich bis zu den Toren Mordors. Jedes versengte Feld ist ein weiteres Opfer seines Willens.' },
      { speaker: 'Anárion', text: 'Und dennoch marschieren wir weiter. Weil jemand es tun muss.' },
      { speaker: 'Elendil', text: 'Das ist die Last der Númenórer, mein Sohn. Wir sind nicht nur Überlebende – wir sind Beschützer dieser Welt.' },
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
