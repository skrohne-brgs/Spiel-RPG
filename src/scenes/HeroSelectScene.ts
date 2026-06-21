import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { HERO_DEFS } from '../data/heroes';
import { resetState } from '../GameState';
import type { HeroData } from '../types';

export class HeroSelectScene extends Phaser.Scene {
  private selected: HeroData = HERO_DEFS[0];
  private cardGraphics: Phaser.GameObjects.Graphics[] = [];
  private descText!: Phaser.GameObjects.Text;
  private loreText!: Phaser.GameObjects.Text;
  private confirmBtn!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'HeroSelectScene' }); }

  create(): void {
    // Background with stars
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05050f);
    for (let i = 0; i < 180; i++) {
      this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        Math.random() < 0.08 ? 2 : 1, 0xffffff, 0.2 + Math.random() * 0.8,
      );
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 45, 'WÄHLE DEINEN HELDEN', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#c8a040',
      stroke: '#2a1000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 88, 'Jeder Held hat einzigartige Fähigkeiten und Startzauber', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#806040',
    }).setOrigin(0.5);

    // Hero cards
    const cardW = 290, cardH = 340, gap = 40;
    const totalW = HERO_DEFS.length * cardW + (HERO_DEFS.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;

    HERO_DEFS.forEach((hero, idx) => {
      const cx = startX + idx * (cardW + gap) + cardW / 2;
      const cy = 300;
      this.createCard(hero, cx, cy, cardW, cardH, idx);
    });

    // Description panel
    const panelY = 510;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0d0d1a, 0.95);
    panelBg.lineStyle(1, 0x4a3820, 0.8);
    panelBg.fillRoundedRect(60, panelY, GAME_WIDTH - 120, 130, 8);
    panelBg.strokeRoundedRect(60, panelY, GAME_WIDTH - 120, 130, 8);

    this.descText = this.add.text(GAME_WIDTH / 2, panelY + 22, '', {
      fontSize: '17px', fontFamily: 'Georgia, serif', color: '#ffd060', align: 'center',
    }).setOrigin(0.5);

    this.loreText = this.add.text(GAME_WIDTH / 2, panelY + 55, '', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#c0b090', align: 'center',
      wordWrap: { width: GAME_WIDTH - 180 },
    }).setOrigin(0.5);

    // Confirm button
    const btnG = this.add.graphics();
    btnG.fillStyle(0x3a2810, 1);
    btnG.lineStyle(2, 0xc8a040, 1);
    btnG.fillRoundedRect(GAME_WIDTH / 2 - 130, GAME_HEIGHT - 68, 260, 50, 8);
    btnG.strokeRoundedRect(GAME_WIDTH / 2 - 130, GAME_HEIGHT - 68, 260, 50, 8);
    const btnTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 43, 'ABENTEUER BEGINNEN', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const zone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT - 43, 260, 50).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => this.startGame());
    zone.on('pointerover', () => { btnTxt.setColor('#ffffff'); });
    zone.on('pointerout', () => { btnTxt.setColor('#ffd060'); });

    this.selectHero(HERO_DEFS[0]);
  }

  private createCard(hero: HeroData, cx: number, cy: number, w: number, h: number, idx: number): void {
    const hx = cx - w / 2, hy = cy - h / 2;

    const bg = this.add.graphics();
    this.cardGraphics[idx] = bg;
    this.drawCard(bg, hx, hy, w, h, hero, false);

    // Skill badges
    const skills = Object.keys(hero.skills);
    skills.forEach((sid, si) => {
      this.add.text(cx - (skills.length * 30 / 2) + si * 30 + 10, hy + h - 50, `[${sid.slice(0,3).toUpperCase()}]`, {
        fontSize: '11px', color: '#80b0ff',
      }).setOrigin(0.5);
    });

    // Stats
    this.add.text(hx + 16, hy + h - 90, `ATK ${hero.attack}  DEF ${hero.defense}  WIS ${hero.knowledge}  FHR ${hero.leadership}`, {
      fontSize: '12px', color: '#c0b090',
    });

    const zone = this.add.zone(cx, cy, w, h).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => this.selectHero(hero));
    zone.on('pointerover', () => { if (this.selected !== hero) this.highlightCard(idx, hero, hx, hy, w, h, true); });
    zone.on('pointerout',  () => { if (this.selected !== hero) this.highlightCard(idx, hero, hx, hy, w, h, false); });
  }

  private drawCard(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number,
    hero: HeroData, selected: boolean,
  ): void {
    g.clear();
    g.fillStyle(selected ? 0x1a1428 : 0x0d0d1a, 1);
    g.lineStyle(2, selected ? 0xffd060 : 0x4a3820, selected ? 1 : 0.6);
    g.fillRoundedRect(x, y, w, h, 8);
    g.strokeRoundedRect(x, y, w, h, 8);

    // Hero portrait circle
    g.fillStyle(hero.color, 0.3);
    g.fillCircle(x + w / 2, y + 90, 60);
    g.lineStyle(3, hero.color, selected ? 0.9 : 0.5);
    g.strokeCircle(x + w / 2, y + 90, 60);

    if (selected) {
      // Glow effect
      g.lineStyle(6, hero.color, 0.2);
      g.strokeCircle(x + w / 2, y + 90, 68);
    }
  }

  private highlightCard(idx: number, hero: HeroData, x: number, y: number, w: number, h: number, hover: boolean): void {
    const g = this.cardGraphics[idx];
    if (!g) return;
    g.clear();
    g.fillStyle(hover ? 0x141428 : 0x0d0d1a, 1);
    g.lineStyle(2, hover ? 0x8080c0 : 0x4a3820, hover ? 0.8 : 0.6);
    g.fillRoundedRect(x, y, w, h, 8);
    g.strokeRoundedRect(x, y, w, h, 8);
    g.fillStyle(hero.color, hover ? 0.2 : 0.15);
    g.fillCircle(x + w / 2, y + 90, 60);
    g.lineStyle(3, hero.color, hover ? 0.4 : 0.3);
    g.strokeCircle(x + w / 2, y + 90, 60);
  }

  private heroNameTexts: Phaser.GameObjects.Text[] = [];

  private selectHero(hero: HeroData): void {
    this.selected = hero;
    const cardW = 290, cardH = 340, gap = 40;
    const totalW = HERO_DEFS.length * cardW + (HERO_DEFS.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;

    HERO_DEFS.forEach((h, idx) => {
      const cx = startX + idx * (cardW + gap);
      const cy = 300 - cardH / 2;
      this.drawCard(this.cardGraphics[idx], cx, cy, cardW, cardH, h, h === hero);
    });

    const spellList = hero.spells.join(', ');
    this.descText.setText(`${hero.name} – ${hero.title}`);
    this.loreText.setText(
      `${hero.lore}\n\nStartzauber: ${spellList}  |  Startzustand: ${hero.startingArmy.map(s => `${s.count}× ${s.unitId.replace(/_/g,' ')}`).join(', ')}`,
    );
  }

  private startGame(): void {
    resetState(this.selected.id);
    this.scene.start('CampaignScene');
  }
}
