import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { CITIES, getCity } from '../data/cities';
import { getState, endTurn, dateLabel, cargoTotal, newGame, saveGame, monthlyUpkeep } from '../state';
import { buildingForCity } from '../data/buildings';
import { GameEvent, rollTravelEvent, rollMarketEvent } from '../sim/events';
import { companyValue, checkMilestones } from '../sim/milestones';
import mapPng from '../assets/map.png';
import { sfxEvent, sfxTravel } from '../audio/sfx';
import augsburgPng from '../assets/cities/augsburg.png';
import innsbruckPng from '../assets/cities/innsbruck.png';
import venedigPng from '../assets/cities/venedig.png';
import romPng from '../assets/cities/rom.png';
import wienPng from '../assets/cities/wien.png';
import krakauPng from '../assets/cities/krakau.png';
import antwerpenPng from '../assets/cities/antwerpen.png';
import lissabonPng from '../assets/cities/lissabon.png';
import buildingPng from '../assets/icon_building.png';
import managerPng from '../assets/icon_manager.png';
import wagonPng from '../assets/icon_wagon.png';

const CITY_ART: Record<string, string> = {
  augsburg: augsburgPng, innsbruck: innsbruckPng, venedig: venedigPng,
  rom: romPng, wien: wienPng, krakau: krakauPng,
  antwerpen: antwerpenPng, lissabon: lissabonPng,
};

// Kartenübersicht: Europakarte (Bilddatei, Quelle: assets-src/map.svg)
// mit Städten; Reisen kostet einen Monat.
export class MapScene extends Phaser.Scene {
  private hudGold!: Phaser.GameObjects.Text;
  private hudValue!: Phaser.GameObjects.Text;
  private hudDate!: Phaser.GameObjects.Text;
  private hudCargo!: Phaser.GameObjects.Text;
  private playerMarker!: Phaser.GameObjects.Image;
  private cityLabels: Phaser.GameObjects.Text[] = [];
  private assetMarkers: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('MapScene');
  }

  preload(): void {
    if (!this.textures.exists('map')) this.load.image('map', mapPng);
    for (const [id, png] of Object.entries(CITY_ART)) {
      if (!this.textures.exists(`city_${id}`)) this.load.image(`city_${id}`, png);
    }
    if (!this.textures.exists('icon_building')) this.load.image('icon_building', buildingPng);
    if (!this.textures.exists('icon_manager')) this.load.image('icon_manager', managerPng);
    if (!this.textures.exists('icon_wagon')) this.load.image('icon_wagon', wagonPng);
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
      const img = this.add.image(city.x, city.y + 10, `city_${city.id}`)
        .setOrigin(0.5, 1)
        .setScale(0.48)
        .setInteractive({ useHandCursor: true });
      img.on('pointerover', () => img.setTint(0xffd890));
      img.on('pointerout', () => img.clearTint());
      img.on('pointerdown', () => this.onCityClicked(city.id));

      const label = this.add.text(city.x, city.y + 12, city.name, {
        fontFamily: 'Georgia, serif', fontSize: '16px',
        color: COLORS.uiText, stroke: '#1a1408', strokeThickness: 3,
      }).setOrigin(0.5, 0);
      this.cityLabels.push(label);
    }
    this.playerMarker = this.add.image(0, 0, 'icon_wagon').setScale(0.55);
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
      let x = city.x - 32;
      // Lagerhaus und Manufaktur teilen sich ein Gebäude-Icon.
      if (s.warehouses[city.id]) {
        this.assetMarkers.push(this.add.image(x, city.y - 16, 'icon_building').setScale(0.5));
        x -= 17;
      }
      const def = buildingForCity(city.id);
      if (def && s.buildings[def.id]) {
        this.assetMarkers.push(this.add.image(x, city.y - 16, 'icon_building').setScale(0.5));
        x -= 17;
      }
      if (s.managers[city.id]) {
        this.assetMarkers.push(this.add.image(x, city.y - 15, 'icon_manager').setScale(0.5));
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
    const panelWidth = event.choices && event.choices.length > 1 ? 800 : 560;
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, panelWidth, 280, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold).setDepth(21);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, event.title, {
      fontFamily: 'Georgia, serif', fontSize: '30px', color: '#8a2f1f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22);
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, event.text, {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#3a2a14', align: 'center',
    }).setOrigin(0.5).setDepth(22);
    const buttons: Phaser.GameObjects.Text[] = [];
    const close = () => {
      for (const obj of [dim, panel, title, text, ...buttons]) obj.destroy();
      this.refresh();
      this.showEvents(events);
    };

    if (event.choices && event.choices.length > 0) {
      // Entscheidung: ein Knopf je Wahlmöglichkeit, Abbrechen unmöglich.
      const n = event.choices.length;
      event.choices.forEach((choice, i) => {
        const x = GAME_WIDTH / 2 + (i - (n - 1) / 2) * 300;
        const usable = choice.enabled !== false;
        const btn = this.add.text(x, GAME_HEIGHT / 2 + 90, choice.label, {
          fontFamily: 'Georgia, serif', fontSize: '19px',
          color: usable ? '#e8d9b0' : '#8a7850',
          backgroundColor: usable ? '#6b5636' : '#4a3d28',
          padding: { x: 16, y: 6 },
        }).setOrigin(0.5).setDepth(22);
        buttons.push(btn);
        if (!usable) return;
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
        btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
        btn.on('pointerdown', () => {
          choice.apply?.(getState());
          saveGame();
          close();
        });
      });
      return;
    }

    const btn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'Weiter', {
      fontFamily: 'Georgia, serif', fontSize: '22px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 24, y: 6 },
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    buttons.push(btn);
    btn.on('pointerdown', close);
    dim.on('pointerdown', close);
  }

  private refresh(): void {
    const s = getState();
    const city = getCity(s.cityId);
    this.playerMarker.setPosition(city.x + 34, city.y + 2);
    this.drawAssetMarkers();
    this.hudDate.setText(dateLabel(s));
    this.hudGold.setText(`${s.gold} Gulden`);
    this.hudGold.setColor(s.gold < 0 ? '#d9534f' : '#c9a227');
    const upkeep = monthlyUpkeep(s);
    this.hudValue.setText(`Wert: ${companyValue(s)} fl.${upkeep > 0 ? ` · Kosten: ${upkeep}/Mon.` : ''}`);
    this.hudCargo.setText(`Fracht ${cargoTotal(s)}/${WAGON_CAPACITY} – in ${city.name} (Klick: Markt)`);
  }
}
