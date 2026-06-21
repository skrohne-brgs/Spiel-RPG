import type { StoryEvent } from '../types';

export const STORY_EVENTS: Record<string, StoryEvent> = {

  // ── Mission 0: Eriador ────────────────────────────────────────────────────

  intro: {
    id: 'intro',
    lines: [
      { speaker: 'Gandalf',  text: 'Seid gegrüßt, Elendil – König der Überlebenden. Númenor ist versunken, aber Mittelerde braucht Euch jetzt mehr denn je.' },
      { speaker: 'Elendil',  text: 'Gandalf! Ich dachte, Ihr wäret in den Fluten verloren gegangen. Wir haben kaum überlebt...' },
      { speaker: 'Gandalf',  text: 'Ich bin schwerer zu verlieren, als man denkt. Hört mir zu: Eriador ist voller Saurons Schergen. Aber Ihr könnt es befreien.' },
      { speaker: 'Elendil',  text: 'Und dann? Unser Volk braucht ein Zuhause. Númenor ist für immer weg.' },
      { speaker: 'Gandalf',  text: 'Dann baut Eins. Gondor im Süden, Arnor im Norden. Reiche, die Saurons Schatten trotzen können.' },
      { speaker: 'Anárion',  text: 'Vater – die Orks! Sie kommen von Osten. Wir müssen uns bewegen!' },
      { speaker: 'Elendil',  text: 'Für Númenor! Für die Zukunft, die wir uns erst verdienen müssen. Vorwärts!' },
    ],
  },

  eregion: {
    id: 'eregion',
    lines: [
      { speaker: 'Elendil',  text: 'Diese Ruinen... Eregion. Hier lebten die Gwaith-i-Mírdain, die größten Handwerker unter Elben und Menschen seit dem Ersten Zeitalter.' },
      { speaker: 'Anárion',  text: 'Celebrimbor selbst wirkte hier. Die Neunzehn Ringe der Macht – die Drei für Elben, die Sieben für Zwerge, die Neun für sterbliche Könige...' },
      { speaker: 'Elendil',  text: 'Und den Einen, den Sauron allein schuf, um alle anderen zu beherrschen. Als Celebrimbor das verstand, verbarg er die Drei. Dafür starb er.' },
      { speaker: 'Anárion',  text: 'Ein grausames Mahnmal für jene, die Saurons Maske der Freundschaft trauten.' },
      { speaker: 'Elendil',  text: 'Lass es uns nie vergessen: Hinter jeder schönen Lüge Saurons verbirgt sich nur Vernichtung. Weiter.' },
    ],
  },

  forest_warning: {
    id: 'forest_warning',
    lines: [
      { speaker: 'Anárion',  text: 'Vater, die Waldränder – überall Ork-Bogenschützen. Sie haben Fallen in den Bäumen versteckt. Ein klassischer Hinterhalt.' },
      { speaker: 'Elendil',  text: 'Dann kämpfen wir klug, nicht blindlings. Unsere Waldläufer kennen solche Taktiken seit Generationen.' },
      { speaker: 'Anárion',  text: 'Diese Orks sind anders – disziplinierter als früher. Sauron hat sie trainiert. Sie lernen schnell.' },
      { speaker: 'Elendil',  text: 'Dann lernen wir schneller. Das ist der Vorteil freier Völker: Saurons Sklaven gehorchen nur Befehlen. Wir denken selbst.' },
    ],
  },

  ancient_road: {
    id: 'ancient_road',
    lines: [
      { speaker: 'Elendil',  text: 'Seht diese Straße – älter als Númenors Einfluss hier. Die Elben bauten sie im Zweiten Zeitalter, als Lindon und Eriador noch in Frieden lagen.' },
      { speaker: 'Anárion',  text: 'Sie führt direkt nach Osten. Sauron nutzt sie, um Nachschub und Truppen zu bewegen. Wer diese Straße hält, kontrolliert Eriador.' },
      { speaker: 'Elendil',  text: 'Wenn wir sie halten, zerschneiden wir seine Versorgungslinien. Eine Armee ohne Nachschub ist nur noch eine Menge.' },
      { speaker: 'Anárion',  text: 'Dann kämpfen wir für diese Straße. Für Eriador. Für alle freien Völker Mittelerdes.' },
    ],
  },

  wasteland_signs: {
    id: 'wasteland_signs',
    lines: [
      { speaker: 'Anárion',  text: 'Diese Erde... verbrannt, verwüstet bis in den tiefsten Grund. Das ist kein natürliches Ödland, Vater.' },
      { speaker: 'Elendil',  text: 'Nein. Saurons Feuer haben hier Jahrzehnte lang gewütet. Jedes versengte Feld, jeder vergiftete Brunnen – sein Werk.' },
      { speaker: 'Anárion',  text: 'Wie viele Menschen lebten hier, bevor...' },
      { speaker: 'Elendil',  text: 'Zu viele. Und das ist der Grund, warum wir nicht umkehren können. Wer dies gesehen hat und sich abwendet, ist mitschuldig.' },
      { speaker: 'Anárion',  text: 'Verstanden, Vater. Vorwärts dann – bis zum letzten Schritt.' },
    ],
  },

  mordor_border: {
    id: 'mordor_border',
    lines: [
      { speaker: 'Anárion',  text: 'Vater – die Grenze zu Mordor. Ich spüre Saurons Dunkelheit von hier aus. Wie eine Wand aus Kälte und Hoffnungslosigkeit.' },
      { speaker: 'Elendil',  text: 'Ich auch. Aber wir stehen noch. Eriador ist befreit – das allein ist ein Sieg, den viele für unmöglich hielten.' },
      { speaker: 'Gandalf',  text: 'Und es ist erst der Anfang. Die Letzte Allianz zwischen Elben und Menschen muss gebildet werden, Elendil. Die Zeit drängt.' },
      { speaker: 'Elendil',  text: 'Ich weiß, alter Freund. Gil-galad wartet auf Nachricht. Ich werde die Botschaft selbst überbringen.' },
      { speaker: 'Anárion',  text: 'Und ich bereite Gondors Gründung vor. Wir brauchen eine Festung im Süden, die Sauron trotzen kann.' },
      { speaker: 'Elendil',  text: 'So sei es. Die letzte große Allianz zwischen Elben und Menschen – unser gemeinsames Schicksal ruft uns!' },
    ],
    onComplete: 'mission_complete',
  },

  // ── Mission 1: Gondors Gründung ───────────────────────────────────────────

  gondor_intro: {
    id: 'gondor_intro',
    lines: [
      { speaker: 'Círdan',   text: 'Elendil! Die Grauen Häfen senden Euch Segenswünsche. Meine Schiffswerften stehen bereit, Truppen über den Anduin zu transportieren.' },
      { speaker: 'Elendil',  text: 'Círdan, alter Freund! Euer Timing ist – wie immer – perfekt. Wir brauchen jeden Vorteil.' },
      { speaker: 'Anárion',  text: 'Pelargir am Anduin wird unser erster Brückenkopf. Von dort marschieren wir nordwärts nach Osgiliath.' },
      { speaker: 'Círdan',   text: 'Minas Anor soll auf dem Rath Dînen erbaut werden – dem Stillen Straßen. Ein Ort von alter Macht und Würde.' },
      { speaker: 'Elendil',  text: 'Aber Gondor ist mehr als Stein und Schwert. Die Frucht des Weißen Baumes – Isildur soll sie gerettet haben. Finden wir sie zuerst.' },
      { speaker: 'Anárion',  text: 'Der Weiße Baum als Symbol Gondors! Wenn er in Minas Anor blüht, weiß ganz Mittelerde: Gondor steht.' },
    ],
  },

  gondor_complete: {
    id: 'gondor_complete',
    lines: [
      { speaker: 'Anárion',  text: 'Vater – die Frucht des Weißen Baumes! Isildur hatte sie tatsächlich durch die Flut gerettet!' },
      { speaker: 'Elendil',  text: 'Dieser kleine Samen... der einzige überlebende Sprössling des Weißen Baumes von Númenor. Gepflanzt im Garten Minas Anors, wird Gondor für immer mit unserer alten Heimat verbunden sein.' },
      { speaker: 'Anárion',  text: 'Gondor ist gegründet. Nicht nur durch Stein und Schwert – sondern durch diesen lebenden Beweis unseres Erbes.' },
      { speaker: 'Círdan',   text: 'Möge der Baum jahrhundertelang blühen. Gondor wird stärker sein als Númenor, denn Ihr tragt die Lehren seiner Fehler in Euren Herzen.' },
      { speaker: 'Elendil',  text: 'Nun müssen wir die Bergpässe sichern. Moria und die Nebelberge trennen Gondor von Arnor. Dieser Weg muss offen sein.' },
    ],
    onComplete: 'mission_complete',
  },

  // ── Mission 2: Moria ──────────────────────────────────────────────────────

  moria_intro: {
    id: 'moria_intro',
    lines: [
      { speaker: 'Círdan',   text: 'Ich muss Euch warnen, Elendil. Alte Aufzeichnungen der Grauen Häfen berichten von etwas Uraltem in den Tiefen Morias. Etwas, das schläft – aber nicht für immer.' },
      { speaker: 'Elendil',  text: 'Dann wecken wir es nicht. Aber wir brauchen diesen Durchgang – Gondor und Arnor müssen verbunden sein.' },
      { speaker: 'Anárion',  text: 'Die Zwerge haben Khazad-dûm verlassen. Die Gänge stehen leer... außer vor Orks, Trollen und dem, was Círdan beschreibt.' },
      { speaker: 'Elendil',  text: 'Orks und Trolle kennen wir. Durch Moria marschieren wir und räumen es. Wir wecken die Dunkelheit nicht.' },
      { speaker: 'Círdan',   text: 'Seid vorsichtig, Elendil. Und beeilt Euch. Manche Tiefen sollten lieber im Dunkeln bleiben.' },
      { speaker: 'Anárion',  text: 'Durch Moria dann. Und möge das Unaussprechliche schlafen.' },
    ],
  },

  moria_boss_defeated: {
    id: 'moria_boss_defeated',
    lines: [
      { speaker: 'Anárion',  text: 'Der Ausgangs-Wächter ist gefallen! Der Ostausgang liegt offen!' },
      { speaker: 'Elendil',  text: 'Vorwärts! Licht wartet auf der anderen Seite der Berge. Beeilen wir uns.' },
      { speaker: 'Círdan',   text: 'Gut gemacht. Und das Ding in der Tiefe... es schläft noch. Heute war nicht sein Tag.' },
      { speaker: 'Anárion',  text: 'Dann beeilen wir uns, bevor es aufwacht. Zum Ostausgang!' },
    ],
  },

  moria_complete: {
    id: 'moria_complete',
    lines: [
      { speaker: 'Elendil',  text: 'Der Bergpass ist frei! Gondor und Arnor können nun miteinander kommunizieren – das Reich steht auf zwei Säulen.' },
      { speaker: 'Círdan',   text: 'Ich kehre zu den Grauen Häfen zurück. Aber meine Schiffe bleiben bereit, Elendil – für den Tag, an dem die Letzte Allianz aufgerufen wird.' },
      { speaker: 'Anárion',  text: 'Wir werden sie brauchen. Die Ostlande sind noch in Saurons Händen. Rhûn muss gebrochen werden, bevor wir ihn selbst angreifen.' },
      { speaker: 'Elendil',  text: 'Habt Dank, Círdan. Eure Freundschaft ist Gondors größtes Gut – wertvoller als Mithril.' },
      { speaker: 'Círdan',   text: 'Mittelerde vergisst nie seine wahren Freunde. Möge das Licht Euch leiten, wohin auch immer Ihr geht.' },
    ],
    onComplete: 'mission_complete',
  },

  // ── Mission 3: Rhûn ───────────────────────────────────────────────────────

  rhun_intro: {
    id: 'rhun_intro',
    lines: [
      { speaker: 'Gandalf',  text: 'Ah, Elendil! Ich habe die Ostlande bereist. Die Easterlings sind tief in Saurons Bann gefallen – aber nicht alle aus freiem Willen.' },
      { speaker: 'Elendil',  text: 'Manche kämpfen aus Angst, nicht aus Überzeugung?' },
      { speaker: 'Gandalf',  text: 'Ja. Das Zepter des Rhûn-Königs bindet die Stammesführer an Saurons Willen – ein verfluchtes Artefakt von großer Macht. Wir müssen es finden.' },
      { speaker: 'Anárion',  text: 'Zerbrechen? Oder behalten?' },
      { speaker: 'Gandalf',  text: 'Behalten, für den Moment. Als Symbol. Wer das Zepter hält, hält die Loyalität der Stämme. Es kann ein Werkzeug der Befreiung sein.' },
      { speaker: 'Elendil',  text: 'Dann suchen wir es. Wenn wir das Zepter haben, marschieren wir zur Zitadelle und brechen Saurons Griff auf Rhûn.' },
      { speaker: 'Gandalf',  text: 'Genau so. Viel Erfolg – und haltet Augen und Ohren offen. Nicht alle Easterlings sind Feinde.' },
    ],
  },

  rhun_artifact_found: {
    id: 'rhun_artifact_found',
    lines: [
      { speaker: 'Anárion',  text: 'Das Zepter des Rhûn-Königs! Gandalf hatte recht – es strahlt eine merkwürdige, alte Macht aus.' },
      { speaker: 'Elendil',  text: 'Ich spüre es auch. Saurons Fluch liegt auf ihm, aber darunter... ein alter Eid der Treue. Dieser Eid gehört nun uns.' },
      { speaker: 'Gandalf',  text: 'Gut gefunden, Elendil! Zeigt es der Zitadelle – die Stammesführer werden erkennen, dass die alte Ordnung gebrochen ist.' },
      { speaker: 'Anárion',  text: 'Dann marschieren wir zur Zitadelle. Mit dem Zepter in der Hand können wir Rhûn befreien, ohne jeden Mann zu töten.' },
      { speaker: 'Elendil',  text: 'Zum Zepter! Zur Zitadelle! Vorwärts!' },
    ],
  },

  rhun_complete: {
    id: 'rhun_complete',
    lines: [
      { speaker: 'Anárion',  text: 'Rhûn-Zitadelle ist gefallen! Die Easterlings legen ihre Waffen nieder!' },
      { speaker: 'Gandalf',  text: 'Gut. Die meisten wollten nie für Sauron kämpfen – sein Fluch zwang sie. Ohne Zepter und ohne seinen Willen sind viele von ihnen frei.' },
      { speaker: 'Elendil',  text: 'Frieden oder Allianz?' },
      { speaker: 'Gandalf',  text: 'Frieden zunächst. Manche werden sich uns sogar anschließen, wenn sie sehen, was wir tun – Sauron selbst bezwingen.' },
      { speaker: 'Anárion',  text: 'Barad-dûr. Das Schwarze Tor. Wir marschieren auf Mordor zu.' },
      { speaker: 'Gandalf',  text: 'Ich war noch nie so froh über einen Marsch in die Dunkelheit. Dies ist unser Schicksal, Elendil. Die Letzte Allianz wartet.' },
    ],
    onComplete: 'mission_complete',
  },

  // ── Mission 4: Die Letzte Allianz ─────────────────────────────────────────

  mordor_siege_intro: {
    id: 'mordor_siege_intro',
    lines: [
      { speaker: 'Elendil',  text: 'Hier stehen wir. Vor den Toren Mordors selbst. Barad-dûr ragt am Horizont wie ein Fluch, in Stein gehauen.' },
      { speaker: 'Gandalf',  text: 'Die Letzte Allianz ist vollzählig. Gil-galad und seine Elben stehen bereit. Menschen und Elben Seite an Seite – zum ersten Mal seit dem Ersten Zeitalter.' },
      { speaker: 'Círdan',   text: 'Ich habe meine besten Krieger aus den Grauen Häfen gesandt. Sie kämpfen nicht nur für Elendil – sie kämpfen für Mittelerde.' },
      { speaker: 'Anárion',  text: 'Vater... sollten wir Angst haben?' },
      { speaker: 'Elendil',  text: 'Ja. Aber die Angst zeigt, dass wir noch fühlen. Saurons Sklaven fühlen nichts mehr. Das ist unser Vorteil.' },
      { speaker: 'Gandalf',  text: 'Vorwärts dann. Für alle, die für diese Stunde gestorben sind. Für Númenor. Für Mittelerde!' },
    ],
  },

  mordor_boss_defeated: {
    id: 'mordor_boss_defeated',
    lines: [
      { speaker: 'Anárion',  text: 'Saurons Leutnant ist gefallen! Der Weg zu Barad-dûr selbst liegt offen!' },
      { speaker: 'Gandalf',  text: 'Gut gekämpft. Aber eilt Euch – Sauron hat die Niederlage gespürt. Er wird seinen Turm persönlich verteidigen.' },
      { speaker: 'Elendil',  text: 'Dann stürmen wir ihn, bevor er Verstärkung schicken kann. Für alle, die hier gefallen sind!' },
      { speaker: 'Círdan',   text: 'Und dies ist der Moment, für den die Allianz gebildet wurde. Vorwärts – bis zum Ende!' },
    ],
  },

  baradur_victory: {
    id: 'baradur_victory',
    lines: [
      { speaker: 'Anárion',  text: 'Vater – Barad-dûr wankt! Saurons Turm zerbricht unter unserem Ansturm!' },
      { speaker: 'Elendil',  text: 'Gil-galad, der Hochkönig der Elben, kämpft an unserer Seite. Heute ist der Tag, den wir alle herbeigesehnt haben!' },
      { speaker: 'Gandalf',  text: 'Der Eine Ring muss noch vernichtet werden, wenn Saurons Macht wirklich gebrochen sein soll. Doch selbst ohne ihn – dieser Sieg ist immens.' },
      { speaker: 'Círdan',   text: 'Mögen die Meere ruhig bleiben und die Sterne über Mittelerde leuchten. Dieser Tag gehört den freien Völkern.' },
      { speaker: 'Anárion',  text: 'Saurons Körper ist zerstört. Sein Geist flieht...' },
      { speaker: 'Elendil',  text: 'Mittelerde ist frei. Dies ist unser größter Sieg – und unser größtes Opfer. Möge dieses Zeitalter in Frieden enden, damit das nächste in Hoffnung beginnt.' },
    ],
    onComplete: 'victory',
  },

  // ── Lore-Sammlerstücke ────────────────────────────────────────────────────

  lore_eriador_edain: {
    id: 'lore_eriador_edain',
    lines: [
      { speaker: 'Stein der Edain', text: 'Hier stand einst ein Dorf der Edain – der sterblichen Verbündeten der Elben im Ersten Zeitalter. Sie folgten Elros nach Númenor. Ihre Nachfahren kehren jetzt zurück.' },
      { speaker: 'Anárion', text: 'Dieser Ort erinnert uns: Wir sind nicht nur Flüchtlinge. Wir sind Nachfahren der größten Helden, die je lebten. Das verpflichtet.' },
    ],
  },

  lore_eriador_road: {
    id: 'lore_eriador_road',
    lines: [
      { speaker: 'Alter Wegstein', text: 'Diese Straße wurde von Tar-Aldarion erbaut, dem siebten König Númenors, der Mittelerde selbst bereiste. Ein König, der nicht regierte, sondern entdeckte.' },
      { speaker: 'Elendil', text: 'Tar-Aldarion... er war der Erste, der Wege hier anlegte. Auf seinen Spuren marschieren wir heute, um das zu vollenden, was er begann.' },
    ],
  },

  lore_gondor_anduin: {
    id: 'lore_gondor_anduin',
    lines: [
      { speaker: 'Marmorinschrift', text: 'Der Anduin – der Große Fluss, Grenze und Verbindung zugleich. Seit dem Ersten Zeitalter war er die Lebensader des westlichen Mittelerdes. Kein Reich kann ohne ihn bestehen.' },
      { speaker: 'Anárion', text: 'Und Gondor wird auf beiden Ufern stehen. Osgiliath verbindet West und Ost – solange der Anduin fließt, fließt auch das Leben Gondors.' },
    ],
  },

  lore_gondor_camp: {
    id: 'lore_gondor_camp',
    lines: [
      { speaker: 'Eingravierte Inschrift', text: '"Wir kamen aus dem Westen mit Feuer und Flut im Rücken. Dieses Land sei unser Erbe und unsere Pflicht. – Isildur und Anárion, Söhne Elendils"' },
      { speaker: 'Elendil', text: 'Sie haben das hier eingraviert, bevor ich ankam. Meine Söhne haben bereits angefangen, Geschichte zu schreiben. Dafür bin ich stolz.' },
    ],
  },

  lore_moria_khazad: {
    id: 'lore_moria_khazad',
    lines: [
      { speaker: 'Zwerg-Inschrift', text: 'Die Runen lauten: "Hier schufen die Kinder Aulës in sieben Jahren Arbeit den Großen Saal. Möge Durin, Vater aller Zwerge, über diese Hallen wachen, solange Stein besteht."' },
      { speaker: 'Anárion', text: 'Die Zwerge haben hier Jahrhunderte gelebt. Jetzt sind sie weg und Orks bewohnen ihre Hallen. Es ist ein trauriger Ort geworden.' },
    ],
  },

  lore_moria_scroll: {
    id: 'lore_moria_scroll',
    lines: [
      { speaker: 'Zerrissene Schriftrolle', text: '"...die Mithril-Ader versiegt nicht. Aber etwas in der Tiefe rührt sich. Balin sagt, wir sollen tiefer graben. Ich fürchte, was wir wecken könnten..."' },
      { speaker: 'Elendil', text: 'Diese Worte wurden geschrieben, bevor die Zwerge flohen. Was immer sie weckten, schläft heute noch – und wir gehen nicht tiefer als nötig.' },
    ],
  },

  lore_rhun_steppe: {
    id: 'lore_rhun_steppe',
    lines: [
      { speaker: 'Fremdartige Inschrift', text: 'Eine Übersetzung aus dem Rhûnic vermutlich: "Sauron hat uns Macht versprochen. Aber Macht kostet ihren Preis – unsere Kinder haben ihn bezahlt. Wer liest dies und befreit uns?"' },
      { speaker: 'Anárion', text: 'Jemand unter den Easterlings wollte, dass jemand diese Worte findet. Vielleicht sind nicht alle verloren.' },
    ],
  },

  lore_rhun_wasteland: {
    id: 'lore_rhun_wasteland',
    lines: [
      { speaker: 'Zerbrochene Figur', text: 'Eine Statuette – halb Mensch, halb Drache. Symbol eines alten Kultes der Easterlings, bevor Sauron ihre Religion durch seinen eigenen Willen ersetzte.' },
      { speaker: 'Gandalf', text: 'Was glaubten sie einmal, bevor die Dunkelheit kam? Diese Figur ist älter als Saurons Einfluss hier. Mittelerde war einmal ein freier Ort – und kann es wieder werden.' },
    ],
  },

  lore_mordor_edict: {
    id: 'lore_mordor_edict',
    lines: [
      { speaker: 'Schwarzes Edikt', text: '"Wer umkehrt, stirbt. Wer siegreich ist, bekommt, was er wünscht. Wer zweifelt, ist bereits verloren." – So spricht Sauron zu seinen Dienern.' },
      { speaker: 'Elendil', text: 'Die Logik eines Tyrannen, der nicht an Loyalität glaubt – nur an Angst. Solche Reiche brechen, wenn die Angst schwindet. Heute schwingen wir den Hammer.' },
    ],
  },

  lore_mordor_elbereth: {
    id: 'lore_mordor_elbereth',
    lines: [
      { speaker: 'Elfische Inschrift', text: 'In Tengwar: "A Elbereth Gilthoniel – möge dein Sternenlicht auch in diese Dunkelheit scheinen. Wir sind noch hier." Signiert: Gil-galads Späher, Zweites Zeitalter.' },
      { speaker: 'Anárion', text: 'Elben haben auch in Mordors Dunkelheit die Hoffnung nicht verloren. Das gibt mir Kraft. Wir vollenden heute, was sie begannen.' },
    ],
  },

  // ── Kampf-Events ──────────────────────────────────────────────────────────

  combat_win: {
    id: 'combat_win',
    lines: [
      { speaker: 'Elendil',  text: 'Saurons Krieger fallen vor uns zurück. Númenórs Erben kämpfen noch!' },
      { speaker: 'Anárion',  text: 'Gut gekämpft, Männer! Jeder Feind, den wir besiegen, ist ein Schritt näher zum endgültigen Sieg.' },
      { speaker: 'Elendil',  text: 'Versorgt die Verwundeten. Dann weiter – die Mission wartet nicht.' },
    ],
  },

  combat_lose: {
    id: 'combat_lose',
    lines: [
      { speaker: 'Anárion',  text: 'Wir wurden überwältigt – Rückzug, Vater! Jetzt!' },
      { speaker: 'Elendil',  text: 'Ein verlorener Kampf ist keine verlorene Allianz. Wir sammeln unsere Kräfte neu.' },
      { speaker: 'Anárion',  text: 'Aber die Männer... sie haben alles gegeben.' },
      { speaker: 'Elendil',  text: 'Sie haben sich geopfert, damit wir entkommen konnten. Lass ihr Opfer nicht umsonst sein. Wir kommen zurück.' },
    ],
    onComplete: 'gameover',
  },
};
