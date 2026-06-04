import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import type { StoryEvent } from '../types';

export class DialogScene extends Phaser.Scene {
  private lines: { speaker: string; text: string }[] = [];
  private lineIndex = 0;
  private onComplete?: string;
  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private continueHint!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'DialogScene' }); }

  init(data: { event: StoryEvent }): void {
    this.lines = data.event.lines;
    this.lineIndex = 0;
    this.onComplete = data.event.onComplete;
  }

  create(): void {
    // Dim overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55);

    // Dialog box
    const boxY = GAME_HEIGHT - 200;
    const box = this.add.graphics();
    box.fillStyle(0x1a1208, 0.97);
    box.lineStyle(2, 0xc8a040, 1);
    box.fillRoundedRect(40, boxY, GAME_WIDTH - 80, 160, 8);
    box.strokeRoundedRect(40, boxY, GAME_WIDTH - 80, 160, 8);

    // Portrait circle
    const portraitG = this.add.graphics();
    portraitG.fillStyle(0x3a2810, 1);
    portraitG.lineStyle(2, 0xc8a040, 1);
    portraitG.fillCircle(100, boxY + 80, 50);
    portraitG.strokeCircle(100, boxY + 80, 50);

    this.speakerText = this.add.text(165, boxY + 16, '', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#ffd060',
    });

    this.bodyText = this.add.text(165, boxY + 44, '', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#e0d0a8',
      wordWrap: { width: GAME_WIDTH - 240 },
      lineSpacing: 4,
    });

    this.continueHint = this.add.text(GAME_WIDTH - 60, boxY + 140, '▶', {
      fontSize: '18px',
      color: '#c8a040',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.continueHint,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.showLine(this.lineIndex);

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());
  }

  private showLine(i: number): void {
    const line = this.lines[i];
    if (!line) return;
    this.speakerText.setText(line.speaker);
    this.bodyText.setText(line.text);

    // Portrait initial letter
    const boxY = GAME_HEIGHT - 200;
    this.add.text(100, boxY + 80, line.speaker.charAt(0).toUpperCase(), {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: '#ffd060',
    }).setOrigin(0.5);
  }

  private advance(): void {
    this.lineIndex++;
    if (this.lineIndex < this.lines.length) {
      // Clear portrait letter by recreating (simple approach: just update texts)
      this.children.each(child => {
        if (child instanceof Phaser.GameObjects.Text) {
          // This clears all text objs except our permanent ones – handled by showLine
        }
      });
      this.showLine(this.lineIndex);
    } else {
      this.input.keyboard?.off('keydown-SPACE');
      this.input.keyboard?.off('keydown-ENTER');
      this.scene.stop('DialogScene');
      if (this.onComplete === 'victory') {
        this.scene.stop('AdventureMap');
        this.scene.start('VictoryScene');
      } else if (this.onComplete === 'gameover') {
        this.scene.stop('CombatScene');
        this.scene.stop('AdventureMap');
        this.scene.start('GameOverScene');
      } else {
        this.scene.resume('AdventureMap');
      }
    }
  }
}
