import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { UNIT_DEFS } from '../data/units';
import { CAMPAIGN } from '../data/campaign';
import { state } from '../GameState';
import type { MissionCity, UnitStack } from '../types';

export class CityScene extends Phaser.Scene {
  private city!: MissionCity;
  private goldText!: Phaser.GameObjects.Text;
  private recruitAvailable: number[] = [];

  constructor() { super({ key: 'CityScene' }); }

  init(data: { cityId: string; missionIdx?: number }): void {
    const missionIdx = data.missionIdx ?? state.currentMissionIdx;
    const mission = CAMPAIGN[missionIdx];
    this.city = mission.cities.find(c => c.id === data.cityId) ?? mission.cities[0];
    this.recruitAvailable = this.city.recruitOptions.map(o => o.available);
  }

  create(): void {
    // Overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    const pw = 900, ph = 560, px = (GAME_WIDTH - pw) / 2, py = (GAME_HEIGHT - ph) / 2;
    const bg = this.add.graphics();
    bg.fillStyle(0x0d0d1a, 0.98);
    bg.lineStyle(2, 0xc8a040, 1);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.strokeRoundedRect(px, py, pw, ph, 10);

    // Header
    bg.fillStyle(0x1a1428, 1);
    bg.fillRoundedRect(px, py, pw, 60, 10);
    this.add.text(GAME_WIDTH / 2, py + 30, `🏰  ${this.city.name}`, {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, py + 75, this.city.description, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#a09060',
    }).setOrigin(0.5);

    // Gold
    this.goldText = this.add.text(px + pw - 20, py + 30, `Gold: ${state.gold}`, {
      fontSize: '16px', color: '#ffd060',
    }).setOrigin(1, 0.5);

    // Recruitment options
    this.add.text(px + 24, py + 100, '── Anwerbung ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    });

    this.city.recruitOptions.forEach((opt, idx) => {
      this.createRecruitRow(opt, idx, px + 20, py + 130 + idx * 80, pw - 40);
    });

    // Current army
    this.add.text(px + 24, py + 340, '── Aktuelle Armee ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    });
    this.renderArmy(px + 20, py + 370, pw - 40);

    // Close button
    const closeG = this.add.graphics();
    closeG.fillStyle(0x3a2810, 1);
    closeG.lineStyle(2, 0xc8a040, 1);
    closeG.fillRoundedRect(GAME_WIDTH / 2 - 80, py + ph - 54, 160, 40, 6);
    closeG.strokeRoundedRect(GAME_WIDTH / 2 - 80, py + ph - 54, 160, 40, 6);
    const closeTxt = this.add.text(GAME_WIDTH / 2, py + ph - 34, 'VERLASSEN', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const closeZone = this.add.zone(GAME_WIDTH / 2, py + ph - 34, 160, 40).setInteractive({ cursor: 'pointer' });
    closeZone.on('pointerdown', () => { this.scene.stop('CityScene'); this.scene.resume('AdventureMap'); });
    closeZone.on('pointerover', () => closeTxt.setColor('#ffffff'));
    closeZone.on('pointerout', () => closeTxt.setColor('#ffd060'));
  }

  private createRecruitRow(
    opt: { unitId: string; cost: number; available: number }, idx: number,
    x: number, y: number, w: number,
  ): void {
    const def = UNIT_DEFS[opt.unitId];
    if (!def) return;

    const rowBg = this.add.graphics();
    rowBg.fillStyle(def.color, 0.12);
    rowBg.lineStyle(1, def.color, 0.3);
    rowBg.fillRoundedRect(x, y, w, 68, 6);
    rowBg.strokeRoundedRect(x, y, w, 68, 6);

    // Symbol badge
    const badge = this.add.graphics();
    badge.fillStyle(def.color, 0.8);
    badge.fillCircle(x + 36, y + 34, 24);
    this.add.text(x + 36, y + 34, def.symbol, {
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(x + 74, y + 12, def.name, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffd060',
    });
    this.add.text(x + 74, y + 34, `ATK ${def.attack}  DEF ${def.defense}  HP ${def.maxHp}  SPD ${def.speed}`, {
      fontSize: '12px', color: '#c0b090',
    });

    const avail = this.recruitAvailable[idx];
    const availTxt = this.add.text(x + 74, y + 52, `Verfügbar: ${avail}`, {
      fontSize: '12px', color: avail > 0 ? '#88cc88' : '#cc4444',
    });

    const costTxt = this.add.text(x + w - 200, y + 22, `${opt.cost} Gold`, {
      fontSize: '16px', color: '#ffd060',
    }).setOrigin(0, 0.5);

    // Hire button
    const btnX = x + w - 110, btnY = y + 14;
    const btnG = this.add.graphics();
    this.drawBtn(btnG, btnX, btnY, 100, 40, avail > 0 && state.gold >= opt.cost);

    const btnTxt = this.add.text(btnX + 50, btnY + 20, 'ANWERBEN', {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: avail > 0 && state.gold >= opt.cost ? '#ffd060' : '#605040',
    }).setOrigin(0.5);

    const zone = this.add.zone(btnX + 50, btnY + 20, 100, 40).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => {
      if (this.recruitAvailable[idx] <= 0 || state.gold < opt.cost) return;
      this.recruit(opt.unitId, opt.cost, idx);
      this.recruitAvailable[idx]--;
      availTxt.setText(`Verfügbar: ${this.recruitAvailable[idx]}`);
      availTxt.setColor(this.recruitAvailable[idx] > 0 ? '#88cc88' : '#cc4444');
      this.goldText.setText(`Gold: ${state.gold}`);
      const canAfford = this.recruitAvailable[idx] > 0 && state.gold >= opt.cost;
      this.drawBtn(btnG, btnX, btnY, 100, 40, canAfford);
      btnTxt.setColor(canAfford ? '#ffd060' : '#605040');
    });
    zone.on('pointerover', () => { if (avail > 0 && state.gold >= opt.cost) btnTxt.setStyle({ color: '#ffffff' }); });
    zone.on('pointerout',  () => btnTxt.setStyle({ color: avail > 0 && state.gold >= opt.cost ? '#ffd060' : '#605040' }));
  }

  private drawBtn(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, active: boolean): void {
    g.clear();
    g.fillStyle(active ? 0x3a2810 : 0x1a1010, 1);
    g.lineStyle(1, active ? 0xc8a040 : 0x403020, 1);
    g.fillRoundedRect(x, y, w, h, 5);
    g.strokeRoundedRect(x, y, w, h, 5);
  }

  private recruit(unitId: string, cost: number, _idx: number): void {
    state.gold -= cost;
    const existing = state.playerArmy.find(s => s.id === unitId);
    if (existing) {
      existing.count += 1;
    } else {
      const def = UNIT_DEFS[unitId];
      if (!def) return;
      const stack: UnitStack = { ...def, count: 1, currentHp: def.maxHp };
      state.playerArmy.push(stack);
    }
  }

  private renderArmy(x: number, y: number, w: number): void {
    if (state.playerArmy.length === 0) {
      this.add.text(x + 10, y + 10, 'Keine Einheiten', { fontSize: '14px', color: '#604030' });
      return;
    }
    const slotW = w / Math.max(state.playerArmy.length, 5);
    state.playerArmy.forEach((stack, idx) => {
      const sx = x + idx * slotW;
      const slotBg = this.add.graphics();
      slotBg.fillStyle(stack.color, 0.2);
      slotBg.lineStyle(1, stack.color, 0.5);
      slotBg.fillRoundedRect(sx + 2, y, slotW - 4, 90, 4);
      slotBg.strokeRoundedRect(sx + 2, y, slotW - 4, 90, 4);

      this.add.text(sx + slotW / 2, y + 24, stack.symbol, {
        fontSize: '24px', color: '#ffffff',
      }).setOrigin(0.5);
      this.add.text(sx + slotW / 2, y + 52, `×${stack.count}`, {
        fontSize: '14px', color: '#ffd060',
      }).setOrigin(0.5);
      this.add.text(sx + slotW / 2, y + 72, stack.name.split(' ')[0], {
        fontSize: '10px', color: '#c0b090',
      }).setOrigin(0.5);
    });
  }
}
