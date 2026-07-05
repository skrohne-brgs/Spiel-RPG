# Handelssimulation "Fugger" — Konzeptplan

Neuauflage der klassischen Handelssimulationen (z.B. *1869*/*1848*, Rainbow Arts) im
Setting der Augsburger Fugger-Dynastie (ca. 1490–1560). Zielrichtung laut Klärung:

- **Setting**: Fugger-Ära ist das Hauptsetting (nicht 19. Jh.) — die aus den
  1869-artigen Spielen bekannten Mechaniken (Routen, Marktpreise, Konkurrenz,
  Lagerhaltung) werden auf Renaissance-Handel übertragen.
- **Umfang**: Handelsrouten & Marktpreise, Produktionsketten, Bankwesen &
  Politik, Diplomatie & Konkurrenz-KI — alle vier Säulen sind gewünscht.
- **Repo**: Eigenständiges, neues Repository (nicht Teil des Mittelerde-RPGs
  in diesem Repo). Dieses Dokument ist der Design-/Startplan dafür.

## 1. Elevator Pitch

Du übernimmst um 1490 ein kleines Augsburger Handelshaus und baust es — wie
einst Jakob Fugger "der Reiche" — zum größten Wirtschafts- und Finanzimperium
Europas aus: Warenrouten zwischen Augsburg, Venedig, Antwerpen, Lissabon und
den Tiroler/Ungarischen Bergwerken, veredelte Produktionsketten, Kredite an
Kaiser und Fürsten, und politischer Einfluss bis zur Kaiserwahl 1519.

## 2. Historischer Rahmen (Rechercheanker, kein Faktencheck-Ersatz)

- **Jakob Fugger** baute ein Handels- und Bankhaus mit Sitz Augsburg auf,
  finanzierte die Habsburger (Maximilian I., später Karl V.) und sicherte sich
  im Gegenzug Bergbaumonopole (Kupfer/Silber in Tirol und Ungarn/Slowakei).
- Die **Kaiserwahl 1519** (Fugger finanziert Karls V. Wahlbestechung gegen
  Franz I.) ist ein starkes, spielbares Set-Piece / Meilenstein-Event.
- Weitere Handelshäuser der Zeit als Konkurrenten: **Welser** (Augsburg),
  **Medici** (Florenz), **Hanse**-Städte im Norden.
- Innovation der Fugger: frühe **Wechselbriefe** (Bills of Exchange) und
  ein eigenes Nachrichten-/Kurier-Netzwerk (Vorläufer der Fuggerzeitungen) —
  spielbar als "Marktinformations"-Mechanik (Preise anderer Städte erst mit
  Verzögerung/Kosten sichtbar, außer man investiert ins Kuriernetz).
- Die **Fuggerei** (1521 gestiftete Sozialsiedlung) eignet sich als
  Spätspiel-/Reputationsmechanik ("Vermächtnis" statt reinem Profit).

→ Diese Punkte sollten vor Contentproduktion noch einmal gegen Quellen
verifiziert werden; hier dienen sie nur als Design-Anker.

## 3. Kernspielschleife

1. **Handelsrouten**: Karawanen/Flusskähne/Seeschiffe zwischen Städten,
   Kapazität, Geschwindigkeit, Risiko (Räuber, Sturm, Zölle) je nach Route.
2. **Marktsimulation**: Angebot/Nachfrage pro Stadt und Ware, Preise
   schwanken durch Spieler-Handel, Saison und Zufallsevents (Missernte,
   Kriege, Pest sperrt eine Stadt zeitweise).
3. **Produktionsketten**: Rohstoff → Veredelung → Fertigware, z.B.
   Silbererz → Silberbarren → Münzen; Rohwolle → Tuch; importierte
   Gewürze/Baumwolle aus Lissabon. Eigene Kontore/Manufakturen kaufbar.
4. **Bankwesen**: Kredite an Fürsten/Kaiser gegen Zins und Privilegien
   (Bergbaumonopole, Zollfreiheit), Ausfallrisiko bei Schuldnern, eigene
   Wechselbriefe zur Absicherung von Handelsrouten.
5. **Diplomatie & Konkurrenz-KI**: Zünfte, Handelsprivilegien, Bestechung,
   rivalisierende Handelshäuser (Welser, Medici) mit eigener KI-Agenda,
   Reputationssystem, das Kredit­konditionen und Zunftzugang beeinflusst.

## 4. Karte & Content-Umfang (Vorschlag MVP)

Städte: Augsburg (Heimatbasis), Venedig, Antwerpen, Lissabon, Innsbruck/Tirol
(Bergbau), Krakau, Wien, Rom. Waren (MVP-Set): Silber, Kupfer, Wolle/Tuch,
Gewürze, Salz, Wein. Später erweiterbar (Baumwolle, Zucker, Bücher/Druck).

## 5. Progression & Ziele

- Vom kleinen Kontor zum größten Handelshaus Europas (Kapital-/Einfluss-Score).
- Historische Meilensteine als Achievements (erste Bergwerkskonzession,
  erster Kaiserkredit, Kaiserwahl-Finanzierung, Stiftung einer Fuggerei-artigen
  Siedlung als "gutes Ende").
- Mehrere Sieg-/Endzustände denkbar: wirtschaftlich (reichstes Haus),
  politisch (größter Einfluss am Hof), "Vermächtnis" (Reputation/Stiftungen).

## 6. Tech-Stack-Empfehlung (neues Repo)

Da dieses Repo bereits erfolgreich **TypeScript + Phaser 3 + Vite (Single-File
Build)** für ein 2D-Spiel nutzt, ist der pragmatischste Start ein neues Repo
mit demselben Stack (bekannte Tooling-Basis, kein Server nötig, gut für
Karten/UI-lastige Wirtschaftssimulationen). Alternative wäre React/Canvas für
UI-lastige Screens (Marktübersicht, Verträge) plus leichtgewichtiges
Rendering für die Europakarte — nur nötig, falls reine Phaser-UI zu
umständlich wird.

Vorschlag Repo-Struktur (analog zum bestehenden Projekt):
```
src/
  data/        Städte, Waren, Rezepte/Produktionsketten, Ereignisse
  scenes/      Kartenansicht, Kontor/Verwaltung, Markt, Ereignis-Dialoge
  sim/         Marktpreis-Engine, KI-Konkurrenten, Bankwesen-Logik
  audio/
```

## 7. Roadmap

- **Phase 0 (jetzt)**: Konzeptplan — dieses Dokument, offene Fragen klären.
- **Phase 1 – MVP**: 1 Handelshaus, 4–5 Städte, 1 Warenset, einfacher
  Kauf/Verkauf ohne Produktionsketten, statische bis leicht schwankende Preise.
- **Phase 2 – Marktsimulation**: dynamisches Angebot/Nachfrage, Zufallsevents,
  mehrere Warenarten, erste Produktionsketten.
- **Phase 3 – Bankwesen**: Kredite, Zinsen, Wechselbriefe, Ausfallrisiko.
- **Phase 4 – Politik & Konkurrenz**: Zünfte, Privilegien, KI-Handelshäuser,
  Reputationssystem, Kaiserwahl-Event.
- **Phase 5 – Polish**: Balancing, Art/Sound, Achievements/Endzustände.

## 8. Risiken / offene Punkte

- **Scope-Risiko**: Alle vier gewünschten Säulen (Routen, Produktion, Bank,
  Politik) gleichzeitig sind groß — MVP sollte hart auf Phase 1 begrenzt
  bleiben, bevor Phase 3/4 angegangen werden.
- **Historische Genauigkeit vs. Spielbarkeit**: einzelne Fakten (Zinssätze,
  genaue Handelsrouten, Ereignisdaten) vor Content-Erstellung verifizieren.
- **Namensrechte**: "1869"/"1848" sind Titel bestehender kommerzieller Spiele
  (Rainbow Arts u.a.) — für das neue Spiel einen eigenen Titel finden
  (Arbeitstitel z.B. "Kontor" oder "Der Kaufmann von Augsburg").

## 9. Offene Rückfragen

1. **Titel**: Gibt es schon einen Arbeitstitel, oder soll ich Vorschläge
   erarbeiten (Namensrechte an "1869" beachten)?
2. **Perspektive/Steuerung**: Eher Kartenübersicht mit Menüs/Zahlen (klassisch
   wie 1869) oder auch eine bewegliche Spielfigur/Stadtansicht wie im
   aktuellen Mittelerde-RPG?
3. **Multiplayer**: Reines Singleplayer-gegen-KI oder auch Mehrspieler
   (z.B. Hotseat oder online) vorgesehen?
4. **Zeitbudget/Zielgruppe**: Soll das ein Hobby-Wochenendprojekt mit
   reduziertem Scope werden, oder ein länger laufendes Projekt mit vollem
   Feature-Umfang aus Abschnitt 3?
5. **Neues Repo anlegen**: Soll ich das neue Repository jetzt anlegen
   (Name, Sichtbarkeit) und mit dem MVP-Grundgerüst (Phase 1) starten,
   oder bleibt es vorerst bei diesem Planungsdokument?


---

## 10. Getroffene Entscheidungen (Stand Juli 2026)

Die Rückfragen aus Abschnitt 9 wurden beantwortet:

- **Titel**: "1494 – Aufstieg der Fugger" (Jahreszahl als Hommage an das
  Original; 1494 ordneten die Fugger ihre Handelsgesellschaft neu).
- **Darstellung**: Klassische Kartenübersicht mit Untermenüs, einfache
  Bilddateien als Grafiken (kein begehbares RPG).
- **Zeitmodell**: Rundenbasiert, 1 Zug = 1 Monat.
- **Struktur**: Freies Spiel ab 1494 mit historischen Meilenstein-Events;
  Kampagne ggf. später.
- **Modus**: Vorerst nur Singleplayer.
- **Rahmen**: Hobbyprojekt — Scope pro Phase klein halten.
- **Repository**: Eigenständiges öffentliches Repo `fugger-1494`.
