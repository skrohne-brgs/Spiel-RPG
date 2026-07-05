import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY, WAGON_COST, CARTER_WAGE } from '../constants';
import { GOODS, getGood } from '../data/goods';
import { getCity } from '../data/cities';
import { getState, saveGame, wagonLoad, WagonState } from '../state';

const MAX_WAGONS = 4;

// Fuhrpark: zusätzliche Fuhrwerke kaufen und ihnen Pendel-Routen zwischen
// eigenen Lagern geben. Bearbeitet werden kann nur, was gerade in der
// Stadt des Spielers steht – Aufträge gibt es nur vor Ort.
export class FuhrparkScene extends Phaser.Scene {
  constructor() {
    super('FuhrparkScene');
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 160, GAME_HEIGHT - 60, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 55, `Fuhrpark zu ${city.name} — ${s.gold} Gulden`, {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3a2a14', fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add.text(GAME_WIDTH / 2, 95,
      'Dein eigener Wagen fährt stets mit dir. Fuhrwerke mit Route pendeln selbständig\n' +
      `zwischen zwei verbundenen Städten mit eigenem Lager (Fuhrmann: ${CARTER_WAGE} fl./Monat).`, {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#6b5636', align: 'center',
      }).setOrigin(0.5, 0);

    if (s.wagons.length < MAX_WAGONS) {
      this.makeButton(GAME_WIDTH / 2, 165, `Fuhrwerk kaufen (${WAGON_COST} fl.)`, () => {
        const st = getState();
        if (st.gold < WAGON_COST || st.wagons.length >= MAX_WAGONS) return;
        st.gold -= WAGON_COST;
        st.wagons.push({ cityId: st.cityId, cargo: {}, route: null });
        saveGame();
        this.scene.restart();
      });
    }

    s.wagons.forEach((w, i) => this.drawWagon(w, i));

    this.makeButton(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'Zurück zum Markt', () =>
      this.scene.start('MarketScene'),
    );
  }

  private drawWagon(w: WagonState, i: number): void {
    const s = getState();
    const y = 210 + i * 108;
    const textStyle = { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#3a2a14' };

    const here = w.cityId === s.cityId;
    const routeText = w.route
      ? `Route: ${getCity(w.route.a).name} ↔ ${getCity(w.route.b).name}` +
        ` — Hin: ${w.route.goodAB ? getGood(w.route.goodAB).name : '–'}` +
        ` — Zurück: ${w.route.goodBA ? getGood(w.route.goodBA).name : '–'}`
      : 'Keine Route – steht still.';
    this.add.text(180, y,
      `Fuhrwerk ${i + 1} — in ${getCity(w.cityId).name}${here ? ' (hier)' : ' (unterwegs)'}` +
      ` — Fracht ${wagonLoad(w)}/${WAGON_CAPACITY}`, { ...textStyle, fontStyle: 'bold' });
    this.add.text(180, y + 26, routeText, textStyle);

    if (!here) return;

    // Ziele: direkt verbundene Städte mit eigenem Lager (Route ab hiesiger Stadt).
    const targets = getCity(s.cityId).connections.filter((c) => s.warehouses[c]);
    const hasLagerHere = !!s.warehouses[s.cityId];
    if (!hasLagerHere || targets.length === 0) {
      this.add.text(180, y + 54,
        'Für eine Route brauchst du ein Lager in dieser Stadt und in einer Nachbarstadt.',
        { ...textStyle, fontSize: '16px', color: '#8a2f1f' });
      return;
    }

    this.makeSmallButton(180, y + 56, `Ziel: ${w.route ? getCity(this.otherEnd(w)).name : 'wählen'}`, () => {
      const idx = w.route ? (targets.indexOf(this.otherEnd(w)) + 1) % targets.length : 0;
      const goodsKeep = w.route ?? { goodAB: null, goodBA: null };
      w.route = { a: s.cityId, b: targets[idx], goodAB: goodsKeep.goodAB, goodBA: goodsKeep.goodBA };
      saveGame();
      this.scene.restart();
    });
    if (w.route) {
      this.makeSmallButton(400, y + 56, `Hin: ${w.route.goodAB ? getGood(w.route.goodAB).name : '–'}`, () => {
        w.route!.goodAB = this.nextGood(w.route!.goodAB);
        saveGame();
        this.scene.restart();
      });
      this.makeSmallButton(600, y + 56, `Zurück: ${w.route.goodBA ? getGood(w.route.goodBA).name : '–'}`, () => {
        w.route!.goodBA = this.nextGood(w.route!.goodBA);
        saveGame();
        this.scene.restart();
      });
      this.makeSmallButton(820, y + 56, 'Route aufheben', () => {
        w.route = null;
        saveGame();
        this.scene.restart();
      });
    }
  }

  // Anderes Routenende aus Sicht der Spielerstadt.
  private otherEnd(w: WagonState): string {
    const s = getState();
    return w.route!.a === s.cityId ? w.route!.b : w.route!.a;
  }

  private nextGood(current: string | null): string | null {
    const ids: (string | null)[] = [null, ...GOODS.map((g) => g.id)];
    return ids[(ids.indexOf(current) + 1) % ids.length];
  }

  private makeSmallButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '16px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 10, y: 4 },
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
