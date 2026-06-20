import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { SKILL_DEFS } from '../data/skills';
import { state, applySkill } from '../GameState';

export class LevelUpScene extends Phaser.Scene {
  private choices: string[] = [];
  private resumeScene = 'AdventureMap';

  constructor() { super({ key: 'LevelUpScene' }); }

  init(data: { resumeScene?: string }): void {
    this.resumeScene = data.resumeScene ?? 'AdventureMap';
    this.choices = this.pickThreeSkills();
  }

  create(): void {
    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    // Panel
    const pw = 760, ph = 420, px = (GAME_WIDTH - pw) / 2, py = (GAME_HEIGHT - ph) / 2;
    const bg = this.add.graphics();
    bg.fillStyle(0x0d0a1a, 0.98);
    bg.lineStyle(2, 0xc8a040, 1);
    bg.fillRoundedRect(px, py, pw, ph, 12);
    bg.strokeRoundedRect(px, py, pw, ph, 12);

    this.add.text(GAME_WIDTH / 2, py + 30, `✦ STUFE AUFGESTIEGEN! ✦`, {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, py + 62, `${state.hero.name} erreicht Stufe ${state.hero.level} – wähle eine Fähigkeit:`, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c0b090',
    }).setOrigin(0.5);

    const cardW = 210, cardH = 240, gapX = 20;
    const totalW = this.choices.length * cardW + (this.choices.length - 1) * gapX;
    const startX = (GAME_WIDTH - totalW) / 2;

    this.choices.forEach((skillId, idx) => {
      const def = SKILL_DEFS[skillId];
      const curLevel = state.hero.skills[skillId] ?? 0;
      const nextLevel = curLevel + 1;
      const cx = startX + idx * (cardW + gapX);
      const cy = py + 100;

      const cardG = this.add.graphics();
      cardG.fillStyle(0x1a1428, 1);
      cardG.lineStyle(2, 0x4a3820, 0.8);
      cardG.fillRoundedRect(cx, cy, cardW, cardH, 8);
      cardG.strokeRoundedRect(cx, cy, cardW, cardH, 8);

      // Level stars
      const stars = '★'.repeat(nextLevel) + '☆'.repeat(def.maxLevel - nextLevel);
      this.add.text(cx + cardW / 2, cy + 20, stars, {
        fontSize: '20px', color: '#ffd060',
      }).setOrigin(0.5);

      this.add.text(cx + cardW / 2, cy + 52, def.name, {
        fontSize: '18px', fontFamily: 'Georgia, serif', color: '#ffd060',
      }).setOrigin(0.5);

      this.add.text(cx + cardW / 2, cy + 78, `Stufe ${nextLevel}`, {
        fontSize: '13px', color: '#a09060',
      }).setOrigin(0.5);

      this.add.text(cx + 14, cy + 100, def.description(nextLevel), {
        fontSize: '13px', fontFamily: 'Georgia, serif', color: '#e0d0a8',
        wordWrap: { width: cardW - 28 }, lineSpacing: 4,
      });

      // Select button
      const btnY = cy + cardH - 44;
      const btnG = this.add.graphics();
      btnG.fillStyle(0x3a2810, 1);
      btnG.lineStyle(2, 0xc8a040, 1);
      btnG.fillRoundedRect(cx + 16, btnY, cardW - 32, 34, 6);
      btnG.strokeRoundedRect(cx + 16, btnY, cardW - 32, 34, 6);
      const btnTxt = this.add.text(cx + cardW / 2, btnY + 17, 'WÄHLEN', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#ffd060',
      }).setOrigin(0.5);

      const zone = this.add.zone(cx + cardW / 2, cy + cardH / 2, cardW, cardH).setInteractive({ cursor: 'pointer' });
      zone.on('pointerover', () => {
        cardG.clear();
        cardG.fillStyle(0x241c38, 1);
        cardG.lineStyle(2, 0xffd060, 1);
        cardG.fillRoundedRect(cx, cy, cardW, cardH, 8);
        cardG.strokeRoundedRect(cx, cy, cardW, cardH, 8);
        btnTxt.setColor('#ffffff');
      });
      zone.on('pointerout', () => {
        cardG.clear();
        cardG.fillStyle(0x1a1428, 1);
        cardG.lineStyle(2, 0x4a3820, 0.8);
        cardG.fillRoundedRect(cx, cy, cardW, cardH, 8);
        cardG.strokeRoundedRect(cx, cy, cardW, cardH, 8);
        btnTxt.setColor('#ffd060');
      });
      zone.on('pointerdown', () => this.choose(skillId));
    });
  }

  private pickThreeSkills(): string[] {
    const allSkills = Object.keys(SKILL_DEFS);
    const available = allSkills.filter(s => (state.hero.skills[s] ?? 0) < SKILL_DEFS[s].maxLevel);
    Phaser.Utils.Array.Shuffle(available);
    return available.slice(0, 3);
  }

  private choose(skillId: string): void {
    applySkill(skillId);
    this.scene.stop('LevelUpScene');
    this.scene.resume(this.resumeScene);
  }
}
