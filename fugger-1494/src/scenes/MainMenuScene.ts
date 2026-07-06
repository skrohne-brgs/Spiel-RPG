import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { newGame, loadGame, hasSave } from '../state';
import mapPng from '../assets/map.png';
import { preloadArt } from '../art';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload(): void {
    if (!this.textures.exists('map')) this.load.image('map', mapPng);
    preloadArt(this);
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'map').setAlpha(0.35);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 640, 540, COLORS.parchment)
      .setStrokeStyle(5, COLORS.gold);

    const wappen = this.add.image(GAME_WIDTH / 2, 160, 'wappen').setScale(0.62);
    this.tweens.add({
      targets: wappen, y: 154, duration: 1800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.add.text(GAME_WIDTH / 2, 268, '1494', {
      fontFamily: 'Georgia, serif', fontSize: '84px', color: '#8a2f1f', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 344, 'Aufstieg der Fugger', {
      fontFamily: 'Georgia, serif', fontSize: '32px', color: '#3a2a14',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 386, 'Eine Handelssimulation', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#6b5636', fontStyle: 'italic',
    }).setOrigin(0.5);

    this.makeButton(GAME_WIDTH / 2, 455, 'Neues Spiel', () => {
      newGame();
      this.scene.start('MapScene');
    });

    if (hasSave()) {
      this.makeButton(GAME_WIDTH / 2, 515, 'Weiterspielen', () => {
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
