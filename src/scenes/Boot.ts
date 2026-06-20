import Phaser from 'phaser';
import { TILE_CONFIG, COMBAT_CELL_W, COMBAT_CELL_H } from '../constants';

export class Boot extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create(): void {
    this.generateTileTextures();
    this.generateUnitTextures();
    this.generateHeroTexture();
    this.generateEnemyMarkerTexture();
    this.generateResourceTextures();
    this.generateArtifactTexture();
    this.scene.start('HeroSelectScene');
  }

  private rect(w: number, h: number, cb: (g: Phaser.GameObjects.Graphics) => void, key: string): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    cb(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private generateTileTextures(): void {
    Object.entries(TILE_CONFIG).forEach(([id, cfg]) => {
      this.rect(48, 48, g => {
        const tid = parseInt(id);

        // Base gradient effect
        g.fillStyle(cfg.color);
        g.fillRect(0, 0, 48, 48);

        // Subtle noise / texture
        const lighter = Math.min(0xffffff, cfg.color + 0x181818);
        const darker  = Math.max(0, cfg.color - 0x101010);
        g.fillStyle(lighter, 0.3);
        g.fillRect(0, 0, 48, 24);
        g.fillStyle(darker, 0.2);
        g.fillRect(0, 24, 48, 24);

        // Tile-type decorations
        if (tid === 2) { // forest
          g.fillStyle(0x1a4010, 0.7);
          for (const [tx, ty] of [[12,10],[28,10],[20,26],[10,28],[32,28]]) {
            g.fillTriangle(tx, ty + 14, tx + 8, ty, tx + 16, ty + 14);
          }
        } else if (tid === 1) { // mountain
          g.fillStyle(0x8a8070, 0.8);
          g.fillTriangle(4, 42, 20, 6, 36, 42);
          g.fillStyle(0xffffff, 0.3);
          g.fillTriangle(20, 6, 14, 20, 26, 20);
        } else if (tid === 4) { // ruins
          g.fillStyle(0x6a5040, 0.6);
          g.fillRect(4, 30, 8, 14);
          g.fillRect(16, 22, 8, 22);
          g.fillRect(28, 26, 8, 18);
          g.fillRect(36, 32, 8, 12);
          g.lineStyle(1, 0x9a8060, 0.4);
          g.lineBetween(4, 40, 44, 40);
        } else if (tid === 7) { // town
          g.fillStyle(0x5a5878, 0.9);
          g.fillRect(8, 16, 32, 26);
          g.fillStyle(0x3a3858, 0.9);
          g.fillRect(6, 10, 8, 10); g.fillRect(18, 8, 12, 12); g.fillRect(34, 10, 8, 10);
          g.fillStyle(0xc8a040, 0.8);
          g.fillRect(19, 24, 10, 14);
          g.lineStyle(1, 0xc8a040, 0.5);
          g.strokeRect(8, 16, 32, 26);
        } else if (tid === 3) { // water
          g.fillStyle(0x2a6a9a, 0.4);
          for (let wx = 0; wx < 48; wx += 12) {
            g.fillEllipse(wx + 6, 16, 14, 6);
            g.fillEllipse(wx + 12, 32, 14, 6);
          }
        } else if (tid === 6) { // wasteland
          g.fillStyle(0x5a4820, 0.4);
          for (const [rx, ry] of [[6,8],[22,18],[36,6],[10,30],[28,34]]) {
            g.fillCircle(rx, ry, 3);
          }
        }

        // Grid border
        g.lineStyle(1, 0x000000, 0.25);
        g.strokeRect(0, 0, 48, 48);
      }, `tile_${id}`);
    });
  }

  private generateUnitTextures(): void {
    const colors: Record<string, number> = {
      numenorean_warrior: 0x4a78c0, numenorean_archer: 0x3aa060,
      dunedain_ranger: 0x5a8040, elven_warrior: 0xc0c040, elven_cavalry: 0xe0d060,
      orc_soldier: 0x6a3010, orc_archer: 0x804010, orc_warg_rider: 0x8a4018,
      troll: 0x505850, nazgul: 0x2a1a3a,
    };
    Object.entries(colors).forEach(([id, color]) => {
      this.rect(COMBAT_CELL_W - 8, COMBAT_CELL_H - 14, g => {
        const w = COMBAT_CELL_W - 8, h = COMBAT_CELL_H - 14;
        g.fillStyle(color);
        g.fillRoundedRect(2, 2, w - 4, h - 4, 6);
        g.lineStyle(2, 0xffffff, 0.4);
        g.strokeRoundedRect(2, 2, w - 4, h - 4, 6);
        g.fillStyle(0xffffff, 0.12);
        g.fillTriangle(2, 2, w - 2, 2, 2, h / 2);
      }, `unit_${id}`);
    });
  }

  private generateHeroTexture(): void {
    this.rect(40, 40, g => {
      g.fillStyle(0xffd700);
      g.fillCircle(20, 20, 15);
      g.lineStyle(2, 0x8b6914, 1);
      g.strokeCircle(20, 20, 15);
      // Inner star
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(20, 20, 7);
      g.fillStyle(0xffd700);
      g.fillCircle(20, 20, 4);
    }, 'hero');
  }

  private generateEnemyMarkerTexture(): void {
    this.rect(40, 40, g => {
      g.fillStyle(0xcc2222);
      g.fillTriangle(20, 2, 38, 36, 2, 36);
      g.lineStyle(2, 0xff8888, 0.9);
      g.strokeTriangle(20, 2, 38, 36, 2, 36);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(18, 14, 4, 12);
      g.fillRect(18, 28, 4, 4);
    }, 'enemy_marker');
  }

  private generateResourceTextures(): void {
    // Gold pile
    this.rect(32, 32, g => {
      for (const [cx, cy, r] of [[14,20,8],[22,20,8],[18,14,8],[10,14,6],[26,14,6]]) {
        g.fillStyle(0xffd700);
        g.fillCircle(cx, cy, r);
        g.lineStyle(1, 0x8b6000, 0.5);
        g.strokeCircle(cx, cy, r);
      }
    }, 'resource_gold');

    // Artifact glow – diamond shape using polygon
    this.rect(32, 32, g => {
      g.fillStyle(0x8040c0, 0.35);
      g.fillCircle(16, 16, 13);
      g.fillStyle(0xc080ff, 1);
      g.fillTriangle(16, 2, 28, 16, 16, 24);
      g.fillTriangle(16, 30, 4, 16, 16, 8);
      g.lineStyle(2, 0xffffff, 0.7);
      g.strokeTriangle(16, 2, 28, 16, 16, 24);
      g.strokeTriangle(16, 30, 4, 16, 16, 8);
    }, 'resource_artifact');
  }

  private generateArtifactTexture(): void {
    this.rect(32, 32, g => {
      g.fillStyle(0xc080ff, 1);
      g.fillTriangle(16, 2, 28, 16, 16, 24);
      g.fillTriangle(16, 30, 4, 16, 16, 8);
      g.lineStyle(2, 0xffffff, 0.8);
      g.strokeTriangle(16, 2, 28, 16, 16, 24);
      g.strokeTriangle(16, 30, 4, 16, 16, 8);
    }, 'artifact_icon');
  }
}
