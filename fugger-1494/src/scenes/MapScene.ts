import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { CITIES, getCity } from '../data/cities';
import { getState, endTurn, dateLabel, cargoTotal, newGame, saveGame, monthlyUpkeep } from '../state';
import { buildingForCity } from '../data/buildings';
import { GameEvent, rollTravelEvent, rollMarketEvent } from '../sim/events';
import { companyValue, checkMilestones } from '../sim/milestones';
import mapPng from '../assets/map.png';
import { sfxEvent, sfxTravel } from '../audio/sfx';

// Kartenübersicht: Europakarte (Bilddatei, Quelle: assets-src/map.svg)
// mit Städten; Reisen kostet einen Monat.
export class MapScene extends Phaser.Scene {
  private hudGold!: Phaser.GameObjects.Text;
  private hudValue!: Phaser.GameObjects.Text;
  private hudDate!: Phaser.GameObjects.Text;
  private hudCargo!: Phaser.GameObjects.Text;
  private playerMarker!: Phaser.GameObjects.Arc;
  private cityLabels: Phaser.GameObjects.Text[] = [];
  private assetMarkers: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('MapScene');
  }

  preload(): void {
    if (!this.textures.exists('map')) this.load.image('map', mapPng);
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
    this.hudDate = this.add.text(24, 22, '', { ...style, fontSize: '18px' }).setDepth(11);
    this.hudGold = this.add.text(200, 22, '', { ...style, fontSize: '18px', color: COLORS.uiAccent }).setDepth(11);
    this.hudValue = this.add.text(390, 22, '', { ...style, fontSize: '18px', color: COLORS.uiDim }).setDepth(11);
    this.hudCargo = this.add.text(740, 22, '', { ...style, fontSize: '18px' }).setDepth(11);

    const wait = this.add.text(GAME_WIDTH - 24, 20, '⌛ Monat warten', {
      ...style, color: COLORS.uiAccent,
    }).setOrigin(1, 0).setDepth(11).setInteractive({ useHandCursor: true });
    wait.on('pointerdown', () => this.passMonth(false));

    const chronik = this.add.text(24, GAME_HEIGHT - 16, '📜 Chronik', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#e8d9b0',
      stroke: '#1a1408', strokeThickness: 3,
    }).setOrigin(0, 1).setDepth(11).setInteractive({ useHandCursor: true });
    chronik.on('pointerdown', () => this.scene.start('ChronikScene'));
  }

  // Kleine Marker an den Städten: Lager (goldenes Quadrat), Manufaktur
  // (braunes Dreieck), Manager (blauer Punkt).
  private drawAssetMarkers(): void {
    for (const m of this.assetMarkers) m.destroy();
    this.assetMarkers = [];
    const s = getState();
    for (const city of CITIES) {
      let x = city.x - 22;
      if (s.warehouses[city.id]) {
        this.assetMarkers.push(this.add.rectangle(x, city.y - 12, 9, 9, COLORS.gold)
          .setStrokeStyle(1, COLORS.ink));
        x -= 13;
      }
      const def = buildingForCity(city.id);
      if (def && s.buildings[def.id]) {
        this.assetMarkers.push(this.add.triangle(x, city.y - 12, 0, 9, 5, 0, 10, 9, 0x6b5636)
          .setStrokeStyle(1, COLORS.ink));
        x -= 13;
      }
      if (s.managers[city.id]) {
        this.assetMarkers.push(this.add.circle(x, city.y - 12, 4, COLORS.player)
          .setStrokeStyle(1, 0xffffff));
      }
    }
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
      sfxTravel();
      this.passMonth(true);
    }
  }

  // Ein Monat vergeht (Reise oder Warten); danach werden Ereignisse gewürfelt.
  private passMonth(traveled: boolean): void {
    const s = getState();
    const events: GameEvent[] = endTurn(s);
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
    sfxEvent();
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
    this.drawAssetMarkers();
    this.hudDate.setText(dateLabel(s));
    this.hudGold.setText(`${s.gold} Gulden`);
    this.hudGold.setColor(s.gold < 0 ? '#d9534f' : '#c9a227');
    const upkeep = monthlyUpkeep(s);
    this.hudValue.setText(`Wert: ${companyValue(s)} fl.${upkeep > 0 ? ` · Kosten: ${upkeep}/Mon.` : ''}`);
    this.hudCargo.setText(`Fracht ${cargoTotal(s)}/${WAGON_CAPACITY} – in ${city.name} (Klick: Markt)`);
  }
}
