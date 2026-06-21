import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import type { StoryEvent } from '../types';

export class DialogScene extends Phaser.Scene {
  private lines: { speaker: string; text: string }[] = [];
  private lineIndex = 0;
  private onComplete?: string;
  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private portraitLetter!: Phaser.GameObjects.Text;
  private speakerColors: Record<string, string> = {
    Elendil:  '#ffd060',
    Isildur:  '#ff8040',
    'Anárion': '#80c0ff',
  };

  constructor() { super({ key: 'DialogScene' }); }

  init(data: { event: StoryEvent }): void {
    this.lines = data.event.lines;
    this.lineIndex = 0;
    this.onComplete = data.event.onComplete;
  }

  create(): void {
    // Semi-transparent overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55);

    const boxH = 175;
    const boxY = GAME_HEIGHT - boxH - 10;

    // Box background
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x0d0a1a, 0.97);
    boxBg.lineStyle(2, 0xc8a040, 1);
    boxBg.fillRoundedRect(30, boxY, GAME_WIDTH - 60, boxH, 10);
    boxBg.strokeRoundedRect(30, boxY, GAME_WIDTH - 60, boxH, 10);

    // Portrait area
    const portBg = this.add.graphics();
    portBg.fillStyle(0x1a1430, 1);
    portBg.lineStyle(2, 0xc8a040, 1);
    portBg.fillCircle(105, boxY + 87, 58);
    portBg.strokeCircle(105, boxY + 87, 58);

    this.portraitLetter = this.add.text(105, boxY + 87, '', {
      fontSize: '44px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);

    // Speaker name
    this.speakerText = this.add.text(176, boxY + 16, '', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#ffd060',
    });

    // Divider
    const div = this.add.graphics();
    div.lineStyle(1, 0xc8a040, 0.4);
    div.lineBetween(176, boxY + 42, GAME_WIDTH - 50, boxY + 42);

    // Dialog text
    this.bodyText = this.add.text(176, boxY + 50, '', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#e0d0b0',
      wordWrap: { width: GAME_WIDTH - 240 }, lineSpacing: 6,
    });

    // Hint
    const hint = this.add.text(GAME_WIDTH - 56, boxY + boxH - 20, '▶ weiter', {
      fontSize: '14px', color: '#8a7040',
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });

    // Progress dots
    const dots: Phaser.GameObjects.Arc[] = [];
    this.lines.forEach((_, i) => {
      const dot = this.add.circle(
        GAME_WIDTH / 2 - (this.lines.length - 1) * 8 + i * 16,
        boxY + boxH - 14, 4, 0x4a3820,
      );
      dots.push(dot);
    });
    this.updateDots = (idx: number) => {
      dots.forEach((d, i) => d.setFillStyle(i === idx ? 0xffd060 : (i < idx ? 0x8a6030 : 0x4a3820)));
    };

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());

    this.showLine(0);
  }

  private updateDots: (idx: number) => void = () => {};

  private showLine(i: number): void {
    const line = this.lines[i];
    if (!line) return;
    const color = this.speakerColors[line.speaker] ?? '#ffd060';
    this.speakerText.setText(line.speaker).setColor(color);
    this.bodyText.setText(line.text);
    this.portraitLetter.setText(line.speaker.charAt(0)).setColor(color);
    this.updateDots(i);
  }

  private advance(): void {
    this.lineIndex++;
    if (this.lineIndex < this.lines.length) {
      this.showLine(this.lineIndex);
    } else {
      this.input.keyboard?.off('keydown-SPACE');
      this.input.keyboard?.off('keydown-ENTER');
      this.events.emit('dialog_complete', this.onComplete);   // emit custom event FIRST
      this.scene.stop('DialogScene');
    }
  }
}
