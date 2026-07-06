import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { MILESTONES, companyValue } from '../sim/milestones';
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
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, GAME_HEIGHT - 60, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 60,
      `Chronik des Hauses — ${dateLabel(s)}` + (s.flags.sieg ? ' — SIEG ERRUNGEN' : ''), {
        fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3a2a14', fontStyle: 'bold',
      }).setOrigin(0.5, 0);

    // Rangliste der Handelshäuser (rechts oben)
    const houses = [
      { name: 'Dein Haus', wealth: companyValue(s) },
      ...s.rivals.map((r) => ({ name: r.name, wealth: r.wealth })),
    ].sort((a, b) => b.wealth - a.wealth);
    this.add.text(920, 110, 'Rangliste der Häuser', {
      fontFamily: 'Georgia, serif', fontSize: '19px', color: '#3a2a14', fontStyle: 'bold',
    });
    houses.forEach((h, i) => {
      const mine = h.name === 'Dein Haus';
      this.add.text(920, 145 + i * 28, `${i + 1}. ${h.name}: ${h.wealth} fl.`, {
        fontFamily: 'Georgia, serif', fontSize: '16px',
        color: mine ? '#8a2f1f' : '#6b5636', fontStyle: mine ? 'bold' : 'normal',
      });
    });
    this.add.text(920, 275, `Ruf: ${s.reputation}/100`, {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#6b5636',
    });

    MILESTONES.forEach((m, i) => {
      const y = 110 + i * 52;
      const reached = s.milestones.includes(m.id);
      this.add.text(150, y, reached ? '✦' : '·', {
        fontFamily: 'Georgia, serif', fontSize: '24px',
        color: reached ? '#c9a227' : '#9b8a5a',
      });
      this.add.text(190, y, reached ? m.event.title : 'Noch nicht erreicht', {
        fontFamily: 'Georgia, serif', fontSize: '20px', fontStyle: 'bold',
        color: reached ? '#3a2a14' : '#9b8a5a',
      });
      if (reached) {
        this.add.text(190, y + 24, m.event.text.replace(/\n/g, ' '), {
          fontFamily: 'Georgia, serif', fontSize: '13px', color: '#6b5636',
          wordWrap: { width: 660 },
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
