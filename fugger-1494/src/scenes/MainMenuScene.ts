import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { newGame, loadGame, hasSave } from '../state';
import mapPng from '../assets/map.png';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload(): void {
    if (!this.textures.exists('map')) this.load.image('map', mapPng);
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'map').setAlpha(0.35);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 640, 460, COLORS.parchment)
      .setStrokeStyle(5, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 200, '1494', {
      fontFamily: 'Georgia, serif', fontSize: '96px', color: '#8a2f1f', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 290, 'Aufstieg der Fugger', {
      fontFamily: 'Georgia, serif', fontSize: '32px', color: '#3a2a14',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 335, 'Eine Handelssimulation', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#6b5636', fontStyle: 'italic',
    }).setOrigin(0.5);

    this.makeButton(GAME_WIDTH / 2, 420, 'Neues Spiel', () => {
      newGame();
      this.scene.start('MapScene');
    });

    if (hasSave()) {
      this.makeButton(GAME_WIDTH / 2, 480, 'Weiterspielen', () => {
        if (loadGame()) this.scene.start('MapScene');
      });
    }
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '26px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 28, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
  }
}
