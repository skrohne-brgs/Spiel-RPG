import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
} from '../constants';
import { UNIT_DEFS } from '../data/units';
import { SPELL_DEFS } from '../data/spells';
import type { SpellDef, SpellTarget } from '../data/spells';
import { state, defeatEnemy, gainExperience } from '../GameState';
import type { EnemyEncounter, CombatStack } from '../types';
import { music } from '../audio/ChiptuneEngine';

// ── Hexagonal combat grid (pointy-top, odd-r offset) ────────────────────────
const HX_SIZE = 34;                      // hex circumradius
const HX_W    = Math.sqrt(3) * HX_SIZE;  // hex width ≈ 58.9
const HX_COLS = 11;                      // grid columns
const HX_ROWS = 7;                       // grid rows
const HX_GRID_W = (HX_COLS + 0.5) * HX_W;
const HX_GRID_X = Math.round((GAME_WIDTH - HX_GRID_W) / 2);
const HX_GRID_Y = 70;
const HX_ROW_H  = 1.5 * HX_SIZE;         // vertical row spacing
const HX_GRID_H = HX_ROWS * HX_ROW_H;    // overall vertical extent

type Phase = 'select_unit' | 'unit_moved' | 'spell_select' | 'spell_target';

export class CombatScene extends Phaser.Scene {
  // ── State ─────────────────────────────────────────────────────────────────
  private encounter!: EnemyEncounter;
  private units: CombatStack[] = [];
  private turnQueue: CombatStack[] = [];
  private queueIndex = 0;
  private phase: Phase = 'select_unit';
  private activeUnit?: CombatStack;
  private movedFrom?: { x: number; y: number };
  private pendingSpell?: SpellDef;
  private combatActive = true;
  private spellCastThisTurn = false;
  private logLines: string[] = [];

