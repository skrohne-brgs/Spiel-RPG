import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { CAMPAIGN } from '../data/campaign';
import { state, saveGame } from '../GameState';
import { music } from '../audio/ChiptuneEngine';

export class CampaignScene extends Phaser.Scene {
  constructor() { super({ key: 'CampaignScene' }); }

  create(): void {
    music.play('menu');

    // Dark background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x04040e);

    // Starfield
    for (let i = 0; i < 200; i++) {
      const s = Math.random() < 0.08 ? 2 : 1;
      this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        s, 0xffffff, 0.15 + Math.random() * 0.7,
      );
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 40, 'KAMPAGNE: ERBEN DES ZWEITEN ZEITALTERS', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#c8a040',
      stroke: '#2a1000', strokeThickness: 4,
    }).setOrigin(0.5);

    const line = this.add.graphics();
    line.lineStyle(1, 0xc8a040, 0.4);
    line.lineBetween(60, 70, GAME_WIDTH - 60, 70);

    // Hero status panel (right sidebar)
    this.drawHeroPanel();

    // Mission cards
    this.drawMissionCards();

    // Main menu button
    this.drawMainMenuButton();
  }

  private drawHeroPanel(): void {
    const px = GAME_WIDTH - 280, py = 90, pw = 250, ph = 520;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1e, 0.95);
    bg.lineStyle(1, 0x4a3820, 0.8);
    bg.fillRoundedRect(px, py, pw, ph, 8);
    bg.strokeRoundedRect(px, py, pw, ph, 8);

    this.add.text(px + pw / 2, py + 20, '── HELD ──', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    const h = state.hero;
    this.add.text(px + 14, py + 42, h.name, {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#ffd060',
    });
    this.add.text(px + 14, py + 66, h.title, {
      fontSize: '11px', color: '#806040', wordWrap: { width: pw - 28 },
    });

    this.add.text(px + 14, py + 90, `Stufe ${h.level}`, { fontSize: '15px', color: '#c0b090' });
    this.add.text(px + 14, py + 112, `ATK ${h.attack}  DEF ${h.defense}  WIS ${h.knowledge}`, {
      fontSize: '13px', color: '#c0b090',
    });
    this.add.text(px + 14, py + 132, `Mana: ${h.mana}/${h.maxMana}  SP: ${h.spellPower}`, {
      fontSize: '12px', color: '#80a0ff',
    });
    if (h.artifacts.length > 0) {
      this.add.text(px + 14, py + 152, `Artefakte: ${h.artifacts.length}`, {
        fontSize: '12px', color: '#c080ff',
      });
    }

    // Divider
    const dg = this.add.graphics();
    dg.lineStyle(1, 0x4a3820, 0.5);
    dg.lineBetween(px + 8, py + 170, px + pw - 8, py + 170);

    this.add.text(px + pw / 2, py + 183, '── ARMEE ──', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    let yo = py + 200;
    state.playerArmy.forEach(stack => {
      const rowBg = this.add.graphics();
      rowBg.fillStyle(stack.color, 0.15);
      rowBg.lineStyle(1, stack.color, 0.35);
      rowBg.fillRoundedRect(px + 8, yo, pw - 16, 38, 4);
      rowBg.strokeRoundedRect(px + 8, yo, pw - 16, 38, 4);
      this.add.text(px + 18, yo + 5,  `[${stack.symbol}] ${stack.name}`, { fontSize: '11px', color: '#e0d0a0' });
      this.add.text(px + 18, yo + 21, `×${stack.count}  HP ${stack.currentHp}/${stack.maxHp}`, { fontSize: '10px', color: '#a09070' });
      yo += 44;
    });

    const dg2 = this.add.graphics();
    dg2.lineStyle(1, 0x4a3820, 0.5);
    dg2.lineBetween(px + 8, py + 430, px + pw - 8, py + 430);

    this.add.text(px + 14, py + 445, `Gold: ${state.gold}`, {
      fontSize: '14px', color: '#ffd060',
    });
    this.add.text(px + 14, py + 468, `Mission: ${state.currentMissionIdx + 1} / 5`, {
      fontSize: '12px', color: '#c0b090',
    });
    this.add.text(px + 14, py + 488, `Abgeschlossen: ${state.completedMissions.length}`, {
      fontSize: '12px', color: '#a0c080',
    });
  }

  private drawMissionCards(): void {
    const cardX = 40;
    const cardW = GAME_WIDTH - 340;
    const cardH = 100;
    const cardGap = 12;
    const startY = 90;

    CAMPAIGN.forEach((mission, idx) => {
      const cy = startY + idx * (cardH + cardGap);
      const isCompleted  = state.completedMissions.includes(idx);
      const isAvailable  = idx === state.currentMissionIdx;
      const isLocked     = idx > state.currentMissionIdx;

      // Card background
      const bg = this.add.graphics();
      if (isCompleted) {
        bg.fillStyle(0x0a1a0a, 0.95);
        bg.lineStyle(2, 0x3a6a3a, 0.7);
      } else if (isAvailable) {
        bg.fillStyle(0x1a140a, 0.95);
        bg.lineStyle(2, 0xc8a040, 1.0);
      } else {
        bg.fillStyle(0x080808, 0.95);
        bg.lineStyle(1, 0x2a2a2a, 0.5);
      }
      bg.fillRoundedRect(cardX, cy, cardW, cardH, 8);
      bg.strokeRoundedRect(cardX, cy, cardW, cardH, 8);

      // Mission number badge
      const badgeColor = isCompleted ? 0x3a6a3a : isAvailable ? 0xc8a040 : 0x2a2a2a;
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(badgeColor, 0.3);
      badgeBg.fillCircle(cardX + 36, cy + cardH / 2, 24);
      badgeBg.lineStyle(2, badgeColor, 0.8);
      badgeBg.strokeCircle(cardX + 36, cy + cardH / 2, 24);
      this.add.text(cardX + 36, cy + cardH / 2, `${idx + 1}`, {
        fontSize: '20px', fontFamily: 'Georgia, serif',
        color: isCompleted ? '#6aaa6a' : isAvailable ? '#ffd060' : '#404040',
      }).setOrigin(0.5);

      // Status icon
      const statusText = isCompleted ? '✓ Abgeschlossen' : isAvailable ? '► Verfügbar' : '🔒 Gesperrt';
      const statusColor = isCompleted ? '#6aaa6a' : isAvailable ? '#ffd060' : '#404040';

      // Title & subtitle
      const titleColor = isCompleted ? '#a0caa0' : isAvailable ? '#ffd060' : '#404040';
      const subtitleColor = isCompleted ? '#507050' : isAvailable ? '#a08040' : '#2a2a2a';
      this.add.text(cardX + 72, cy + 14, mission.title, {
        fontSize: '20px', fontFamily: 'Georgia, serif', color: titleColor,
      });
      this.add.text(cardX + 72, cy + 38, mission.subtitle, {
        fontSize: '13px', color: subtitleColor,
      });
      this.add.text(cardX + 72, cy + 56, mission.description, {
        fontSize: '11px', color: isLocked ? '#303030' : '#706050',
        wordWrap: { width: cardW - 240 },
      });

      // Status label
      this.add.text(cardX + cardW - 160, cy + cardH / 2 - 10, statusText, {
        fontSize: '13px', color: statusColor,
      }).setOrigin(0.5);

      // Start button (only for available mission)
      if (isAvailable) {
        const btnX = cardX + cardW - 100;
        const btnY2 = cy + cardH - 38;
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x3a2810, 1);
        btnBg.lineStyle(2, 0xc8a040, 1);
        btnBg.fillRoundedRect(btnX, btnY2, 90, 30, 6);
        btnBg.strokeRoundedRect(btnX, btnY2, 90, 30, 6);
        const btnTxt = this.add.text(btnX + 45, btnY2 + 15, 'STARTEN', {
          fontSize: '13px', fontFamily: 'Georgia, serif', color: '#ffd060',
        }).setOrigin(0.5);

        const zone = this.add.zone(btnX + 45, btnY2 + 15, 90, 30).setInteractive({ cursor: 'pointer' });
        zone.on('pointerover', () => {
          btnBg.clear();
          btnBg.fillStyle(0x5a3c18, 1).lineStyle(2, 0xffd060, 1)
            .fillRoundedRect(btnX, btnY2, 90, 30, 6)
            .strokeRoundedRect(btnX, btnY2, 90, 30, 6);
          btnTxt.setColor('#ffffff');
        });
        zone.on('pointerout', () => {
          btnBg.clear();
          btnBg.fillStyle(0x3a2810, 1).lineStyle(2, 0xc8a040, 1)
            .fillRoundedRect(btnX, btnY2, 90, 30, 6)
            .strokeRoundedRect(btnX, btnY2, 90, 30, 6);
          btnTxt.setColor('#ffd060');
        });
        zone.on('pointerdown', () => {
          music.stop();
          saveGame();
          this.scene.start('AdventureMap');
        });
      }
    });
  }

  private drawMainMenuButton(): void {
    const btnX = GAME_WIDTH / 2 - 310;
    const btnY = GAME_HEIGHT - 52;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1a1408, 1);
    btnBg.lineStyle(1, 0x4a3820, 0.8);
    btnBg.fillRoundedRect(btnX, btnY, 160, 36, 6);
    btnBg.strokeRoundedRect(btnX, btnY, 160, 36, 6);
    const btnTxt = this.add.text(btnX + 80, btnY + 18, 'HAUPTMENÜ', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    const zone = this.add.zone(btnX + 80, btnY + 18, 160, 36).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x2a2010, 1).lineStyle(1, 0xc8a040, 1)
        .fillRoundedRect(btnX, btnY, 160, 36, 6)
        .strokeRoundedRect(btnX, btnY, 160, 36, 6);
      btnTxt.setColor('#ffd060');
    });
    zone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x1a1408, 1).lineStyle(1, 0x4a3820, 0.8)
        .fillRoundedRect(btnX, btnY, 160, 36, 6)
        .strokeRoundedRect(btnX, btnY, 160, 36, 6);
      btnTxt.setColor('#c8a040');
    });
    zone.on('pointerdown', () => {
      music.stop();
      this.scene.start('MainMenu');
    });
  }
}
