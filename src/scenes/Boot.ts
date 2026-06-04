import Phaser from 'phaser';
import { TILE_CONFIG, COMBAT_CELL_W, COMBAT_CELL_H } from '../constants';

export class Boot extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create(): void {
    this.generateTileTextures();
    this.generateUnitTextures();
    this.generateHeroTexture();
    this.generateEnemyMarkerTexture();
    this.scene.start('MainMenu');
  }

  private generateTileTextures(): void {
    Object.entries(TILE_CONFIG).forEach(([id, cfg]) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(cfg.color);
      g.fillRect(0, 0, 48, 48);
      g.lineStyle(1, 0x000000, 0.3);
      g.strokeRect(0, 0, 48, 48);

      // Decorative pattern per tile type
      const tid = parseInt(id);
      g.fillStyle(cfg.color - 0x101010 < 0 ? 0 : cfg.color - 0x101010, 0.4);
      if (tid === 2) { // forest: trees
        g.fillTriangle(12, 12, 24, 4, 36, 12);
        g.fillTriangle(12, 28, 24, 20, 36, 28);
      } else if (tid === 1) { // mountain: peak
        g.fillTriangle(8, 40, 24, 8, 40, 40);
      } else if (tid === 4) { // ruins: cross lines
        g.lineStyle(1, 0x888880, 0.5);
        g.lineBetween(4, 4, 44, 44);
        g.lineBetween(44, 4, 4, 44);
      } else if (tid === 7) { // town: battlements
        g.fillRect(6, 8, 8, 12);
        g.fillRect(20, 6, 8, 14);
        g.fillRect(34, 8, 8, 12);
        g.fillRect(6, 28, 36, 14);
      }

      g.generateTexture(`tile_${id}`, 48, 48);
      g.destroy();
    });
  }

  private generateUnitTextures(): void {
    const unitColors: Record<string, number> = {
      numenorean_warrior: 0x4a78c0,
      numenorean_archer:  0x3aa060,
      elven_warrior:      0xc0c040,
      orc_soldier:        0x6a3010,
      orc_archer:         0x804010,
      troll:              0x505850,
    };

    Object.entries(unitColors).forEach(([id, color]) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      const w = COMBAT_CELL_W - 8;
      const h = COMBAT_CELL_H - 16;
      g.fillStyle(color);
      g.fillRoundedRect(2, 2, w - 4, h - 4, 6);
      g.lineStyle(2, 0xffffff, 0.5);
      g.strokeRoundedRect(2, 2, w - 4, h - 4, 6);
      g.generateTexture(`unit_${id}`, w, h);
      g.destroy();
    });
  }

  private generateHeroTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Gold star/hero marker
    g.fillStyle(0xffd700);
    g.fillCircle(20, 20, 14);
    g.fillStyle(0xffffff);
    g.fillCircle(20, 20, 8);
    g.fillStyle(0xffd700);
    g.fillCircle(20, 20, 5);
    g.lineStyle(2, 0x8b6914, 1);
    g.strokeCircle(20, 20, 14);
    g.generateTexture('hero', 40, 40);
    g.destroy();
  }

  private generateEnemyMarkerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xcc2222);
    g.fillTriangle(20, 2, 38, 36, 2, 36);
    g.lineStyle(2, 0xff8888, 0.8);
    g.strokeTriangle(20, 2, 38, 36, 2, 36);
    g.generateTexture('enemy_marker', 40, 40);
    g.destroy();
  }
}
