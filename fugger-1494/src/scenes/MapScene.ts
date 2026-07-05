import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { CITIES, getCity } from '../data/cities';
import { getState, endTurn, dateLabel, cargoTotal, newGame } from '../state';

// Kartenübersicht: Europakarte mit Städten, Reisen kostet einen Monat.
// Die Karte ist vorerst prozedural gezeichnet; kann später durch eine
// Bilddatei (assets/map.png) ersetzt werden.
export class MapScene extends Phaser.Scene {
  private hudGold!: Phaser.GameObjects.Text;
  private hudDate!: Phaser.GameObjects.Text;
  private hudCargo!: Phaser.GameObjects.Text;
  private playerMarker!: Phaser.GameObjects.Arc;
  private cityLabels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('MapScene');
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
    const g = this.add.graphics();
    g.fillStyle(COLORS.sea);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // grobe Landmasse als Platzhalter
    g.fillStyle(COLORS.land);
    g.fillRoundedRect(80, 120, 900, 420, 80);
    g.fillRoundedRect(100, 480, 250, 180, 60);
    g.fillRoundedRect(560, 480, 260, 200, 60);

    // Routen
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
    this.hudGold = this.add.text(300, 20, '', { ...style, color: COLORS.uiAccent }).setDepth(11);
    this.hudCargo = this.add.text(560, 20, '', style).setDepth(11);

    const wait = this.add.text(GAME_WIDTH - 24, 20, '⌛ Monat warten', {
      ...style, color: COLORS.uiAccent,
    }).setOrigin(1, 0).setDepth(11).setInteractive({ useHandCursor: true });
    wait.on('pointerdown', () => {
      endTurn(getState());
      this.refresh();
    });
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
      endTurn(s);
      this.refresh();
    }
  }

  private refresh(): void {
    const s = getState();
    const city = getCity(s.cityId);
    this.playerMarker.setPosition(city.x, city.y - 20);
    this.hudDate.setText(dateLabel(s));
    this.hudGold.setText(`${s.gold} Gulden`);
    this.hudCargo.setText(`Fracht: ${cargoTotal(s)}/${WAGON_CAPACITY} – in ${city.name} (Klick: Markt)`);
  }
}
