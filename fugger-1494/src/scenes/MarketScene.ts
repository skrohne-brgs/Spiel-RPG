import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { GOODS } from '../data/goods';
import { getCity } from '../data/cities';
import { getPrice, applyTradeImpact } from '../sim/market';
import { sfxCoins } from '../audio/sfx';
import { buildingForCity } from '../data/buildings';
import { getState, cargoTotal, dateLabel, saveGame } from '../state';

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
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 160, GAME_HEIGHT - 60, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.header = this.add.text(GAME_WIDTH / 2, 68, '', {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3a2a14',
    }).setOrigin(0.5, 0);

    const colStyle = {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#3a2a14',
    };
    this.add.text(180, 126, 'Ware', colStyle);
    this.add.text(380, 126, 'Preis', colStyle);
    this.add.text(520, 126, 'Im Wagen', colStyle);
    this.add.text(700, 126, 'Handeln', colStyle);

    for (let i = 0; i < GOODS.length; i++) {
      const y = 158 + i * 36;
      this.add.text(180, y, GOODS[i].name, colStyle);
      this.priceCells.push(this.add.text(440, y, '', colStyle).setOrigin(1, 0));
      this.cargoCells.push(this.add.text(580, y, '', colStyle).setOrigin(1, 0));
      this.makeButton(720, y, '− Verkaufen', () => this.trade(GOODS[i].id, -1));
      this.makeButton(880, y, '+ Kaufen', () => this.trade(GOODS[i].id, +1));
    }

    const def = buildingForCity(getState().cityId);
    const kontorLabel = def
      ? (getState().buildings[def.id] ? `Kontor: ${def.name}` : `Kontor: ${def.name} kaufbar`)
      : 'Kontor';
    this.makeButton(200, GAME_HEIGHT - 62, kontorLabel, () => this.scene.start('KontorScene'));
    this.makeButton(540, GAME_HEIGHT - 62, 'Lager', () => this.scene.start('LagerScene'));
    this.makeButton(660, GAME_HEIGHT - 62, 'Fuhrpark', () => this.scene.start('FuhrparkScene'));
    this.makeButton(810, GAME_HEIGHT - 62, 'Bank', () => this.scene.start('BankScene'));
    this.makeButton(950, GAME_HEIGHT - 62, 'Zur Karte', () => this.scene.start('MapScene'));
    this.refresh();
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '17px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 10, y: 3 },
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
    applyTradeImpact(s.market, s.cityId, goodId, 1, dir > 0 ? 'buy' : 'sell');
    sfxCoins();
    saveGame();
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
