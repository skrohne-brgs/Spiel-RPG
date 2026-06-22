import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { UNIT_DEFS } from '../data/units';
import { CAMPAIGN } from '../data/campaign';
import { BUILDING_DEFS } from '../data/buildings';
import type { BuildingDef } from '../data/buildings';
import {
  state, getCityState, buildBuilding, collectCityStockpile, saveGame,
} from '../GameState';
import type { MissionCity, UnitStack } from '../types';

const MAX_BUILDINGS = 4;

const FACTION_LABEL: Record<string, string> = {
  human: 'Menschen',
  elf:   'Elben',
  dwarf: 'Zwerge',
};

const FACTION_COLOR: Record<string, number> = {
  human: 0x4a78c0,
  elf:   0xc0c040,
  dwarf: 0x8b6914,
};

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
    // Apply magieturm mana restore on visit
    const cs = getCityState(this.city.id);
    if (cs.builtBuildings.includes('magieturm')) {
      state.hero.mana = state.hero.maxMana;
    }

    this.buildUI();
  }

  private buildUI(): void {
    // Clear all existing game objects for refresh
    this.children.removeAll(true);

    const pw = 960, ph = 680, px = (GAME_WIDTH - pw) / 2, py = (GAME_HEIGHT - ph) / 2;

    // Overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    const bg = this.add.graphics();
    bg.fillStyle(0x0d0d1a, 0.98);
    bg.lineStyle(2, 0xc8a040, 1);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.strokeRoundedRect(px, py, pw, ph, 10);

    // Header
    const factionColor = FACTION_COLOR[this.city.faction] ?? 0xc8a040;
    bg.fillStyle(0x1a1428, 1);
    bg.fillRoundedRect(px, py, pw, 60, 10);
    this.add.text(GAME_WIDTH / 2, py + 30, `\u{1F3F0}  ${this.city.name}`, {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);

    const factionLabel = FACTION_LABEL[this.city.faction] ?? this.city.faction;
    this.add.text(px + 24, py + 30, `[${factionLabel}]`, {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: `#${factionColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0, 0.5);

    this.add.text(GAME_WIDTH / 2, py + 75, this.city.description, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#a09060',
    }).setOrigin(0.5);

    // Gold display
    this.goldText = this.add.text(px + pw - 20, py + 30, `Gold: ${state.gold}`, {
      fontSize: '16px', color: '#ffd060',
    }).setOrigin(1, 0.5);

    let curY = py + 95;

    // Magieturm notice
    const cs = getCityState(this.city.id);
    if (cs.builtBuildings.includes('magieturm')) {
      this.add.text(GAME_WIDTH / 2, curY, 'Magieturm: Mana vollständig wiederhergestellt!', {
        fontSize: '13px', fontFamily: 'Georgia, serif', color: '#80a0ff',
      }).setOrigin(0.5);
      curY += 22;
    }

    // Unit stockpile section
    if (cs.unitStockpile.length > 0) {
      curY = this.renderStockpile(px, curY, pw, cs.unitStockpile);
    }

    // Divider
    this.hline(px + 10, curY, pw - 20);
    curY += 8;

    // Two columns: left=Recruitment, right=Buildings
    const colW = (pw - 40) / 2;
    const leftX = px + 16;
    const rightX = px + 16 + colW + 8;

    this.add.text(leftX, curY, '── Anwerbung ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    });

    let recruitY = curY + 28;
    this.city.recruitOptions.forEach((opt, idx) => {
      this.createRecruitRow(opt, idx, leftX, recruitY, colW - 8);
      recruitY += 78;
    });

    // Right column: Buildings
    this.add.text(rightX, curY, '── Gebäude ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    });

    const builtCount = cs.builtBuildings.length;
    this.add.text(rightX + colW - 8, curY + 4, `${builtCount}/${MAX_BUILDINGS}`, {
      fontSize: '13px', color: builtCount >= MAX_BUILDINGS ? '#cc4444' : '#88cc88',
    }).setOrigin(1, 0);

    let buildY = curY + 28;
    buildY = this.renderBuildings(rightX, buildY, colW - 8, cs.builtBuildings);

    // Current army below both columns
    const armyY = Math.max(recruitY, buildY) + 8;
    this.hline(px + 10, armyY, pw - 20);
    this.add.text(px + 24, armyY + 8, '── Aktuelle Armee ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    });
    this.renderArmy(px + 20, armyY + 32, pw - 40);

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
    closeZone.on('pointerdown', () => {
      saveGame();
      this.scene.stop('CityScene');
      this.scene.resume('AdventureMap');
    });
    closeZone.on('pointerover', () => closeTxt.setColor('#ffffff'));
    closeZone.on('pointerout', () => closeTxt.setColor('#ffd060'));
  }

  private renderStockpile(
    px: number, y: number, pw: number,
    stockpile: Array<{ unitId: string; count: number }>,
  ): number {
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x102830, 0.8);
    panelBg.lineStyle(1, 0x40a080, 0.8);
    panelBg.fillRoundedRect(px + 10, y, pw - 20, 62, 6);
    panelBg.strokeRoundedRect(px + 10, y, pw - 20, 62, 6);

    this.add.text(px + 20, y + 6, 'Einheiten im Vorrat:', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#80d0a0',
    });

    let unitX = px + 20;
    stockpile.forEach(item => {
      const def = UNIT_DEFS[item.unitId];
      if (!def) return;
      const badge = this.add.graphics();
      badge.fillStyle(def.color, 0.8);
      badge.fillCircle(unitX + 14, y + 38, 14);
      this.add.text(unitX + 14, y + 38, def.symbol, { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(unitX + 14, y + 54, `x${item.count}`, { fontSize: '11px', color: '#ffd060' }).setOrigin(0.5);
      unitX += 40;
    });

    // Collect button
    const btnX = px + pw - 220, btnY = y + 18;
    const btnG = this.add.graphics();
    this.drawBtn(btnG, btnX, btnY, 190, 28, true);
    const btnTxt = this.add.text(btnX + 95, btnY + 14, 'EINHEITEN EINSAMMELN', {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const zone = this.add.zone(btnX + 95, btnY + 14, 190, 28).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => {
      collectCityStockpile(this.city.id);
      saveGame();
      this.buildUI();
    });
    zone.on('pointerover', () => btnTxt.setColor('#ffffff'));
    zone.on('pointerout', () => btnTxt.setColor('#ffd060'));

    return y + 70;
  }

  private renderBuildings(x: number, startY: number, w: number, builtBuildings: string[]): number {
    const cityFaction = this.city.faction;
    const builtCount = builtBuildings.length;

    // Filter buildings available for this faction
    const available = BUILDING_DEFS.filter(b => b.faction === cityFaction || b.faction === 'any');
    const locked    = BUILDING_DEFS.filter(b => b.faction !== cityFaction && b.faction !== 'any');

    let curY = startY;

    // Already built
    for (const buildingId of builtBuildings) {
      const def = BUILDING_DEFS.find(b => b.id === buildingId);
      if (!def) continue;
      curY = this.renderBuildingRow(x, curY, w, def, 'built', builtBuildings, builtCount);
    }

    // Available to build (not yet built)
    const toBuild = available.filter(b => !builtBuildings.includes(b.id));
    for (const def of toBuild) {
      curY = this.renderBuildingRow(x, curY, w, def, 'available', builtBuildings, builtCount);
    }

    // Locked (wrong faction) – shown dimmed
    for (const def of locked) {
      if (!builtBuildings.includes(def.id)) {
        curY = this.renderBuildingRow(x, curY, w, def, 'locked', builtBuildings, builtCount);
      }
    }

    return curY;
  }

  private renderBuildingRow(
    x: number, y: number, w: number,
    def: BuildingDef,
    mode: 'built' | 'available' | 'locked',
    builtBuildings: string[],
    builtCount: number,
  ): number {
    const h = 56;
    const rowBg = this.add.graphics();
    const bgColor = mode === 'built' ? 0x102818 : mode === 'locked' ? 0x100810 : 0x0d1220;
    const borderColor = mode === 'built' ? 0x40a060 : mode === 'locked' ? 0x302030 : 0x3050a0;
    rowBg.fillStyle(bgColor, 0.7);
    rowBg.lineStyle(1, borderColor, mode === 'locked' ? 0.3 : 0.8);
    rowBg.fillRoundedRect(x, y, w, h, 5);
    rowBg.strokeRoundedRect(x, y, w, h, 5);

    const nameColor = mode === 'built' ? '#80d090' : mode === 'locked' ? '#604860' : '#c0d0ff';
    const descColor = mode === 'built' ? '#509060' : mode === 'locked' ? '#403040' : '#8090c0';
    const namePrefix = mode === 'built' ? 'v ' : '';

    this.add.text(x + 8, y + 8, `${namePrefix}${def.name}`, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: nameColor,
    });
    this.add.text(x + 8, y + 28, def.description, {
      fontSize: '10px', color: descColor, wordWrap: { width: w - 110 },
    });

    if (mode === 'built') {
      this.add.text(x + w - 8, y + h / 2, 'Gebaut', {
        fontSize: '11px', color: '#40a060',
      }).setOrigin(1, 0.5);
    } else if (mode === 'available') {
      // Check prerequisite
      const prereqMet = def.requires.every(r => builtBuildings.includes(r));
      const canAfford = state.gold >= def.cost;
      const slotFree  = builtCount < MAX_BUILDINGS;
      const canBuild  = prereqMet && canAfford && slotFree;

      this.add.text(x + w - 100, y + 8, `${def.cost}G`, {
        fontSize: '13px', color: canAfford ? '#ffd060' : '#cc4444',
      }).setOrigin(0, 0);

      if (!prereqMet) {
        const reqName = def.requires.map(r => BUILDING_DEFS.find(b => b.id === r)?.name ?? r).join(', ');
        this.add.text(x + w - 100, y + 28, `Ben.: ${reqName}`, {
          fontSize: '9px', color: '#a06040', wordWrap: { width: 92 },
        });
      }

      const btnG = this.add.graphics();
      this.drawBtn(btnG, x + w - 100, y + h - 22, 92, 18, canBuild);
      const btnTxt = this.add.text(x + w - 54, y + h - 13, 'BAUEN', {
        fontSize: '10px', fontFamily: 'Georgia, serif',
        color: canBuild ? '#ffd060' : '#605040',
      }).setOrigin(0.5);

      if (canBuild) {
        const zone = this.add.zone(x + w - 54, y + h - 13, 92, 18).setInteractive({ cursor: 'pointer' });
        zone.on('pointerdown', () => {
          buildBuilding(this.city.id, def.id);
          saveGame();
          this.buildUI();
        });
        zone.on('pointerover', () => btnTxt.setColor('#ffffff'));
        zone.on('pointerout', () => btnTxt.setColor('#ffd060'));
      }
    } else {
      // locked
      this.add.text(x + w - 8, y + h / 2, 'Gesperrt', {
        fontSize: '11px', color: '#604060',
      }).setOrigin(1, 0.5);
    }

    return y + h + 4;
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
    badge.fillCircle(x + 30, y + 34, 22);
    this.add.text(x + 30, y + 34, def.symbol, {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(x + 60, y + 10, def.name, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#ffd060',
    });
    this.add.text(x + 60, y + 30, `ATK ${def.attack}  DEF ${def.defense}  HP ${def.maxHp}`, {
      fontSize: '11px', color: '#c0b090',
    });

    const avail = this.recruitAvailable[idx];
    const availTxt = this.add.text(x + 60, y + 48, `Verfügbar: ${avail}`, {
      fontSize: '11px', color: avail > 0 ? '#88cc88' : '#cc4444',
    });

    this.add.text(x + w - 105, y + 16, `${opt.cost} Gold`, {
      fontSize: '13px', color: '#ffd060',
    }).setOrigin(0, 0.5);

    // Hire button
    const btnX = x + w - 100, btnY = y + 20;
    const btnG = this.add.graphics();
    this.drawBtn(btnG, btnX, btnY, 92, 28, avail > 0 && state.gold >= opt.cost);

    const btnTxt = this.add.text(btnX + 46, btnY + 14, 'ANWERBEN', {
      fontSize: '11px', fontFamily: 'Georgia, serif',
      color: avail > 0 && state.gold >= opt.cost ? '#ffd060' : '#605040',
    }).setOrigin(0.5);

    const zone = this.add.zone(btnX + 46, btnY + 14, 92, 28).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => {
      if (this.recruitAvailable[idx] <= 0 || state.gold < opt.cost) return;
      this.recruit(opt.unitId, opt.cost, idx);
      this.recruitAvailable[idx]--;
      availTxt.setText(`Verfügbar: ${this.recruitAvailable[idx]}`);
      availTxt.setColor(this.recruitAvailable[idx] > 0 ? '#88cc88' : '#cc4444');
      this.goldText.setText(`Gold: ${state.gold}`);
      const canAfford = this.recruitAvailable[idx] > 0 && state.gold >= opt.cost;
      this.drawBtn(btnG, btnX, btnY, 92, 28, canAfford);
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
    const slotW = w / Math.max(state.playerArmy.length, 6);
    state.playerArmy.forEach((stack, idx) => {
      const sx = x + idx * slotW;
      const slotBg = this.add.graphics();
      slotBg.fillStyle(stack.color, 0.2);
      slotBg.lineStyle(1, stack.color, 0.5);
      slotBg.fillRoundedRect(sx + 2, y, slotW - 4, 80, 4);
      slotBg.strokeRoundedRect(sx + 2, y, slotW - 4, 80, 4);

      this.add.text(sx + slotW / 2, y + 20, stack.symbol, {
        fontSize: '22px', color: '#ffffff',
      }).setOrigin(0.5);
      this.add.text(sx + slotW / 2, y + 46, `x${stack.count}`, {
        fontSize: '13px', color: '#ffd060',
      }).setOrigin(0.5);
      this.add.text(sx + slotW / 2, y + 64, stack.name.split(' ')[0], {
        fontSize: '9px', color: '#c0b090',
      }).setOrigin(0.5);
    });
  }

  private hline(x: number, y: number, w: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0x4a3820, 0.6);
    g.lineBetween(x, y, x + w, y);
  }
}
