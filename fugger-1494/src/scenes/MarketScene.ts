import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { GOODS } from '../data/goods';
import { getCity } from '../data/cities';
import { getPrice } from '../sim/market';
import { buildingForCity } from '../data/buildings';
import { getState, cargoTotal, dateLabel } from '../state';

// Marktmenü der aktuellen Stadt: kaufen/verkaufen pro Ware.
export class MarketScene extends Phaser.Scene {
  private priceCells: Phaser.GameObjects.Text[] = [];
  private cargoCells: Phaser.GameObjects.Text[] = [];
  private header!: Phaser.GameObjects.Text;

  constructor() {
    super('MarketScene');
  }

  create(): void {
    this.priceCells = [];
    this.cargoCells = [];
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 160, GAME_HEIGHT - 100, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.header = this.add.text(GAME_WIDTH / 2, 80, '', {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#3a2a14',
    }).setOrigin(0.5, 0);

    const colStyle = {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#3a2a14',
    };
    this.add.text(180, 140, 'Ware', colStyle);
    this.add.text(380, 140, 'Preis', colStyle);
    this.add.text(520, 140, 'Im Wagen', colStyle);
    this.add.text(700, 140, 'Handeln', colStyle);

    for (let i = 0; i < GOODS.length; i++) {
      const y = 190 + i * 52;
      this.add.text(180, y, GOODS[i].name, colStyle);
      this.priceCells.push(this.add.text(440, y, '', colStyle).setOrigin(1, 0));
      this.cargoCells.push(this.add.text(580, y, '', colStyle).setOrigin(1, 0));
      this.makeButton(720, y, '− Verkaufen', () => this.trade(GOODS[i].id, -1));
      this.makeButton(900, y, '+ Kaufen', () => this.trade(GOODS[i].id, +1));
    }

    const def = buildingForCity(getState().cityId);
    if (def) {
      const label = getState().buildings[def.id] ? `Kontor: ${def.name}` : `Kontor: ${def.name} kaufbar`;
      this.makeButton(GAME_WIDTH / 2 - 280, GAME_HEIGHT - 90, label, () => this.scene.start('KontorScene'));
      this.makeButton(GAME_WIDTH / 2 + 120, GAME_HEIGHT - 90, 'Zur Karte', () => this.scene.start('MapScene'));
    } else {
      this.makeButton(GAME_WIDTH / 2 - 70, GAME_HEIGHT - 90, 'Zur Karte', () => this.scene.start('MapScene'));
    }
    this.refresh();
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '20px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 12, y: 4 },
    }).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
  }

  private trade(goodId: string, dir: 1 | -1): void {
    const s = getState();
    const price = getPrice(s.market, s.cityId, goodId);
    const held = s.cargo[goodId] ?? 0;
    if (dir > 0) {
      if (s.gold < price || cargoTotal(s) >= WAGON_CAPACITY) return;
      s.gold -= price;
      s.cargo[goodId] = held + 1;
    } else {
      if (held <= 0) return;
      s.gold += price;
      s.cargo[goodId] = held - 1;
    }
    this.refresh();
  }

  private refresh(): void {
    const s = getState();
    const city = getCity(s.cityId);
    this.header.setText(
      `Markt zu ${city.name} — ${dateLabel(s)} — ${s.gold} Gulden — Fracht ${cargoTotal(s)}/${WAGON_CAPACITY}`,
    );
    for (let i = 0; i < GOODS.length; i++) {
      const good = GOODS[i];
      this.priceCells[i].setText(`${getPrice(s.market, s.cityId, good.id)} fl.`);
      this.cargoCells[i].setText(String(s.cargo[good.id] ?? 0));
    }
  }
}
