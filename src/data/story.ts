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
    onComplete: 'mission_complete',
  },

  gondor_complete: {
    id: 'gondor_complete',
    lines: [
      { speaker: 'Anárion', text: 'Minas Anor ist unser! Die weiße Stadt steht als Leuchtfeuer des Südens.' },
      { speaker: 'Elendil', text: 'Gondor ist gegründet. Doch Sauron ruht nicht. Wir müssen die Bergpässe sichern.' },
      { speaker: 'Anárion', text: 'Moria... der Weg durch das Misty Mountains wird gefährlich sein.' },
      { speaker: 'Elendil', text: 'Dann bereiten wir uns vor. Das Reich Gondors muss ausgedehnt werden – oder fallen.' },
    ],
    onComplete: 'mission_complete',
  },

  moria_complete: {
    id: 'moria_complete',
    lines: [
      { speaker: 'Elendil', text: 'Der Bergpass ist frei! Unsere Truppen können nun zwischen Gondor und Arnor marschieren.' },
      { speaker: 'Anárion', text: 'Die Dunkelheit in Moria war tiefer als erwartet. Etwas Altes schläft dort noch.' },
      { speaker: 'Elendil', text: 'Wir wecken es nicht. Der Weg nach Osten liegt offen – die Ostlande rufen uns.' },
      { speaker: 'Anárion', text: 'Rhûn. Die Verbündeten Saurons müssen gebrochen werden, bevor wir ihn selbst angreifen.' },
    ],
    onComplete: 'mission_complete',
  },

  rhun_complete: {
    id: 'rhun_complete',
    lines: [
      { speaker: 'Anárion', text: 'Die Zitadelle von Rhûn ist gefallen! Die Ostlande sind frei vom Schatten.' },
      { speaker: 'Elendil', text: 'Saurons rechte Hand ist gebrochen. Nun müssen wir das Haupt selbst abschlagen.' },
      { speaker: 'Anárion', text: 'Barad-dûr. Das Schwarze Tor. Wir marschieren auf Mordor selbst zu.' },
      { speaker: 'Elendil', text: 'Die Letzte Allianz ist vollzählig. Elben und Menschen Seite an Seite. Dies ist unser Schicksal.' },
    ],
    onComplete: 'mission_complete',
  },

  baradur_victory: {
    id: 'baradur_victory',
    lines: [
      { speaker: 'Anárion', text: 'Vater – Barad-dûr wankt! Saurons Turm zerbricht unter unserem Ansturm!' },
      { speaker: 'Elendil', text: 'Gil-galad, der Hochkönig der Elben, kämpft an unserer Seite. Heute endet Saurons Herrschaft!' },
      { speaker: 'Anárion', text: 'Der Eine Ring... er muss vernichtet werden, um ihn für immer zu binden!' },
      { speaker: 'Elendil', text: 'Mittelerde ist frei. Die Letzte Allianz hat gesiegt. Dies ist unser größter Sieg – und unser größtes Opfer. Möge dieses Zeitalter in Frieden enden.' },
    ],
    onComplete: 'victory',
  },

  gondor_intro: {
    id: 'gondor_intro',
    lines: [
      { speaker: 'Elendil', text: 'Eriador ist gesichert. Nun müssen wir Gondor errichten – das südliche Reich der Númenórer.' },
      { speaker: 'Anárion', text: 'Pelargir am Anduin wird unser erster Brückenkopf. Von dort marschieren wir nach Norden.' },
      { speaker: 'Elendil', text: 'Minas Anor soll unsere Hauptfestung sein. Wenn diese Stadt steht, steht Gondor.' },
      { speaker: 'Anárion', text: 'Für Gondor! Für das Erbe Númenors!' },
    ],
  },

  moria_intro: {
    id: 'moria_intro',
    lines: [
      { speaker: 'Elendil', text: 'Die Caradhras-Pässe sind von Feinden blockiert. Wir müssen durch das Gebirge.' },
      { speaker: 'Anárion', text: 'Durch Moria? Die alten Minen der Zwerge... man sagt, dort lebt nichts mehr.' },
      { speaker: 'Elendil', text: 'Gerüchte. Wir brauchen diesen Durchgang, um Ost und West zu verbinden.' },
      { speaker: 'Anárion', text: 'Dann führe uns durch, Vater. Aber auf der Hut sein – Dunkelheit birgt Überraschungen.' },
    ],
  },

  rhun_intro: {
    id: 'rhun_intro',
    lines: [
      { speaker: 'Elendil', text: 'Im Osten, hinter den Nebelmbergen, liegt Rhûn – das Land der Easterlings, Saurons treue Verbündete.' },
      { speaker: 'Anárion', text: 'Sie liefern ihm Krieger und Ressourcen. Solange Rhûn fällt, bleibt Sauron gestärkt.' },
      { speaker: 'Elendil', text: 'Dann brechen wir seine Lieferkette. Die Easterlings müssen spüren, dass die Allianz Stärke hat.' },
      { speaker: 'Anárion', text: 'Nach Rhûn dann. Und möge ihr Zitadelle fallen.' },
    ],
  },

  mordor_siege_intro: {
    id: 'mordor_siege_intro',
    lines: [
      { speaker: 'Elendil', text: 'Dies ist es, mein Sohn. Vor uns liegen die Tore Mordors. Barad-dûr selbst.' },
      { speaker: 'Anárion', text: 'Das Ödland... die Luft brennt in den Lungen. Saurons Wille liegt schwer auf diesem Land.' },
      { speaker: 'Elendil', text: 'Aber wir stehen hier. Elendil, Anárion, Gil-galad – die Letzte Allianz in Vollzahl.' },
      { speaker: 'Anárion', text: 'Vorwärts! Für alle, die für diese Stunde gekämpft haben. Wir brechen Saurons Turm!' },
    ],
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
