import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { music } from '../audio/ChiptuneEngine';

export class VictoryScene extends Phaser.Scene {
  constructor() { super({ key: 'VictoryScene' }); }

  create(): void {
    music.play('victory');
    // Starfield
    for (let i = 0; i < 300; i++) {
      this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Math.random() < 0.1 ? 2 : 1,
        0xffffff,
        0.3 + Math.random() * 0.7,
      );
    }

    this.add.text(GAME_WIDTH / 2, 140, 'ERIADOR IST BEFREIT!', {
      fontSize: '52px', fontFamily: 'Georgia, serif',
      color: '#ffd060', stroke: '#3a2000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 230, 'Die Letzte Allianz', {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 340, [
      'Elendil versammelt die Könige der Menschen und der Elben.',
      'Die Letzte Allianz zieht gen Mordor und belagert Barad-dûr.',
      'Sieben Jahre kämpfen sie, bevor Sauron fällt.',
      '',
      '"Estel" – Hoffnung – lebt in Mittelerde weiter.',
    ].join('\n'), {
      fontSize: '19px', fontFamily: 'Georgia, serif', color: '#c0b080',
      align: 'center', lineSpacing: 10,
    }).setOrigin(0.5);

    // Buttons
    this.createBtn(GAME_WIDTH / 2 - 140, 520, 'NOCHMAL SPIELEN', () => {
      music.stop();
      this.scene.start('MainMenu');
    });
    this.createBtn(GAME_WIDTH / 2 + 140, 520, 'HAUPTMENÜ', () => {
      music.stop();
      this.scene.start('MainMenu');
    });

    // Decorative stars
    this.tweens.add({
      targets: this.add.text(GAME_WIDTH / 2, 460, '✦ ✦ ✦', {
        fontSize: '28px', color: '#ffd060',
      }).setOrigin(0.5),
      alpha: 0.3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });
  }

  private createBtn(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x3a2810, 1);
    bg.lineStyle(2, 0xc8a040, 1);
    bg.fillRoundedRect(x - 110, y - 22, 220, 44, 6);
    bg.strokeRoundedRect(x - 110, y - 22, 220, 44, 6);
    const txt = this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 220, 44).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', cb);
    zone.on('pointerover', () => txt.setColor('#ffffff'));
    zone.on('pointerout', () => txt.setColor('#ffd060'));
  }
}
