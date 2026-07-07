import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { GOODS, getGood } from '../data/goods';
import { getCity } from '../data/cities';
import { getPrice } from '../sim/market';
import { getState, saveGame, ManagerOrders, TradeOrder, effectivePrice } from '../state';
import { preloadArt } from '../art';

const QTY_STEPS = [1, 2, 3, 5, 10];

// Handelsaufträge des Stadt-Managers: je ein Einkaufs- und ein
// Verkaufsauftrag mit Ware, Preislimit und Monatsmenge. Der Manager
// handelt monatlich über das Stadtlager und die Firmenkasse.
export class ManagerScene extends Phaser.Scene {
  constructor() {
    super('ManagerScene');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);
    s.managerOrders[s.cityId] ??= { buy: null, sell: null };
    const orders = s.managerOrders[s.cityId];

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_kontor');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.22);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 940, 560, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 115, `Handelsaufträge zu ${city.name}`, {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#3a2a14', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 158,
      'Der Manager kauft nur, wenn der Marktpreis unter dem Limit liegt, und verkauft nur darüber.\n' +
      'Er nutzt das Stadtlager und die Firmenkasse – auch wenn du in einer anderen Stadt bist.', {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#6b5636', align: 'center',
      }).setOrigin(0.5);

    if (!s.warehouses[s.cityId]) {
      this.add.text(GAME_WIDTH / 2, 300, 'Ohne Stadtlager kann der Manager nicht handeln.', {
        fontFamily: 'Georgia, serif', fontSize: '20px', color: '#8a2f1f',
      }).setOrigin(0.5);
    } else {
      this.drawOrder('Einkaufsauftrag', 230, orders, 'buy');
      this.drawOrder('Verkaufsauftrag', 400, orders, 'sell');
    }

    this.makeButton(GAME_WIDTH / 2, GAME_HEIGHT - 110, 'Zurück zum Kontor', () =>
      this.scene.start('KontorScene'),
    );
  }

  private drawOrder(label: string, y: number, orders: ManagerOrders, kind: 'buy' | 'sell'): void {
    const s = getState();
    const order = orders[kind];
    this.add.text(200, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#3a2a14', fontStyle: 'bold',
    });

    if (!order) {
      this.makeSmallButton(200, y + 40, 'Auftrag anlegen', () => {
        const good = GOODS[0];
        orders[kind] = { goodId: good.id, limit: good.basePrice, qty: 3 };
        saveGame();
        this.scene.restart();
      });
      return;
    }

    const price = effectivePrice(s, s.cityId, order.goodId);
    this.add.text(200, y + 76,
      `Aktueller Marktpreis hier: ${price} fl. – ` +
      (kind === 'buy'
        ? (price <= order.limit ? 'Manager würde kaufen.' : 'zu teuer, Manager wartet.')
        : (price >= order.limit ? 'Manager würde verkaufen.' : 'zu billig, Manager wartet.')), {
        fontFamily: 'Georgia, serif', fontSize: '15px', color: '#6b5636',
      });

    this.makeSmallButton(200, y + 40, `Ware: ${getGood(order.goodId).name}`, () => {
      const ids = GOODS.map((g) => g.id);
      const next = ids[(ids.indexOf(order.goodId) + 1) % ids.length];
      order.goodId = next;
      order.limit = getGood(next).basePrice;
      saveGame();
      this.scene.restart();
    });
    this.makeSmallButton(420, y + 40, '− 5', () => this.bumpLimit(order, -5));
    this.add.text(510, y + 44, `Limit: ${order.limit} fl.`, {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#3a2a14',
    });
    this.makeSmallButton(650, y + 40, '+ 5', () => this.bumpLimit(order, +5));
    this.makeSmallButton(740, y + 40, `Menge: ${order.qty}/Mon.`, () => {
      order.qty = QTY_STEPS[(QTY_STEPS.indexOf(order.qty) + 1) % QTY_STEPS.length] ?? 3;
      saveGame();
      this.scene.restart();
    });
    this.makeSmallButton(920, y + 40, 'Löschen', () => {
      orders[kind] = null;
      saveGame();
      this.scene.restart();
    });
  }

  private bumpLimit(order: TradeOrder, delta: number): void {
    order.limit = Math.max(1, order.limit + delta);
    saveGame();
    this.scene.restart();
  }

  private makeSmallButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '17px',
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
