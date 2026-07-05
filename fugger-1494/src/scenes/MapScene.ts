import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { CITIES, getCity } from '../data/cities';
import { getState, endTurn, dateLabel, cargoTotal, newGame, saveGame } from '../state';
import { GameEvent, rollTravelEvent, rollMarketEvent } from '../sim/events';
import { companyValue, checkMilestones } from '../sim/milestones';
import mapPng from '../assets/map.png';

// Kartenübersicht: Europakarte (Bilddatei, Quelle: assets-src/map.svg)
// mit Städten; Reisen kostet einen Monat.
export class MapScene extends Phaser.Scene {
  private hudGold!: Phaser.GameObjects.Text;
  private hudValue!: Phaser.GameObjects.Text;
  private hudDate!: Phaser.GameObjects.Text;
  private hudCargo!: Phaser.GameObjects.Text;
  private playerMarker!: Phaser.GameObjects.Arc;
  private cityLabels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('MapScene');
  }

  preload(): void {
    this.load.image('map', mapPng);
  }

  create(): void {
    try {
      getState();
    } catch {
      newGame();
    }

    this.drawMap();
    this.drawCities();
    this.drawHud();
    this.refresh();
  }

  private drawMap(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'map');

    // Routen
    const g = this.add.graphics();
    g.lineStyle(3, COLORS.route, 0.8);
    const drawn = new Set<string>();
    for (const city of CITIES) {
      for (const targetId of city.connections) {
        const key = [city.id, targetId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);
        const t = getCity(targetId);
        g.lineBetween(city.x, city.y, t.x, t.y);
      }
    }
  }

  private drawCities(): void {
    for (const city of CITIES) {
      const dot = this.add.circle(city.x, city.y, 12, COLORS.city)
        .setStrokeStyle(2, COLORS.ink)
        .setInteractive({ useHandCursor: true });
      dot.on('pointerover', () => dot.setFillStyle(COLORS.cityHover));
      dot.on('pointerout', () => dot.setFillStyle(COLORS.city));
      dot.on('pointerdown', () => this.onCityClicked(city.id));

      const label = this.add.text(city.x, city.y + 18, city.name, {
        fontFamily: 'Georgia, serif', fontSize: '16px',
        color: COLORS.uiText, stroke: '#1a1408', strokeThickness: 3,
      }).setOrigin(0.5, 0);
      this.cityLabels.push(label);
    }
    this.playerMarker = this.add.circle(0, 0, 6, COLORS.player)
      .setStrokeStyle(2, 0xffffff);
  }

  private drawHud(): void {
    const panel = this.add.rectangle(GAME_WIDTH / 2, 32, GAME_WIDTH, 64, COLORS.uiPanel, 0.92);
    panel.setDepth(10);
    const style = {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: COLORS.uiText,
    };
    this.hudDate = this.add.text(24, 20, '', style).setDepth(11);
    this.hudGold = this.add.text(220, 20, '', { ...style, color: COLORS.uiAccent }).setDepth(11);
    this.hudValue = this.add.text(430, 20, '', { ...style, color: COLORS.uiDim }).setDepth(11);
    this.hudCargo = this.add.text(680, 20, '', style).setDepth(11);

    const wait = this.add.text(GAME_WIDTH - 24, 20, '⌛ Monat warten', {
      ...style, color: COLORS.uiAccent,
    }).setOrigin(1, 0).setDepth(11).setInteractive({ useHandCursor: true });
    wait.on('pointerdown', () => this.passMonth(false));
  }

  private onCityClicked(cityId: string): void {
    const s = getState();
    if (cityId === s.cityId) {
      this.scene.start('MarketScene');
      return;
    }
    const here = getCity(s.cityId);
    if (here.connections.includes(cityId)) {
      s.cityId = cityId;
      this.passMonth(true);
    }
  }

  // Ein Monat vergeht (Reise oder Warten); danach werden Ereignisse gewürfelt.
  private passMonth(traveled: boolean): void {
    const s = getState();
    endTurn(s);
    const events: GameEvent[] = [];
    if (traveled) {
      const e = rollTravelEvent(s);
      if (e) events.push(e);
    }
    const m = rollMarketEvent(s);
    if (m) events.push(m);
    events.push(...checkMilestones(s));
    if (events.length > 0) saveGame();
    this.refresh();
    this.showEvents(events);
  }

  private showEvents(events: GameEvent[]): void {
    const event = events.shift();
    if (!event) return;
    const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setDepth(20).setInteractive();
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 560, 280, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold).setDepth(21);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, event.title, {
      fontFamily: 'Georgia, serif', fontSize: '30px', color: '#8a2f1f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22);
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, event.text, {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#3a2a14', align: 'center',
    }).setOrigin(0.5).setDepth(22);
    const btn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'Weiter', {
      fontFamily: 'Georgia, serif', fontSize: '22px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 24, y: 6 },
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    const close = () => {
      for (const obj of [dim, panel, title, text, btn]) obj.destroy();
      this.refresh();
      this.showEvents(events);
    };
    btn.on('pointerdown', close);
    dim.on('pointerdown', close);
  }

  private refresh(): void {
    const s = getState();
    const city = getCity(s.cityId);
    this.playerMarker.setPosition(city.x, city.y - 20);
    this.hudDate.setText(dateLabel(s));
    this.hudGold.setText(`${s.gold} Gulden`);
    this.hudValue.setText(`Firmenwert: ${companyValue(s)} fl.`);
    this.hudCargo.setText(`Fracht: ${cargoTotal(s)}/${WAGON_CAPACITY} – in ${city.name} (Klick: Markt)`);
  }
}
