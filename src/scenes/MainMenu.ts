import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class MainMenu extends Phaser.Scene {
  constructor() { super({ key: 'MainMenu' }); }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Starfield
    for (let i = 0; i < 220; i++) {
      const s = Math.random() < 0.08 ? 2 : 1;
      this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        s, 0xffffff, 0.2 + Math.random() * 0.8,
      );
    }

    // Gradient overlay
    const ov = this.add.graphics();
    ov.fillGradientStyle(0x0d0d2a, 0x0d0d2a, 0x0a1a0a, 0x0a1a0a, 0.7);
    ov.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(cx, 130, 'MITTELERDE', {
      fontSize: '68px', fontFamily: 'Georgia, serif', color: '#c8a040',
      stroke: '#3a2000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 208, 'Erben des Zweiten Zeitalters', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#a08040',
    }).setOrigin(0.5);

    const line = this.add.graphics();
    line.lineStyle(1, 0xc8a040, 0.5);
    line.lineBetween(cx - 300, 250, cx + 300, 250);

    // Lore
    this.add.text(cx, 320, [
      'Númenor ist versunken. Elendil landet mit den Überlebenden in Mittelerde.',
      'Saurons Schatten breitet sich über Eriador aus.',
      'Führe deinen Helden durch eine feindliche Welt.',
      'Schmiede die Letzte Allianz.',
    ].join('\n'), {
      fontSize: '17px', fontFamily: 'Georgia, serif', color: '#c0b090',
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    // Feature bullets
    this.add.text(cx, 440, '⚔ Rundenbasiertes Kampfsystem   •   ✦ Zauber & Magie   •   🏰 Städte & Ressourcen', {
      fontSize: '14px', color: '#806040',
    }).setOrigin(0.5);

    // New game button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x3a2810, 1);
    btnBg.lineStyle(2, 0xc8a040, 1);
    btnBg.fillRoundedRect(cx - 130, 480, 260, 56, 8);
    btnBg.strokeRoundedRect(cx - 130, 480, 260, 56, 8);
    const btnTxt = this.add.text(cx, 508, 'NEUES SPIEL', {
      fontSize: '24px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const zone = this.add.zone(cx, 508, 260, 56).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0x5a3c18, 1).lineStyle(2, 0xffd060, 1).fillRoundedRect(cx - 130, 480, 260, 56, 8).strokeRoundedRect(cx - 130, 480, 260, 56, 8); btnTxt.setColor('#ffffff'); });
    zone.on('pointerout',  () => { btnBg.clear(); btnBg.fillStyle(0x3a2810, 1).lineStyle(2, 0xc8a040, 1).fillRoundedRect(cx - 130, 480, 260, 56, 8).strokeRoundedRect(cx - 130, 480, 260, 56, 8); btnTxt.setColor('#ffd060'); });
    zone.on('pointerdown', () => this.scene.start('HeroSelectScene'));

    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v0.2', { fontSize: '12px', color: '#404030' }).setOrigin(1, 1);
  }
}