  // ── Graphics / UI ─────────────────────────────────────────────────────────
  private containers: Map<string, Phaser.GameObjects.Container> = new Map();
  private hlGraphics!: Phaser.GameObjects.Graphics;
  private turnLabel!: Phaser.GameObjects.Text;
  private manaLabel!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private actionPanel!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'CombatScene' }); }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init(data: { encounter: EnemyEncounter }): void {
    this.encounter = data.encounter;
    this.units = [];
    this.containers.clear();
    this.queueIndex = 0;
    this.combatActive = true;
    this.logLines = [];
    this.phase = 'select_unit';
    this.activeUnit = undefined;
    this.spellCastThisTurn = false;
    state.spellCastThisCombat = false;
  }

  create(): void {
    music.play('combat');
    this.cameras.main.setBackgroundColor('#100808');
    this.drawBg();
    this.drawGrid();
    this.spawnUnits();
    this.buildQueue();
    this.hlGraphics = this.add.graphics().setDepth(20);
    this.createUI();
    this.setupGridInput();
    this.renderAll();
    this.startTurn();
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  private drawBg(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x100808);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0x0a0505, 0.8);
    bg.fillRect(0, 0, GAME_WIDTH, 52);
    bg.lineStyle(1, 0xc8a040, 0.5);
    bg.lineBetween(0, 52, GAME_WIDTH, 52);

    this.add.text(GAME_WIDTH / 2, 26, `⚔  KAMPF: ${this.encounter.name}  ⚔`, {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    // Divider
    const mid = HX_GRID_X + (HX_COLS / 2) * HX_W;
    this.add.graphics()
      .lineStyle(2, 0xff4040, 0.35)
      .lineBetween(mid, HX_GRID_Y, mid, HX_GRID_Y + HX_GRID_H);

    this.add.text(mid - 80, HX_GRID_Y - 18, 'NÚMENOR', { fontSize: '13px', color: '#4a78c0' });
    this.add.text(mid + 14, HX_GRID_Y - 18, 'FEINDE',  { fontSize: '13px', color: '#cc4444' });
  }

  private drawGrid(): void {
    const g = this.add.graphics().setDepth(1);
    for (let r = 0; r < HX_ROWS; r++) {
      for (let c = 0; c < HX_COLS; c++) {
        const { x, y } = this.cell(c, r);
        const pts = this.hexPts(x, y, HX_SIZE - 1);
        g.fillStyle(c < HX_COLS / 2 ? 0x0a1420 : 0x200a0a, 0.7);
        g.fillPoints(pts, true);
        g.lineStyle(1, 0x2a2010, 0.5);
        g.strokePoints(pts, true);
      }
    }
  }

  private spawnUnits(): void {
    // Player formation on the left (cols 0/1), enemy mirrored on the right.
    const playerSlots: [number, number][] = [
      [0, 1], [1, 2], [0, 3], [1, 4], [0, 5], [1, 0], [0, 6],
    ].map(([c, r]) => [c, Math.min(r, HX_ROWS - 1)]);
    const enemySlots: [number, number][] = playerSlots.map(([c, r]) => [HX_COLS - 1 - c, r]);

    let pid = 0, pslot = 0;
    state.playerArmy.forEach(stack => {
      if (stack.count <= 0) return;
      const tacBonus = state.hero.skills['tactics'] ?? 0;
      const [gx, gy] = playerSlots[pslot % playerSlots.length];
      pslot++;
      this.units.push({
        ...stack,
        speed: stack.speed + tacBonus,
        gridX: gx, gridY: gy,
        hasActed: false, blessed: false, slowed: false, slowedTurns: 0,
        cid: `p_${pid++}_${stack.id}`,
      });
    });

    let eid = 0, eslot = 0;
    this.encounter.stacks.forEach(({ unitId, count }) => {
      const def = UNIT_DEFS[unitId];
      if (!def) return;
      const [gx, gy] = enemySlots[eslot % enemySlots.length];
      eslot++;
      this.units.push({
        ...def, count, currentHp: def.maxHp,
        gridX: gx, gridY: gy,
        hasActed: false, blessed: false, slowed: false, slowedTurns: 0,
        cid: `e_${eid++}_${def.id}`,
      });
    });
  }

  private buildQueue(): void {
    this.turnQueue = [...this.units].sort((a, b) => b.speed - a.speed);
    this.queueIndex = 0;
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  private panelY(): number { return HX_GRID_Y + HX_GRID_H + 10; }

  private createUI(): void {
    const py = this.panelY();
    const ph = GAME_HEIGHT - py - 8;

    this.add.graphics().setDepth(5).fillStyle(0x0a0505, 0.92)
      .lineStyle(1, 0x4a3020, 0.8)
      .fillRect(8, py, GAME_WIDTH - 16, ph)
      .strokeRect(8, py, GAME_WIDTH - 16, ph);

    this.turnLabel = this.add.text(18, py + 10, '', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setDepth(6);

    this.manaLabel = this.add.text(18, py + 32, '', {
      fontSize: '13px', color: '#80a0ff',
    }).setDepth(6);

    this.logText = this.add.text(18, py + 52, '', {
      fontSize: '12px', color: '#c0b090', lineSpacing: 2,
      wordWrap: { width: GAME_WIDTH - 300 },
    }).setDepth(6);

    // Action buttons (right side)
    this.actionPanel = this.add.container(GAME_WIDTH - 290, py + 10).setDepth(10);
    this.rebuildActionPanel();

    // Retreat
    this.makeBtn(GAME_WIDTH - 130, py + ph - 42, 110, 32, 'RÜCKZUG', 0x6a1010, () => {
      if (this.combatActive) this.endCombat('lose');
    });
  }

  private rebuildActionPanel(): void {
    this.actionPanel.removeAll(true);

    const canSpell = !this.spellCastThisTurn &&
      state.hero.mana > 0 && state.hero.spells.length > 0 &&
      (this.phase === 'select_unit' || this.phase === 'unit_moved');
    const canWait = this.activeUnit?.faction === 'player' && this.combatActive;

    if (canSpell) {
      const [bg, txt] = this.makeContainer(0, 0, 120, 32, 'ZAUBER', 0x1a1050);
      this.actionPanel.add([bg, txt]);
      const z = this.add.zone(GAME_WIDTH - 290 + 60, 10 + this.panelY() + 16, 120, 32)
        .setInteractive({ cursor: 'pointer' }).setDepth(11);
      z.on('pointerdown', () => this.openSpellMenu());
    }

    if (canWait) {
      const [bg, txt] = this.makeContainer(130, 0, 120, 32, 'WARTEN', 0x1a2810);
      this.actionPanel.add([bg, txt]);
      const py = this.panelY();
      const z = this.add.zone(GAME_WIDTH - 290 + 130 + 60, py + 16, 120, 32)
        .setInteractive({ cursor: 'pointer' }).setDepth(11);
      z.on('pointerdown', () => this.skipTurn());
    }
  }

  private makeContainer(
    x: number, y: number, w: number, h: number, label: string, color: number,
  ): [Phaser.GameObjects.Graphics, Phaser.GameObjects.Text] {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.lineStyle(1, 0xc8a040, 0.7);
    bg.fillRoundedRect(x, y, w, h, 4);
    bg.strokeRoundedRect(x, y, w, h, 4);
    const txt = this.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    return [bg, txt];
  }

  private makeBtn(
    x: number, y: number, w: number, h: number, label: string, color: number, cb: () => void,
  ): void {
    const bg = this.add.graphics().setDepth(10);
    bg.fillStyle(color, 1);
    bg.lineStyle(1, 0xc8a040, 0.7);
    bg.fillRoundedRect(x, y, w, h, 4);
    bg.strokeRoundedRect(x, y, w, h, 4);
    const txt = this.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5).setDepth(11);
    const z = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ cursor: 'pointer' }).setDepth(12);
    z.on('pointerdown', cb);
    z.on('pointerover', () => txt.setColor('#ffffff'));
    z.on('pointerout', () => txt.setColor('#ffd060'));
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  // center pixel of hex cell (gx=col, gy=row)
  private cell(gx: number, gy: number): { x: number; y: number } {
    return {
      x: HX_GRID_X + (gx + (gy % 2 === 1 ? 1 : 0.5)) * HX_W,
      y: HX_GRID_Y + gy * 1.5 * HX_SIZE + HX_SIZE,
    };
  }

  private hexNeighbors(col: number, row: number): [number, number][] {
    const odd = row % 2 === 1;
    return ([
      [col - 1, row], [col + 1, row],
      [col + (odd ? 0 : -1), row - 1], [col + (odd ? 1 : 0), row - 1],
      [col + (odd ? 0 : -1), row + 1], [col + (odd ? 1 : 0), row + 1],
    ] as [number, number][]).filter(([c, r]) => c >= 0 && c < HX_COLS && r >= 0 && r < HX_ROWS);
  }

  // cube-coordinate hex distance for odd-r offset
  private hexDist(c1: number, r1: number, c2: number, r2: number): number {
    const q1 = c1 - ((r1 - (r1 & 1)) >> 1), q2 = c2 - ((r2 - (r2 & 1)) >> 1);
    return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((-q1 - r1) - (-q2 - r2))) / 2;
  }

  // 6 polygon points for a pointy-top hex
  private hexPts(cx: number, cy: number, r: number): { x: number; y: number }[] {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }

  // pixel -> nearest hex cell (or null if outside grid)
  private pixelToHex(px: number, py: number): [number, number] | null {
    let best = Infinity, bc = -1, br = -1;
    for (let r = 0; r < HX_ROWS; r++)
      for (let c = 0; c < HX_COLS; c++) {
        const { x, y } = this.cell(c, r);
        const d = (px - x) ** 2 + (py - y) ** 2;
        if (d < best) { best = d; bc = c; br = r; }
      }
    return best < HX_W * HX_W ? [bc, br] : null;
  }

  private renderAll(): void { this.units.forEach(u => this.renderUnit(u)); }

  private renderUnit(u: CombatStack): void {
    this.containers.get(u.cid)?.destroy();
    if (u.count <= 0) return;
    const { x, y } = this.cell(u.gridX, u.gridY);
    const c = this.add.container(x, y).setDepth(15);

    const isActive = u === this.activeUnit;
    const unitImg = this.add.image(0, -4, `unit_${u.id}`).setDisplaySize(60, 52);
    const borderColor = u.faction === 'player'
      ? (isActive ? 0xffffff : 0x88aaff)
      : (isActive ? 0xffffff : 0xff6666);
    const border = this.add.graphics();
    border.lineStyle(isActive ? 3 : 2, borderColor, 0.9);
    border.strokeRoundedRect(-30, -26, 60, 52, 6);

    // Status icons
    if (u.blessed) { this.add.text(-28, -28, '✦', { fontSize: '10px', color: '#ffff88' }).setDepth(16); }
    if (u.slowed)  { this.add.text( 16, -28, '⏿', { fontSize: '10px', color: '#8888ff' }).setDepth(16); }

    const countTxt = this.add.text(0, 14, `${u.count}`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // HP bar
    const bw = 52, hpFrac = u.currentHp / u.maxHp;
    const barBg = this.add.graphics().fillStyle(0x333333).fillRect(-bw/2, 28, bw, 5);
    const barFg = this.add.graphics()
      .fillStyle(hpFrac > 0.6 ? 0x44bb44 : hpFrac > 0.3 ? 0xddcc00 : 0xcc3333)
      .fillRect(-bw/2, 28, bw * hpFrac, 5);

    c.add([unitImg, border, countTxt, barBg, barFg]);
    c.setInteractive(new Phaser.Geom.Rectangle(-30, -30, 60, 60), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => this.onUnitClicked(u));
    c.on('pointerover', () => this.showTooltip(u, x, y));
    c.on('pointerout',  () => this.hideTooltip());
    this.containers.set(u.cid, c);
  }

  private tooltip?: Phaser.GameObjects.Container;
  private showTooltip(u: CombatStack, wx: number, wy: number): void {
    this.tooltip?.destroy();
    const lines = [
      u.name,
      `HP ${u.currentHp}/${u.maxHp} × ${u.count}`,
      `ATK ${u.attack}  DEF ${u.defense}  SPD ${u.speed}`,
      u.range > 1 ? `Fernkampf (${u.range} Felder)` : 'Nahkampf',
    ];
    const tw = 200, th = lines.length * 18 + 12;
    const tx = Math.min(wx + 36, GAME_WIDTH - tw - 10);
    const ty = Math.max(wy - th - 4, 60);
    const c = this.add.container(tx, ty).setDepth(50);
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0808, 0.95);
    bg.lineStyle(1, 0x8a7040, 0.9);
    bg.fillRoundedRect(0, 0, tw, th, 4);
    bg.strokeRoundedRect(0, 0, tw, th, 4);
    c.add(bg);
    lines.forEach((l, i) => {
      c.add(this.add.text(8, 6 + i * 18, l, {
        fontSize: i === 0 ? '14px' : '12px',
        color: i === 0 ? '#ffd060' : '#c0b090',
      }));
    });
    this.tooltip = c;
  }
  private hideTooltip(): void { this.tooltip?.destroy(); this.tooltip = undefined; }

  // ── Turn logic ────────────────────────────────────────────────────────────

  private currentUnit(): CombatStack { return this.turnQueue[this.queueIndex]; }

  private startTurn(): void {
    if (!this.combatActive) return;
    while (this.queueIndex < this.turnQueue.length && this.turnQueue[this.queueIndex].count <= 0) {
      this.queueIndex++;
    }
    if (this.queueIndex >= this.turnQueue.length) { this.nextRound(); return; }

    const u = this.currentUnit();
    this.activeUnit = u;
    this.phase = 'select_unit';
    this.spellCastThisTurn = false;
    this.movedFrom = undefined;

    this.turnLabel.setText(`Am Zug: ${u.name}  (${u.faction === 'player' ? '✦ Spieler' : '☠ Feind'})  ×${u.count}`);
    this.manaLabel.setText(`Mana: ${state.hero.mana}/${state.hero.maxMana}  |  Zauberstärke: ${state.hero.spellPower}`);
    this.renderAll();
    this.renderHighlights();
    this.rebuildActionPanel();

    if (u.faction === 'enemy') {
      this.time.delayedCall(600, () => this.doEnemyTurn(u));
    } else {
      this.addLog(`${u.name} – klicke einen Feind oder wähle eine Aktion.`);
    }
  }

  private nextRound(): void {
    this.units.forEach(u => {
      u.hasActed = false;
      if (u.slowed) { u.slowedTurns--; if (u.slowedTurns <= 0) { u.slowed = false; u.speed = UNIT_DEFS[u.id].speed; } }
      u.blessed = false;
    });
    this.turnQueue = [...this.units.filter(u => u.count > 0)].sort((a, b) => b.speed - a.speed);
    this.queueIndex = 0;
    this.addLog('── Neue Runde ──');
    this.startTurn();
  }

  private advanceTurn(): void {
    if (this.activeUnit) this.activeUnit.hasActed = true;
    this.queueIndex++;
    this.rebuildActionPanel();
    if (this.queueIndex >= this.turnQueue.length) { this.nextRound(); return; }
    this.startTurn();
  }

  private skipTurn(): void {
    this.addLog(`${this.activeUnit?.name ?? '?'} wartet.`);
    this.advanceTurn();
  }

  // ── Highlight system ──────────────────────────────────────────────────────

  private renderHighlights(): void {
    this.hlGraphics.clear();
    if (!this.combatActive) return;
    const u = this.activeUnit;
    if (!u) return;

    // Active unit border (white pulse)
    const ac = this.cell(u.gridX, u.gridY);
    this.hlGraphics.lineStyle(3, 0xffffff, 0.85);
    this.hlGraphics.strokePoints(this.hexPts(ac.x, ac.y, HX_SIZE - 2), true);

    if (u.faction !== 'player') return;

    if (this.phase === 'select_unit') {
      // Show moveable cells (blue)
      this.reachableCells(u.gridX, u.gridY, u.moveRange).forEach(([c, r]) => {
        const { x, y } = this.cell(c, r);
        this.hlGraphics.fillStyle(0x3080ff, 0.28);
        this.hlGraphics.fillPoints(this.hexPts(x, y, HX_SIZE - 2), true);
      });
      // Attackable enemies (orange)
      this.attackableEnemies(u).forEach(enemy => {
        const ec = this.cell(enemy.gridX, enemy.gridY);
        this.hlGraphics.lineStyle(3, 0xff8000, 0.9);
        this.hlGraphics.strokePoints(this.hexPts(ec.x, ec.y, HX_SIZE - 2), true);
      });
    } else if (this.phase === 'unit_moved') {
      // Only show attackable from new position
      this.attackableEnemies(u).forEach(enemy => {
        const ec = this.cell(enemy.gridX, enemy.gridY);
        this.hlGraphics.lineStyle(3, 0xff8000, 0.9);
        this.hlGraphics.strokePoints(this.hexPts(ec.x, ec.y, HX_SIZE - 2), true);
      });
    } else if (this.phase === 'spell_target') {
      // Target highlights set elsewhere
    }
  }

  private reachableCells(startX: number, startY: number, range: number): [number, number][] {
    const result: [number, number][] = [];
    const visited = new Set<string>([`${startX},${startY}`]);
    const queue: Array<[number, number, number]> = [[startX, startY, 0]];
    while (queue.length > 0) {
      const [cx, cy, cost] = queue.shift()!;
      for (const [nx, ny] of this.hexNeighbors(cx, cy)) {
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        visited.add(key);
        if (this.unitAt(nx, ny)) continue; // blocked
        const newCost = cost + 1;
        if (newCost <= range) {
          result.push([nx, ny]);
          queue.push([nx, ny, newCost]);
        }
      }
    }
    return result;
  }

  private unitAt(gx: number, gy: number): CombatStack | undefined {
    return this.units.find(u => u.count > 0 && u.gridX === gx && u.gridY === gy);
  }

  private attackableEnemies(attacker: CombatStack): CombatStack[] {
    return this.units.filter(u => {
      if (u.faction === attacker.faction || u.count <= 0) return false;
      if (attacker.range > 1) return true; // ranged can always attack
      return this.hexDist(attacker.gridX, attacker.gridY, u.gridX, u.gridY) === 1;
    });
  }

  // ── Click handler ─────────────────────────────────────────────────────────

  private onUnitClicked(target: CombatStack): void {
    if (!this.combatActive) return;
    const active = this.activeUnit;
    if (!active) return;

    if (this.phase === 'spell_target') {
      this.handleSpellTarget(target);
      return;
    }

    if (active.faction !== 'player') return;

    if (target === active) {
      // Click self → wait
      if (this.phase === 'unit_moved') {
        this.addLog(`${active.name} hält seine Position.`);
        this.advanceTurn();
      }
      return;
    }

    if (target.faction === 'player') {
      // Click own unit while in select_unit → move there (not useful) – ignore
      return;
    }

    // Click enemy
    const canAttack = this.attackableEnemies(active).includes(target);
    if (canAttack) {
      this.executeAttack(active, target);
    } else if (this.phase === 'select_unit') {
      // Try to move toward enemy first
      const path = this.pathToward(active, target);
      if (path) {
        this.moveUnit(active, path[0], path[1]);
        // Re-check if can attack after moving
        this.time.delayedCall(200, () => {
          if (this.attackableEnemies(active).includes(target)) {
            this.executeAttack(active, target);
          } else {
            this.addLog(`${active.name} rückt vor, kann ${target.name} noch nicht erreichen.`);
            this.phase = 'unit_moved';
            this.renderHighlights();
            this.rebuildActionPanel();
          }
        });
      } else {
        this.addLog('Einheit kann sich nicht in diese Richtung bewegen.');
      }
    } else {
      this.addLog(`${target.name} ist außer Reichweite.`);
    }
  }

  // Handle click on empty cell for movement
  private setupGridInput(): void {
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (!this.combatActive) return;
      const u = this.activeUnit;
      if (!u || u.faction !== 'player') return;
      if (this.phase !== 'select_unit') return;

      const hex = this.pixelToHex(ptr.x, ptr.y);
      if (!hex) return;
      const [col, row] = hex;

      const occupant = this.unitAt(col, row);
      if (occupant && occupant !== u) return; // occupied → handled by onUnitClicked

      const reachable = this.reachableCells(u.gridX, u.gridY, u.moveRange);
      if (reachable.some(([c, r]) => c === col && r === row)) {
        this.moveUnit(u, col, row);
        this.phase = 'unit_moved';
        this.renderHighlights();
        this.rebuildActionPanel();
      }
    });
  }

  private moveUnit(u: CombatStack, toX: number, toY: number): void {
    this.movedFrom = { x: u.gridX, y: u.gridY };
    u.gridX = toX;
    u.gridY = toY;
    // Animate container
    const c = this.containers.get(u.cid);
    const { x, y } = this.cell(toX, toY);
    if (c) this.tweens.add({ targets: c, x, y, duration: 220, ease: 'Quad.easeOut' });
    this.renderHighlights();
  }

  private pathToward(attacker: CombatStack, target: CombatStack): [number, number] | null {
    const reachable = this.reachableCells(attacker.gridX, attacker.gridY, attacker.moveRange);
    if (reachable.length === 0) return null;
    // Pick cell closest to target
    reachable.sort((a, b) => {
      const da = this.hexDist(a[0], a[1], target.gridX, target.gridY);
      const db = this.hexDist(b[0], b[1], target.gridX, target.gridY);
      return da - db;
    });
    return reachable[0];
  }

  // ── Attack ────────────────────────────────────────────────────────────────

  private executeAttack(attacker: CombatStack, target: CombatStack): void {
    const atkBonus = attacker.blessed ? 1.5 : 1.0;
    const archBonus = attacker.range > 1 && attacker.faction === 'player'
      ? 1 + (state.hero.skills['archery'] ?? 0) * 0.2
      : 1.0;
    const heroAtk = attacker.faction === 'player' ? state.hero.attack : 0;

    const rawDmg = Math.max(1, (attacker.attack + heroAtk) * attacker.count * atkBonus * archBonus - target.defense);
    const dmg = Math.round(Phaser.Math.Between(Math.floor(rawDmg * 0.85), Math.ceil(rawDmg * 1.15)));
    const killed = Math.min(target.count, Math.floor(dmg / target.maxHp));
    const hpRem = dmg - killed * target.maxHp;
    target.count -= killed;
    if (target.count > 0) target.currentHp = Math.max(1, target.maxHp - (hpRem % target.maxHp));
    else target.currentHp = 0;

    attacker.blessed = false;

    this.addLog(`${attacker.name} → ${target.name}: ${dmg} Schaden, ${killed} gefallen`);
    this.flashHit(target);

    this.time.delayedCall(300, () => {
      this.renderUnit(target);
      this.checkEnd();
      if (this.combatActive) this.advanceTurn();
    });
  }

  // ── Enemy AI ──────────────────────────────────────────────────────────────

  private doEnemyTurn(u: CombatStack): void {
    const targets = this.units.filter(t => t.faction === 'player' && t.count > 0);
    if (!targets.length) { this.advanceTurn(); return; }

    const nearestTarget = targets.sort((a, b) => {
      const da = Math.abs(a.gridX - u.gridX) + Math.abs(a.gridY - u.gridY);
      const db = Math.abs(b.gridX - u.gridX) + Math.abs(b.gridY - u.gridY);
      return da - db;
    })[0];

    if (u.range <= 1) {
      const movePath = this.pathToward(u, nearestTarget);
      if (movePath) this.moveUnit(u, movePath[0], movePath[1]);
    }

    const attackable = this.attackableEnemies(u);
    const target = attackable.length > 0
      ? (Phaser.Utils.Array.GetRandom(attackable) as CombatStack)
      : null;

    if (target) {
      this.time.delayedCall(250, () => this.executeAttack(u, target));
    } else {
      this.addLog(`${u.name} rückt vor...`);
      this.time.delayedCall(300, () => this.advanceTurn());
    }
  }

  // ── Spell system ──────────────────────────────────────────────────────────

  private spellMenuContainer?: Phaser.GameObjects.Container;

  private openSpellMenu(): void {
    this.spellMenuContainer?.destroy();
    this.phase = 'spell_select';

    const menuW = 520, menuH = 50 + state.hero.spells.length * 64 + 20;
    const mx = GAME_WIDTH / 2 - menuW / 2;
    const my = GAME_HEIGHT / 2 - menuH / 2;

    const c = this.add.container(mx, my).setDepth(40);
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0818, 0.97);
    bg.lineStyle(2, 0xc8a040, 1);
    bg.fillRoundedRect(0, 0, menuW, menuH, 10);
    bg.strokeRoundedRect(0, 0, menuW, menuH, 10);
    c.add(bg);
    c.add(this.add.text(menuW / 2, 20, '✦ Zauberbuch ✦', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5));

    state.hero.spells.forEach((sid, i) => {
      const def = SPELL_DEFS[sid];
      if (!def) return;
      const ry = 50 + i * 64;
      const canCast = state.hero.mana >= def.manaCost;

      const rowBg = this.add.graphics();
      rowBg.fillStyle(canCast ? 0x1a1040 : 0x0a0a0a, 0.8);
      rowBg.lineStyle(1, canCast ? 0x8080ff : 0x404040, 0.7);
      rowBg.fillRoundedRect(14, ry, menuW - 28, 52, 6);
      rowBg.strokeRoundedRect(14, ry, menuW - 28, 52, 6);
      c.add(rowBg);

      c.add(this.add.text(30, ry + 10, `${def.icon} ${def.name}`, {
        fontSize: '16px', fontFamily: 'Georgia, serif',
        color: canCast ? '#ffd060' : '#604040',
      }));
      c.add(this.add.text(30, ry + 32, def.description, {
        fontSize: '12px', color: canCast ? '#c0b090' : '#604040',
      }));
      c.add(this.add.text(menuW - 30, ry + 20, `${def.manaCost} ⚡`, {
        fontSize: '14px', color: canCast ? '#80a0ff' : '#404040',
      }).setOrigin(1, 0.5));

      if (canCast) {
        const z = this.add.zone(mx + menuW / 2, my + ry + 26, menuW - 28, 52)
          .setInteractive({ cursor: 'pointer' }).setDepth(42);
        z.on('pointerdown', () => { this.closeSpellMenu(); this.beginSpellCast(def); });
        z.on('pointerover', () => { rowBg.clear(); rowBg.fillStyle(0x2a1a60, 1).lineStyle(1, 0xc0c0ff, 1).fillRoundedRect(14, ry, menuW - 28, 52, 6).strokeRoundedRect(14, ry, menuW - 28, 52, 6); });
        z.on('pointerout',  () => { rowBg.clear(); rowBg.fillStyle(0x1a1040, 0.8).lineStyle(1, 0x8080ff, 0.7).fillRoundedRect(14, ry, menuW - 28, 52, 6).strokeRoundedRect(14, ry, menuW - 28, 52, 6); });
      }
    });

    // Close button
    const closeZ = this.add.zone(mx + menuW - 20, my + 16, 26, 26)
      .setInteractive({ cursor: 'pointer' }).setDepth(42);
    c.add(this.add.text(menuW - 20, 16, '✕', { fontSize: '18px', color: '#ff6666' }).setOrigin(0.5));
    closeZ.on('pointerdown', () => { this.closeSpellMenu(); this.phase = 'select_unit'; this.renderHighlights(); });

    this.spellMenuContainer = c;
  }

  private closeSpellMenu(): void {
    this.spellMenuContainer?.destroy();
    this.spellMenuContainer = undefined;
  }

  private beginSpellCast(spell: SpellDef): void {
    this.pendingSpell = spell;

    if (spell.target === 'none' || spell.target === 'all_enemies') {
      this.castSpell(spell, null);
      return;
    }

    this.phase = 'spell_target';
    const isEnemy = spell.target === 'enemy_stack';
    this.addLog(`Ziel wählen für "${spell.name}" – klicke eine ${isEnemy ? 'feindliche' : 'freundliche'} Einheit.`);

    // Highlight valid targets
    this.hlGraphics.clear();
    this.units.filter(u => {
      if (u.count <= 0) return false;
      return isEnemy ? u.faction === 'enemy' : u.faction === 'player';
    }).forEach(u => {
      const { x, y } = this.cell(u.gridX, u.gridY);
      this.hlGraphics.lineStyle(3, isEnemy ? 0xff8000 : 0x00ff88, 0.9);
      this.hlGraphics.strokePoints(this.hexPts(x, y, HX_SIZE - 2), true);
    });
  }

  private handleSpellTarget(target: CombatStack): void {
    if (!this.pendingSpell) return;
    const spell = this.pendingSpell;
    const isEnemy = spell.target === 'enemy_stack';
    if (isEnemy && target.faction !== 'enemy') return;
    if (!isEnemy && target.faction !== 'player') return;
    this.castSpell(spell, target);
  }

  private castSpell(spell: SpellDef, target: CombatStack | null): void {
    state.hero.mana = Math.max(0, state.hero.mana - spell.manaCost);
    this.spellCastThisTurn = true;
    this.pendingSpell = undefined;

    const power = state.hero.spellPower;

    switch (spell.id) {
      case 'lightning_bolt':
        if (target) {
          const dmg = 20 * power;
          const killed = Math.min(target.count, Math.floor(dmg / target.maxHp));
          target.count -= killed;
          if (target.count > 0) target.currentHp = Math.max(1, target.currentHp - dmg % target.maxHp);
          this.spellEffect(target.gridX, target.gridY, 0xffff00);
          this.flashHit(target);
          this.addLog(`⚡ Blitzstrahl trifft ${target.name} für ${dmg} Schaden! ${killed} fallen.`);
          this.renderUnit(target);
        }
        break;
      case 'healing':
        if (target) {
          const heal = 30 * power;
          target.currentHp = Math.min(target.maxHp, target.currentHp + heal);
          this.spellEffect(target.gridX, target.gridY, 0x44ff88);
          this.addLog(`✚ Heilung: ${target.name} erhält ${heal} TP zurück.`);
          this.renderUnit(target);
        }
        break;
      case 'bless':
        if (target) {
          target.blessed = true;
          this.spellEffect(target.gridX, target.gridY, 0xffff88);
          this.addLog(`✦ Segen: ${target.name} kämpft mit 50% mehr Schaden!`);
          this.renderUnit(target);
        }
        break;
      case 'slow':
        if (target) {
          target.slowed = true;
          target.slowedTurns = 3;
          target.speed = Math.max(1, Math.floor(target.speed / 2));
          this.spellEffect(target.gridX, target.gridY, 0x8888ff);
          this.addLog(`🐢 Verlangsamung: ${target.name} halbiert sein Tempo für 3 Runden.`);
        }
        break;
      case 'fire_storm': {
        const dmg = 15 * power;
        this.units.filter(u => u.faction === 'enemy' && u.count > 0).forEach(u => {
          const killed = Math.min(u.count, Math.floor(dmg / u.maxHp));
          u.count -= killed;
          this.spellEffect(u.gridX, u.gridY, 0xff4400);
          this.flashHit(u);
          this.renderUnit(u);
        });
        this.addLog(`🔥 Feuersturm trifft alle Feinde für ${dmg} Schaden!`);
        break;
      }
      case 'mass_haste':
        this.units.filter(u => u.faction === 'player').forEach(u => {
          u.speed += 4;
          this.spellEffect(u.gridX, u.gridY, 0x00ffcc);
        });
        this.addLog(`💨 Masseneile: Alle Einheiten erhalten +4 Geschwindigkeit!`);
        break;
    }

    this.manaLabel.setText(`Mana: ${state.hero.mana}/${state.hero.maxMana}  |  Zauberstärke: ${state.hero.spellPower}`);
    this.checkEnd();
    this.phase = this.movedFrom !== undefined ? 'unit_moved' : 'select_unit';
    this.renderHighlights();
    this.rebuildActionPanel();
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private flashHit(u: CombatStack): void {
    const c = this.containers.get(u.cid);
    if (!c) return;
    const ox = c.x;
    this.tweens.add({ targets: c, alpha: 0.15, duration: 80, yoyo: true, repeat: 2 });
    this.tweens.add({
      targets: c, x: ox + 7,
      duration: 35, yoyo: true, repeat: 5, ease: 'Sine.easeInOut',
      onComplete: () => { c.x = ox; },
    });
  }

  private spellEffect(gx: number, gy: number, color: number): void {
    const { x, y } = this.cell(gx, gy);
    const g = this.add.graphics().setDepth(25);
    [0, 1, 2].forEach(i => {
      this.time.delayedCall(i * 70, () => {
        g.clear();
        g.fillStyle(color, 0.65 - i * 0.18);
        g.fillCircle(x, y, 18 + i * 14);
        g.lineStyle(2, color, 0.9 - i * 0.25);
        g.strokeCircle(x, y, 18 + i * 14);
      });
    });
    this.time.delayedCall(280, () => g.destroy());
  }

  private addLog(msg: string): void {
    this.logLines.push(msg);
    this.logText.setText(this.logLines.slice(-5).join('\n'));
  }

  private checkEnd(): void {
    const playersAlive = this.units.some(u => u.faction === 'player' && u.count > 0);
    const enemiesAlive = this.units.some(u => u.faction === 'enemy' && u.count > 0);
    if (!enemiesAlive) this.endCombat('win');
    else if (!playersAlive) this.endCombat('lose');
  }

  private endCombat(result: 'win' | 'lose'): void {
    if (!this.combatActive) return;
    this.combatActive = false;
    music.stop();
    this.hlGraphics.clear();
    this.closeSpellMenu();

    if (result === 'win') {
      defeatEnemy(this.encounter.id);
      gainExperience(500);
      // Sync losses back to game state
      state.playerArmy.forEach(stack => {
        const cs = this.units.find(u => u.faction === 'player' && u.id === stack.id);
        if (cs) { stack.count = cs.count; stack.currentHp = cs.currentHp; }
      });
      state.playerArmy = state.playerArmy.filter(s => s.count > 0);
    }

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setDepth(30);
    const col = result === 'win' ? '#44ff88' : '#ff4444';
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, result === 'win' ? 'SIEG!' : 'NIEDERLAGE', {
      fontSize: '60px', fontFamily: 'Georgia, serif', color: col,
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(31);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
      result === 'win' ? '+500 Erfahrung!' : 'Deine Armee wurde vernichtet.',
      { fontSize: '22px', fontFamily: 'Georgia, serif', color: '#e0d0a8' },
    ).setOrigin(0.5).setDepth(31);

    // Check level up
    const needsLevelUp = result === 'win' && state.hero.experience >= state.hero.level * 1000;

    this.time.delayedCall(1800, () => {
      this.scene.stop('CombatScene');
      if (needsLevelUp && result === 'win') {
        this.scene.resume('AdventureMap');
        this.scene.pause('AdventureMap');
        this.scene.launch('LevelUpScene', { resumeScene: 'AdventureMap' });
      } else {
        this.events.emit('combat_end', result);
      }
    });
  }
}
