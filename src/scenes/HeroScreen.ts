import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { state } from '../GameState';
import { ARTIFACTS } from '../data/artifacts';
import { SPELL_DEFS } from '../data/spells';
import { SKILL_DEFS } from '../data/skills';

const PAD = 40;
const PW  = GAME_WIDTH - PAD * 2;
const PH  = GAME_HEIGHT - PAD * 2;
const PX  = PAD;
const PY  = PAD;

const COL_W   = Math.floor((PW - 24) / 3);  // 3 equal columns with small gaps
const C1X = PX + 8;
const C2X = PX + 8 + COL_W + 8;
const C3X = PX + 8 + (COL_W + 8) * 2;

export class HeroScreen extends Phaser.Scene {
  constructor() { super('HeroScreen'); }

  create(): void {
    const h = state.hero;

    // ── full-screen dim ───────────────────────────────────────────────────────
    this.add.graphics()
      .fillStyle(0x000000, 0.82)
      .fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // ── outer panel ───────────────────────────────────────────────────────────
    const panel = this.add.graphics();
    panel.fillStyle(0x08060f, 1);
    panel.lineStyle(2, 0xc8a040, 1);
    panel.fillRoundedRect(PX, PY, PW, PH, 10);
    panel.strokeRoundedRect(PX, PY, PW, PH, 10);

    // ── close button ─────────────────────────────────────────────────────────
    const closeTxt = this.add.text(PX + PW - 18, PY + 10, '✕', {
      fontSize: '20px', color: '#806040',
    }).setOrigin(1, 0).setInteractive({ cursor: 'pointer' });
    closeTxt.on('pointerover', () => closeTxt.setColor('#ffd060'));
    closeTxt.on('pointerout',  () => closeTxt.setColor('#806040'));
    closeTxt.on('pointerdown', () => this.close());
    this.input.keyboard?.once('keydown-H', () => this.close());
    this.input.keyboard?.once('keydown-SPACE', () => this.close());
    this.input.keyboard?.once('keydown-ESC', () => this.close());

    // ── header ───────────────────────────────────────────────────────────────
    let hy = PY + 16;
    this.add.text(GAME_WIDTH / 2, hy, h.name, {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    hy += 32;
    this.add.text(GAME_WIDTH / 2, hy, h.title, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#a09060',
    }).setOrigin(0.5);
    hy += 22;

    // EXP bar
    const needed = Math.round(800 * Math.pow(1.5, h.level - 1));
    const expFrac = Math.min(h.experience / needed, 1);
    const bw = 300;
    const bg = this.add.graphics();
    bg.fillStyle(0x222222).fillRoundedRect(GAME_WIDTH / 2 - bw / 2, hy, bw, 8, 4);
    bg.fillStyle(0x8060c0).fillRoundedRect(GAME_WIDTH / 2 - bw / 2, hy, bw * expFrac, 8, 4);
    this.add.text(GAME_WIDTH / 2, hy + 11, `Stufe ${h.level}  –  ${h.experience} / ${needed} EP`, {
      fontSize: '11px', color: '#806080',
    }).setOrigin(0.5);
    hy += 28;

    // horizontal divider under header
    this.add.graphics().lineStyle(1, 0x3a2810, 0.8).lineBetween(PX + 8, hy, PX + PW - 8, hy);
    hy += 10;

    const bodyTop = hy;
    const bodyH   = PY + PH - 120 - bodyTop;  // leave 120px for spells at bottom

    // ── col 1: Attribute ─────────────────────────────────────────────────────
    this.sectionHeader(C1X, bodyTop, COL_W, 'ATTRIBUTE');
    let ay = bodyTop + 28;

    const attrs: Array<[string, string | number]> = [
      ['⚔ Angriff',      h.attack],
      ['🛡 Verteidigung', h.defense],
      ['📖 Wissen',       h.knowledge],
      ['👑 Führung',      h.leadership],
      ['✨ Mana',         `${h.mana} / ${h.maxMana}`],
      ['🔮 Zauberstärke', h.spellPower],
    ];
    attrs.forEach(([label, val]) => {
      this.add.text(C1X + 8, ay, String(label), { fontSize: '13px', color: '#a09070' });
      this.add.text(C1X + COL_W - 8, ay, String(val), {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#ffd060',
      }).setOrigin(1, 0);
      ay += 30;
    });

    // ── col 2: Fähigkeiten ────────────────────────────────────────────────────
    this.sectionHeader(C2X, bodyTop, COL_W, 'FÄHIGKEITEN');
    let sy = bodyTop + 28;
    // Skill points indicator
    if (h.skillPoints > 0) {
      this.add.text(C2X + 8, sy, `Verfügbare Punkte: ${h.skillPoints}`, {
        fontSize: '11px', color: '#60ff80',
      });
      sy += 20;
    }
    const skillEntries = Object.entries(h.skills);
    if (skillEntries.length === 0) {
      this.add.text(C2X + 8, sy, 'Noch keine Fähigkeiten erlernt.', {
        fontSize: '11px', color: '#504038', wordWrap: { width: COL_W - 16 },
      });
    } else {
      skillEntries.forEach(([id, level]) => {
        const def = SKILL_DEFS[id];
        if (!def) return;
        // skill name + level dots
        this.add.text(C2X + 8, sy, def.name, {
          fontSize: '13px', fontFamily: 'Georgia, serif', color: '#e0c880',
        });
        // dot indicators
        for (let i = 0; i < def.maxLevel; i++) {
          const dotG = this.add.graphics();
          dotG.fillStyle(i < level ? 0xffd060 : 0x333333);
          dotG.fillCircle(C2X + COL_W - 14 - (def.maxLevel - 1 - i) * 14, sy + 7, 5);
        }
        sy += 22;
        this.add.text(C2X + 12, sy, def.description(level), {
          fontSize: '10px', color: '#706858', wordWrap: { width: COL_W - 20 }, lineSpacing: 2,
        });
        sy += 36;
      });
    }

    // ── col 3: Artefakte ──────────────────────────────────────────────────────
    this.sectionHeader(C3X, bodyTop, COL_W, 'ARTEFAKTE');
    let artY = bodyTop + 28;
    const collected = ARTIFACTS.filter(a => h.artifacts.includes(a.id));
    if (collected.length === 0) {
      this.add.text(C3X + 8, artY, 'Noch keine Artefakte gefunden.', {
        fontSize: '11px', color: '#504038', wordWrap: { width: COL_W - 16 },
      });
    } else {
      collected.forEach(art => {
        // icon bubble
        const iconBg = this.add.graphics();
        iconBg.fillStyle(0x1a1228).lineStyle(1, 0x6040a0, 0.7);
        iconBg.fillRoundedRect(C3X + 4, artY, 36, 36, 6);
        iconBg.strokeRoundedRect(C3X + 4, artY, 36, 36, 6);
        this.add.text(C3X + 22, artY + 18, art.icon, { fontSize: '20px' }).setOrigin(0.5);

        this.add.text(C3X + 48, artY + 2, art.name, {
          fontSize: '12px', fontFamily: 'Georgia, serif', color: '#d0b8ff',
        });
        // bonus summary
        const bonusParts = Object.entries(art.bonuses).map(([k, v]) => {
          const labels: Record<string, string> = {
            attack: 'ATK', defense: 'DEF', knowledge: 'WIS',
            maxMana: 'Mana', spellPower: 'ZS',
          };
          return `+${v} ${labels[k] ?? k}`;
        });
        this.add.text(C3X + 48, artY + 18, bonusParts.join('  '), {
          fontSize: '10px', color: '#80c080',
        });
        this.add.text(C3X + 8, artY + 40, art.description, {
          fontSize: '9px', color: '#605048', wordWrap: { width: COL_W - 16 }, lineSpacing: 1,
        });
        artY += 80;
      });
    }

    // ── spells section (bottom strip) ─────────────────────────────────────────
    const spellsY = PY + PH - 110;
    this.add.graphics().lineStyle(1, 0x3a2810, 0.8).lineBetween(PX + 8, spellsY, PX + PW - 8, spellsY);
    this.add.text(GAME_WIDTH / 2, spellsY + 8, 'ZAUBER', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#6080a0',
    }).setOrigin(0.5);

    const spells = h.spells.map(id => SPELL_DEFS[id]).filter(Boolean);
    if (spells.length === 0) {
      this.add.text(GAME_WIDTH / 2, spellsY + 26, 'Noch keine Zauber bekannt.', {
        fontSize: '11px', color: '#504038',
      }).setOrigin(0.5);
    } else {
      const cardW = 180, cardH = 80;
      const totalW = Math.min(spells.length, 6) * (cardW + 10) - 10;
      let sx = GAME_WIDTH / 2 - totalW / 2;
      const cardY = spellsY + 22;
      spells.slice(0, 6).forEach(sp => {
        const schColors: Record<string, number> = { air: 0x204060, fire: 0x401010, earth: 0x203010, water: 0x102040 };
        const cardBg = this.add.graphics();
        cardBg.fillStyle(schColors[sp.school] ?? 0x1a1a2a);
        cardBg.lineStyle(1, 0x405070, 0.7);
        cardBg.fillRoundedRect(sx, cardY, cardW, cardH, 6);
        cardBg.strokeRoundedRect(sx, cardY, cardW, cardH, 6);

        this.add.text(sx + 8, cardY + 6, sp.icon, { fontSize: '18px' });
        this.add.text(sx + 32, cardY + 6, sp.name, { fontSize: '12px', color: '#c0d8f0' });
        this.add.text(sx + 32, cardY + 22, `Mana: ${sp.manaCost}`, { fontSize: '9px', color: '#607090' });
        this.add.text(sx + 8, cardY + 40, sp.description, {
          fontSize: '9px', color: '#506070', wordWrap: { width: cardW - 16 }, lineSpacing: 2,
        });
        sx += cardW + 10;
      });
    }

    // ── Skilltree button ──────────────────────────────────────────────────────
    const stBtnColor = h.skillPoints > 0 ? '#60c080' : '#504038';
    const stBtn = this.add.text(GAME_WIDTH / 2, PY + PH - 30,
      `[S] Skilltree öffnen  •  Punkte: ${h.skillPoints}`, {
      fontSize: '12px', color: stBtnColor,
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    stBtn.on('pointerover', () => stBtn.setColor('#80ffb0'));
    stBtn.on('pointerout',  () => stBtn.setColor(stBtnColor));
    stBtn.on('pointerdown', () => this.openSkillTree());
    this.input.keyboard?.once('keydown-S', () => this.openSkillTree());

    // press H hint
    this.add.text(GAME_WIDTH / 2, PY + PH - 10, '[H] oder [ESC] schließen', {
      fontSize: '10px', color: '#3a2810',
    }).setOrigin(0.5);
  }

  private sectionHeader(x: number, y: number, w: number, label: string): void {
    const g = this.add.graphics();
    g.fillStyle(0x12100c);
    g.lineStyle(1, 0x3a2810, 0.8);
    g.fillRoundedRect(x, y, w, 22, 4);
    g.strokeRoundedRect(x, y, w, 22, 4);
    this.add.text(x + w / 2, y + 11, label, {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#806040',
    }).setOrigin(0.5);
  }

  private openSkillTree(): void {
    this.scene.stop('HeroScreen');
    this.events.emit('open_skilltree');
  }

  private close(): void {
    this.events.emit('heroscreen_close');
    this.scene.stop();
  }
}
