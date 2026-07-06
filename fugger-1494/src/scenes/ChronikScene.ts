import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { MILESTONES } from '../sim/milestones';
import { getState, dateLabel } from '../state';

// Chronik: alle Meilensteine des Handelshauses – erreichte mit vollem
// Text, offene nur als Andeutung.
export class ChronikScene extends Phaser.Scene {
  constructor() {
    super('ChronikScene');
  }

  create(): void {
    const s = getState();

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 900, GAME_HEIGHT - 60, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 60,
      `Chronik des Hauses — ${dateLabel(s)}` + (s.flags.sieg ? ' — SIEG ERRUNGEN' : ''), {
        fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3a2a14', fontStyle: 'bold',
      }).setOrigin(0.5, 0);

    MILESTONES.forEach((m, i) => {
      const y = 125 + i * 60;
      const reached = s.milestones.includes(m.id);
      this.add.text(220, y, reached ? '✦' : '·', {
        fontFamily: 'Georgia, serif', fontSize: '24px',
        color: reached ? '#c9a227' : '#9b8a5a',
      });
      this.add.text(260, y, reached ? m.event.title : 'Noch nicht erreicht', {
        fontFamily: 'Georgia, serif', fontSize: '20px', fontStyle: 'bold',
        color: reached ? '#3a2a14' : '#9b8a5a',
      });
      if (reached) {
        this.add.text(260, y + 26, m.event.text.replace(/\n/g, ' '), {
          fontFamily: 'Georgia, serif', fontSize: '14px', color: '#6b5636',
          wordWrap: { width: 760 },
        });
      }
    });

    const btn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'Zurück zur Karte', {
      fontFamily: 'Georgia, serif', fontSize: '19px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 14, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
