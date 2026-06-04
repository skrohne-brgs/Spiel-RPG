import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class MainMenu extends Phaser.Scene {
  constructor() { super({ key: 'MainMenu' }); }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Starfield background
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const r = Math.random() < 0.1 ? 2 : 1;
      const a = 0.4 + Math.random() * 0.6;
      this.add.circle(x, y, r, 0xffffff, a);
    }

    // Dark sea horizon
    const horizon = this.add.graphics();
    horizon.fillGradientStyle(0x0d0d2a, 0x0d0d2a, 0x1a2a4a, 0x1a2a4a, 1);
    horizon.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    horizon.setAlpha(0.6);

    // Title
    this.add.text(cx, 140, 'MITTELERDE', {
      fontSize: '64px',
      fontFamily: 'Georgia, serif',
      color: '#c8a040',
      stroke: '#3a2000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 210, 'Erben des Zweiten Zeitalters', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: '#a08040',
      stroke: '#1a0a00',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(1, 0xc8a040, 0.6);
    line.lineBetween(cx - 280, 250, cx + 280, 250);

    // Lore text
    this.add.text(cx, 320, [
      'Númenor ist versunken. Saurons Schatten breitet sich über Mittelerde aus.',
      'Du bist Elendil, Fürst von Andúnië, einziger Überlebender des Untergangs.',
      'Führe dein Volk durch Eriador und schmiede die Letzte Allianz.',
    ].join('\n'), {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#c0b090',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Start button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x3a2810, 1);
    btnBg.lineStyle(2, 0xc8a040, 1);
    btnBg.fillRoundedRect(cx - 120, 430, 240, 55, 8);
    btnBg.strokeRoundedRect(cx - 120, 430, 240, 55, 8);

    const btnText = this.add.text(cx, 457, 'NEUES SPIEL', {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      color: '#ffd060',
    }).setOrigin(0.5);

    // Hover effect
    const hitArea = this.add.zone(cx, 457, 240, 55).setInteractive({ cursor: 'pointer' });
    hitArea.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x5a3c18, 1);
      btnBg.lineStyle(2, 0xffd060, 1);
      btnBg.fillRoundedRect(cx - 120, 430, 240, 55, 8);
      btnBg.strokeRoundedRect(cx - 120, 430, 240, 55, 8);
      btnText.setColor('#ffffff');
    });
    hitArea.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x3a2810, 1);
      btnBg.lineStyle(2, 0xc8a040, 1);
      btnBg.fillRoundedRect(cx - 120, 430, 240, 55, 8);
      btnBg.strokeRoundedRect(cx - 120, 430, 240, 55, 8);
      btnText.setColor('#ffd060');
    });
    hitArea.on('pointerdown', () => this.scene.start('AdventureMap'));

    // Version
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v0.1 – PoC', {
      fontSize: '12px',
      color: '#504030',
    }).setOrigin(1, 1);
  }
}
