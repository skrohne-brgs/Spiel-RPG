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

## Stand (Phase 2 – Produktionsketten, begonnen)

- [x] Neue Ware Erz (billig in Innsbruck und Krakau)
- [x] Kaufbare Manufakturen mit Kontor-Ansicht (einlagern/abholen):
      Tuchweberei Augsburg (Wolle → Tuch), Schmelzhütte Innsbruck (2 Erz → 1 Kupfer)
- [x] Monatliche Produktion beim Rundenende
- [ ] Weitere Manufakturen und Waren, Lagerkapazitäten

Danach: Produktionsketten (Phase 2), Bankwesen (Phase 3),
Politik & Konkurrenz-KI (Phase 4) – Details im Konzeptplan.
