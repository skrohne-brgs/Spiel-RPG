# 1494 – Aufstieg der Fugger

Rundenbasierte Handelssimulation im Geiste der Klassiker (*1869*), angesiedelt
in der Ära der Augsburger Fugger-Dynastie. Du beginnst 1494 mit einem kleinen
Handelshaus in Augsburg und baust es zum größten Wirtschaftsimperium Europas aus.

**Konzept & Roadmap:** siehe [docs/konzeptplan.md](docs/konzeptplan.md)

## Eckdaten

- **Genre**: Handelssimulation, rundenbasiert (1 Zug = 1 Monat)
- **Struktur**: Freies Spiel ab 1494 mit historischen Meilenstein-Events
- **Modus**: Singleplayer gegen KI-Handelshäuser (KI folgt in Phase 4)
- **Darstellung**: Klassische Kartenübersicht mit Untermenüs
- **Technik**: TypeScript + Phaser 3 + Vite (Single-File-Build, kein Server nötig)

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # erzeugt dist/index.html als einzelne Datei
```

## Stand (Phase 1 – MVP)

- [x] Europakarte mit 8 Städten (Augsburg, Innsbruck, Venedig, Rom, Wien, Krakau, Antwerpen, Lissabon)
- [x] Reisen zwischen verbundenen Städten (1 Monat pro Reise)
- [x] Marktmenü: 7 Waren kaufen/verkaufen, Preise je Stadt (Erzeuger billig, Nachfrage teuer)
- [x] Monatliche Preisschwankungen (Random Walk mit Rückzug zur Mitte)
- [x] Hauptmenü (Neues Spiel / Weiterspielen)
- [x] Speichern/Laden (automatisch jeden Monat, localStorage)
- [x] Ereignisse: Raubritter & Wegzoll beim Reisen, Knappheit/Schwemme auf Märkten
- [x] Kartengrafik als Bilddatei (stilisierte Antik-Europakarte, Quelle: assets-src/map.svg)
- [x] Firmenwert im HUD (Gold + Waren + Manufakturen)
- [x] Historische Meilensteine: Reichstag zu Worms 1495 (Landfriede senkt Räuberrisiko),
      Seeweg nach Indien 1499 (Gewürzpreissturz in Lissabon), Vermögensränge (1.000/5.000/25.000 fl.)

## Stand (Phase 2 – Produktionsketten & Logistik)

Der Spieler ist immer „vor Ort": Interagieren (Handeln, Kaufen, Aufträge
erteilen) geht nur in der aktuellen Stadt. Anderswo arbeiten nur Manager
und Fuhrleute, die vorher Aufträge bekommen haben.

- [x] 13 Waren, Manufakturen in drei Stufen (eine je Stadt):
      *Stufe 1 (Förderung)*: Salzbergwerk Krakau;
      *Stufe 2 (Veredelung)*: Tuchweberei Augsburg (Wolle→Tuch), Schmelzhütte
      Innsbruck (2 Erz→Kupfer), Glashütte Venedig (2 Salz→Glas), Brennerei Wien
      (2 Wein→Branntwein), Waffenschmiede Antwerpen (Kupfer→Waffen);
      *Stufe 3 (Kombination)*: Goldschmiede Rom (Silber + 2 Glas→Schmuck),
      Hof-Apotheke Lissabon (Gewürze + Branntwein→Arznei)
- [x] Stadtlager: kaufbar (500 fl., 30 Kapazität), ausbaubar (+30 je 300 fl.),
      Waren zwischen Wagen und Lager verschieben
- [x] Unterhalt & Löhne: Manufakturen, Lager (5 fl. je Ausbaustufe),
      Manager (25 fl.), Fuhrleute (20 fl.) – monatlich fällig, Schulden möglich
- [x] Manager je Stadt: bestückt die Manufaktur automatisch aus dem Stadtlager
      und räumt Fertigware dorthin zurück
- [x] Fuhrpark: bis zu 4 zusätzliche Fuhrwerke, pendeln mit Hin-/Rückfracht
      selbständig zwischen zwei verbundenen Städten mit eigenem Lager
- [x] Manager-Handelsaufträge: je Stadt ein Einkaufs- und ein Verkaufsauftrag
      (Ware, Preislimit, Menge/Monat) – läuft monatlich über Stadtlager und Kasse;
      Manager sind auch ohne Manufaktur anstellbar (reine Handelsposten)

## Stand (Phase 3 – Bankwesen, begonnen)

- [x] Wechselstube in jeder Stadt: monatlich 0–2 Kreditgesuche von Fürsten
      (Betrag, Laufzeit, Rückzahlung, Ausfallrisiko gering/mittel/hoch)
- [x] Vergebene Kredite laufen im Hintergrund; bei Fälligkeit Rückzahlung
      mit Zinsgewinn oder Ausfall-Ereignis (Totalverlust)
- [x] Eigenes Darlehen: in 500-fl.-Schritten bis 3.000 fl., 2 % Zins/Monat,
      jederzeit tilgbar; Schulden mindern den Firmenwert
- [x] Meilenstein „Bankier der Fürsten" beim ersten vergebenen Kredit
- [ ] Kaiserkredit & Privilegien (Monopole, Zollfreiheit) – Übergang zu Phase 4

## Stand (Phase 5 – Polish)

- [x] Eigener Handel bewegt die Preise: Käufe verteuern (+1,2 %/Einheit),
      Verkäufe drücken (−1,2 %/Einheit) – gilt auch für Manager-Aufträge
- [x] Soundeffekte (synthetisch, WebAudio): Münzen, Reise, Ereignis-Glocke
- [x] Besitz-Marker auf der Karte: Lager (goldenes Quadrat), Manufaktur
      (Dreieck), Manager (blauer Punkt) an jeder Stadt
- [x] Chronik-Ansicht (über die Karte): alle Meilensteine, erreichte mit Text
- [x] Sieg bei 50.000 fl. Firmenwert („Das reichste Haus Europas") –
      Sandbox läuft danach weiter
- [x] Hauptmenü mit Kartenhintergrund
- [x] Eigene Vignette je Stadt (Augsburger Giebelhaus, Goldenes Dachl,
      Campanile, Petersdom, Stephansdom, Wawel, Treppengiebel mit Kran,
      Torre de Belém) – handgezeichnete SVGs, gerastert ohne externe Quellen
      (Generator: assets-src/icons-generator.mjs)
- [x] Besitz-Icons auf der Karte: Lagerhaus/Manufaktur (gemeinsames
      Gebäude-Icon), Manager-Figur; Spieler als Planwagen
- [x] Waren-Icons für alle 13 Güter in Markt und Lager
- [x] Porträts in Ereignis-Dialogen (Fürst, Kaiser, Raubritter, Händler,
      Partner, Kind, Gold, leere Kasse, Karavelle)
- [x] Fugger-Wappen (geteilte Lilie in Blau/Gold) im Hauptmenü
      (Generator: assets-src/icons2-generator.mjs)
- [x] Animationen: Planwagen fährt sichtbar zur Zielstadt (mit Kippeln und
      Blickrichtung, Klicksperre bis Ankunft), Städte wachsen beim Überfahren,
      Ereignis-Dialoge poppen herein, +/− Gulden schweben beim Handeln,
      Flotten-Fuhrwerke stehen als Mini-Wagen an ihren Städten,
      Wappen schwebt im Hauptmenü
- [x] Szenen-Hintergründe: Marktplatz, Kontor-Stube, Lagerhalle, Wechselstube,
      Fuhrhof und Studierzimmer rahmen die Pergament-Panels
      (Generator: assets-src/bg-generator.mjs)
- [x] Musik: ruhige Lauten-Schleife (Passamezzo antico, a-Moll), komplett
      per WebAudio synthetisiert – startet mit der ersten Geste,
      an-/abschaltbar im Hauptmenü und auf der Karte (gespeichert)

## Stand (Phase 4 – Politik & Konkurrenz)

- [x] Reputation (0–100): wächst mit zurückgezahlten Fürstenkrediten,
      Hochzeit und Kindern; sichtbar in Bank und Chronik
- [x] Privilegien in der Wechselstube (Ruf + Gold): Kaiserliche Zollfreiheit,
      Bergbaumonopol Tirol (−20 % auf Erz/Kupfer/Silber in Innsbruck),
      Salzregal (+2 Salz/Monat)
- [x] Ereignisse mit Entscheidungen (Knopf je Option, ausgegraut wenn zu teuer)
- [x] Set-Piece Kaiserwahl 1519: Karls Wahl für 15.000 fl. finanzieren →
      „Bankier des Kaisers" (Ruf 100, größere und sicherere Kreditgesuche)
      oder ablehnen (stärkt die Welser)
- [x] Rivalen Welser/Medici/Höchstetter: wachsen monatlich, greifen gelegentlich
      in Märkte ein; Rangliste der Häuser in der Chronik

## Stand (Phase 6 – Familie, Nebenschauplatz)

- [x] Begegnungs-Ereignis (ab 1496, ab 2.000 fl. Firmenwert) mit Entscheidung:
      Brautwerbung (200 fl.) oder höflich bleiben
- [x] Hochzeit nach drei Monaten Werbung: +800 fl. Mitgift, +10 Ruf,
      Ehepartner führt das Augsburger Kontor (Manager dort kostenlos)
- [x] Kinder als seltene Ereignisse (bis zu vier, je +2 Ruf)
- [x] Familienstand in der Chronik

## Balancing-Runde 1 (Spieler-Feedback)

- Löhne gesenkt: Manager 25→15 fl., Fuhrmann 20→15 fl.; Manufaktur-Unterhalt
  reduziert; Produktionsraten erhöht (Salzbergwerk 5→8, Veredler 3–4→4–5)
- Basispreise angehoben: Branntwein 45→60, Arznei 240→280, Schmuck 280→320 –
  alle Manufakturen amortisieren sich nun in ca. 6–14 Monaten
- Fuhrwerk-Routen mit 2–4 Stationen (Ringhandel): je Station eine Ladeware,
  alles wird abgeladen; direkt verbundene Städte 1 Monat Fahrt, sonst 2
- Fertigware wird automatisch ins Stadtlager geliefert (solange Platz);
  das Kontor zeigt Bestände in Manufaktur, Wagen und Stadtlager samt
  Erklärung, wie der Manager Rohstoffe per Handelsauftrag beschafft

## Manufaktur-Ausbau

- Drei Ausbaustufen je Manufaktur: Werkstatt → Manufaktur → Faktorei
  (Produktionsrate ×1 / ×2 / ×3, Unterhalt ×1 / ×1,5 / ×2, Ausbaukosten
  80 % bzw. 150 % des Kaufpreises); Managerlohn bleibt fix → Skalenvorteil
- Faktorei (Stufe 3) verlangt Ruf ≥ 30 (Zünfte dulden Großbetriebe nur
  bei angesehenen Häusern) und bietet eine einmalige Wahl:
  *Menge* (Rate ×3) oder *Qualität* (Rate ×2, aber die eigene Ware
  verkauft/kauft sich in der Manufakturstadt +25 %)
- Ausbau im Kontor; Stufe, effektive Rate und Unterhalt werden dort
  angezeigt; Ausbau-Investitionen zählen zum Firmenwert; alte
  Spielstände starten auf Stufe 1

Damit sind alle Phasen des Konzeptplans umgesetzt.
