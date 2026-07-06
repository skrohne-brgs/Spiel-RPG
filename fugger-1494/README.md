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

Danach: Produktionsketten (Phase 2), Bankwesen (Phase 3),
Politik & Konkurrenz-KI (Phase 4) – Details im Konzeptplan.
