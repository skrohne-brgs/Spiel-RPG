import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY, WAGON_COST, CARTER_WAGE } from '../constants';
import { GOODS, getGood } from '../data/goods';
import { getCity } from '../data/cities';
import { getState, saveGame, wagonLoad, WagonState } from '../state';
import { preloadArt } from '../art';

const MAX_WAGONS = 4;
const MAX_STOPS = 4;

// Fuhrpark: Fuhrwerke kaufen und ihnen Ringrouten über 2–4 eigene
// Lager-Städte geben. An jeder Station wird alles abgeladen und die
// eingestellte Ware geladen. Aufträge gibt es nur vor Ort.
export class FuhrparkScene extends Phaser.Scene {
  constructor() {
    super('FuhrparkScene');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_fuhrpark');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.22);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 260, GAME_HEIGHT - 80, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 55, `Fuhrpark zu ${city.name} — ${s.gold} Gulden`, {
      fontFamily: 'Georgia, serif', fontSize: '25px', color: '#3a2a14', fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add.text(GAME_WIDTH / 2, 92,
      `Fuhrwerke fahren ihre Stationen im Kreis ab: alles abladen, eingestellte Ware laden, weiter.\n` +
      `Jede Station braucht ein eigenes Lager. Verbundene Städte: 1 Monat, sonst 2 (Fuhrmann: ${CARTER_WAGE} fl./Monat).`, {
        fontFamily: 'Georgia, serif', fontSize: '15px', color: '#6b5636', align: 'center',
      }).setOrigin(0.5, 0);

    if (s.wagons.length < MAX_WAGONS) {
      this.makeButton(GAME_WIDTH / 2, 158, `Fuhrwerk kaufen (${WAGON_COST} fl.)`, () => {
        const st = getState();
        if (st.gold < WAGON_COST || st.wagons.length >= MAX_WAGONS) return;
        st.gold -= WAGON_COST;
        st.wagons.push({ cityId: st.cityId, cargo: {}, route: null, transit: null });
        saveGame();
        this.scene.restart();
      });
    }

    s.wagons.forEach((w, i) => this.drawWagon(w, i));

    this.makeButton(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'Zurück zum Markt', () =>
      this.scene.start('MarketScene'),
    );
  }

  private drawWagon(w: WagonState, i: number): void {
    const s = getState();
    const y = 196 + i * 108;
    const textStyle = { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#3a2a14' };

    const here = w.cityId === s.cityId && !w.transit;
    const where = w.transit
      ? `unterwegs nach ${getCity(w.transit.to).name}`
      : `in ${getCity(w.cityId).name}${here ? ' (hier)' : ''}`;
    this.add.text(180, y,
      `Fuhrwerk ${i + 1} — ${where} — Fracht ${wagonLoad(w)}/${WAGON_CAPACITY}`,
      { ...textStyle, fontStyle: 'bold' });

    const routeText = w.route && w.route.stops.length >= 2
      ? 'Route: ' + w.route.stops
          .map((st) => `${getCity(st.cityId).name}${st.load ? ` ▸ ${getGood(st.load).name}` : ''}`)
          .join('  →  ') + '  → (von vorn)'
      : 'Keine Route – steht still.';
    this.add.text(180, y + 24, routeText, { ...textStyle, fontSize: '15px', color: '#6b5636' });

    if (!here) return;

    // Städte mit eigenem Lager sind mögliche Stationen.
    const depots = Object.keys(s.warehouses);
    if (depots.length < 2) {
      this.add.text(180, y + 50,
        'Für Routen brauchst du Lager in mindestens zwei Städten.',
        { ...textStyle, fontSize: '15px', color: '#8a2f1f' });
      return;
    }

    if (!w.route || w.route.stops.length < 2) {
      this.makeSmallButton(180, y + 50, 'Route anlegen', () => {
        const start = s.warehouses[s.cityId] ? s.cityId : depots[0];
        const second = depots.find((c) => c !== start)!;
        w.route = { stops: [{ cityId: start, load: null }, { cityId: second, load: null }] };
        saveGame();
        this.scene.restart();
      });
      return;
    }

    // Je Station: [Stadt] [Ware]-Knöpfe
    const stops = w.route.stops;
    stops.forEach((stop, j) => {
      const x = 180 + j * 235;
      this.makeSmallButton(x, y + 50, `${j + 1}. ${getCity(stop.cityId).name}`, () => {
        const used = stops.map((st) => st.cityId);
        const options = depots.filter((c) => c === stop.cityId || !used.includes(c));
        stop.cityId = options[(options.indexOf(stop.cityId) + 1) % options.length];
        saveGame();
        this.scene.restart();
      });
      this.makeSmallButton(x, y + 78, `▸ ${stop.load ? getGood(stop.load).name : '–'}`, () => {
        const ids: (string | null)[] = [null, ...GOODS.map((g) => g.id)];
        stop.load = ids[(ids.indexOf(stop.load) + 1) % ids.length];
        saveGame();
        this.scene.restart();
      });
    });

    const ctrlX = 180 + stops.length * 235;
    if (stops.length < MAX_STOPS && depots.some((c) => !stops.some((st) => st.cityId === c))) {
      this.makeSmallButton(ctrlX, y + 50, '+ Station', () => {
        const free = depots.find((c) => !stops.some((st) => st.cityId === c))!;
        stops.push({ cityId: free, load: null });
        saveGame();
        this.scene.restart();
      });
    }
    if (stops.length > 2) {
      this.makeSmallButton(ctrlX, y + 78, '– Station', () => {
        stops.pop();
        saveGame();
        this.scene.restart();
      });
    }
    this.makeSmallButton(1000, y, 'Route aufheben', () => {
      w.route = null;
      saveGame();
      this.scene.restart();
    });
  }

  private makeSmallButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '15px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 9, y: 3 },
    }).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '19px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 14, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
  }
}
