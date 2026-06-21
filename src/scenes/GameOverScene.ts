import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { music } from '../audio/ChiptuneEngine';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  create(): void {
    music.play('gameover');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0505, 1);

    this.add.text(GAME_WIDTH / 2, 180, 'MITTELERDE IST GEFALLEN', {
      fontSize: '44px', fontFamily: 'Georgia, serif',
      color: '#cc2222', stroke: '#1a0000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 280, [
      'Saurons Dunkelheit breitet sich aus.',
      'Elendils Armee wurde vernichtet.',
      '',
      '"Nicht alle Tränen sind ein Übel."',
      '— Gandalf',
    ].join('\n'), {
      fontSize: '20px', fontFamily: 'Georgia, serif',
      color: '#a07060', align: 'center', lineSpacing: 10,
    }).setOrigin(0.5);

    const bg = this.add.graphics();
    bg.fillStyle(0x3a1008, 1);
    bg.lineStyle(2, 0xcc4444, 1);
    bg.fillRoundedRect(GAME_WIDTH / 2 - 110, 400, 220, 50, 6);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - 110, 400, 220, 50, 6);
    const txt = this.add.text(GAME_WIDTH / 2, 425, 'NOCHMAL VERSUCHEN', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ff8888',
    }).setOrigin(0.5);
    const zone = this.add.zone(GAME_WIDTH / 2, 425, 220, 50).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => { music.stop(); this.scene.start('MainMenu'); });
    zone.on('pointerover', () => txt.setColor('#ffffff'));
    zone.on('pointerout', () => txt.setColor('#ff8888'));
  }
}
