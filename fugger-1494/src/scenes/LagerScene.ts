import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY,
  WAREHOUSE_COST, WAREHOUSE_STEP, WAREHOUSE_UPGRADE_COST, WAREHOUSE_UPKEEP_PER_STEP,
} from '../constants';
import { GOODS } from '../data/goods';
import { getCity } from '../data/cities';
import { getState, cargoTotal, stockTotal, saveGame } from '../state';
import { preloadArt } from '../art';

// Stadtlager: kaufen, ausbauen und Waren zwischen Spielerwagen und
// Lager verschieben. Nur in der Stadt des Spielers nutzbar.
export class LagerScene extends Phaser.Scene {
  private header!: Phaser.GameObjects.Text;
  private stockCells: Phaser.GameObjects.Text[] = [];
  private cargoCells: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('LagerScene');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);
    this.stockCells = [];
    this.cargoCells = [];

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_lager');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.22);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 260, GAME_HEIGHT - 80, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.header = this.add.text(GAME_WIDTH / 2, 60, '', {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3a2a14', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    if (!s.warehouses[s.cityId]) {
      this.add.text(GAME_WIDTH / 2, 300,
        `Du besitzt kein Lager in ${city.name}.\n\n` +
        `Ein Lager fasst ${WAREHOUSE_STEP} Einheiten, kann ausgebaut werden\n` +
        `und kostet ${WAREHOUSE_UPKEEP_PER_STEP} fl. Unterhalt je Ausbaustufe im Monat.\n` +
        `Manager und Fuhrleute arbeiten nur über das Stadtlager.`, {
          fontFamily: 'Georgia, serif', fontSize: '20px', color: '#3a2a14',
          align: 'center', lineSpacing: 8,
        }).setOrigin(0.5);
      this.makeButton(GAME_WIDTH / 2, 450, `Lager kaufen (${WAREHOUSE_COST} fl.)`, () => {
        const st = getState();
        if (st.gold < WAREHOUSE_COST || st.warehouses[st.cityId]) return;
        st.gold -= WAREHOUSE_COST;
        st.warehouses[st.cityId] = { capacity: WAREHOUSE_STEP, stock: {} };
        saveGame();
        this.scene.restart();
      });
      this.makeButton(GAME_WIDTH / 2, 520, 'Zurück zum Markt', () => this.scene.start('MarketScene'));
      this.refresh();
      return;
    }

    const colStyle = { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#3a2a14' };
    this.add.text(160, 116, 'Ware', colStyle);
    this.add.text(330, 116, 'Im Lager', colStyle);
    this.add.text(460, 116, 'Im Wagen', colStyle);
    this.add.text(620, 116, 'Einlagern / Entnehmen', colStyle);

    for (let i = 0; i < GOODS.length; i++) {
      const y = 150 + i * 36;
      this.add.image(138, y + 10, `good_${GOODS[i].id}`).setScale(0.42);
      this.add.text(160, y, GOODS[i].name, colStyle);
      this.stockCells.push(this.add.text(400, y, '', colStyle).setOrigin(1, 0));
      this.cargoCells.push(this.add.text(530, y, '', colStyle).setOrigin(1, 0));
      const id = GOODS[i].id;
      this.makeSmallButton(640, y, '▶ 1', () => this.move(id, 1, 'in'));
      this.makeSmallButton(720, y, '▶ alle', () => this.move(id, Infinity, 'in'));
      this.makeSmallButton(820, y, '1 ◀', () => this.move(id, 1, 'out'));
      this.makeSmallButton(900, y, 'alle ◀', () => this.move(id, Infinity, 'out'));
    }

    this.makeButton(GAME_WIDTH / 2 - 200, GAME_HEIGHT - 45,
      `Ausbauen +${WAREHOUSE_STEP} (${WAREHOUSE_UPGRADE_COST} fl.)`, () => {
        const st = getState();
        const wh = st.warehouses[st.cityId];
        if (!wh || st.gold < WAREHOUSE_UPGRADE_COST) return;
        st.gold -= WAREHOUSE_UPGRADE_COST;
        wh.capacity += WAREHOUSE_STEP;
        saveGame();
        this.refresh();
      });
    this.makeButton(GAME_WIDTH / 2 + 200, GAME_HEIGHT - 45, 'Zurück zum Markt', () =>
      this.scene.start('MarketScene'),
    );
    this.refresh();
  }

  // Verschiebt Waren Wagen->Lager ('in') bzw. Lager->Wagen ('out').
  private move(goodId: string, amount: number, dir: 'in' | 'out'): void {
    const s = getState();
    const wh = s.warehouses[s.cityId];
    if (!wh) return;
    if (dir === 'in') {
      const space = wh.capacity - stockTotal(wh);
      const n = Math.min(amount, s.cargo[goodId] ?? 0, space);
      if (n <= 0) return;
      s.cargo[goodId] = (s.cargo[goodId] ?? 0) - n;
      wh.stock[goodId] = (wh.stock[goodId] ?? 0) + n;
    } else {
      const space = WAGON_CAPACITY - cargoTotal(s);
      const n = Math.min(amount, wh.stock[goodId] ?? 0, space);
      if (n <= 0) return;
      wh.stock[goodId] = (wh.stock[goodId] ?? 0) - n;
      s.cargo[goodId] = (s.cargo[goodId] ?? 0) + n;
    }
    saveGame();
    this.refresh();
  }

  private refresh(): void {
    const s = getState();
    const city = getCity(s.cityId);
    const wh = s.warehouses[s.cityId];
    if (!wh) {
      this.header.setText(`Lager zu ${city.name} — ${s.gold} Gulden`);
      return;
    }
    const upkeep = (wh.capacity / WAREHOUSE_STEP) * WAREHOUSE_UPKEEP_PER_STEP;
    this.header.setText(
      `Lager zu ${city.name} — ${stockTotal(wh)}/${wh.capacity} belegt — ` +
      `Unterhalt ${upkeep} fl./Monat — ${s.gold} Gulden — Wagen ${cargoTotal(s)}/${WAGON_CAPACITY}`,
    );
    for (let i = 0; i < GOODS.length; i++) {
      this.stockCells[i].setText(String(wh.stock[GOODS[i].id] ?? 0));
      this.cargoCells[i].setText(String(s.cargo[GOODS[i].id] ?? 0));
    }
  }

  private makeSmallButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '15px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 8, y: 3 },
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
