import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, COMBAT_COLS, COMBAT_ROWS,
  COMBAT_CELL_W, COMBAT_CELL_H, COMBAT_GRID_X, COMBAT_GRID_Y,
} from '../constants';
import { UNIT_DEFS } from '../data/units';
import { state, defeatEnemy, gainExperience } from '../GameState';
import type { EnemyEncounter, CombatStack } from '../types';

export class CombatScene extends Phaser.Scene {
  private encounter!: EnemyEncounter;
  private combatUnits: CombatStack[] = [];
  private turnQueue: CombatStack[] = [];
  private currentUnitIndex = 0;
  private selectedUnit?: CombatStack;
  private unitContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private logLines: string[] = [];
  private logText!: Phaser.GameObjects.Text;
  private turnLabel!: Phaser.GameObjects.Text;
  private highlightGraphics!: Phaser.GameObjects.Graphics;
  private actionButtons: Phaser.GameObjects.Container[] = [];
  private combatActive = true;

  constructor() { super({ key: 'CombatScene' }); }

  init(data: { encounter: EnemyEncounter }): void {
    this.encounter = data.encounter;
    this.combatUnits = [];
    this.turnQueue = [];
    this.unitContainers.clear();
    this.currentUnitIndex = 0;
    this.combatActive = true;
    this.logLines = [];
    this.actionButtons = [];
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a0d08');
    this.drawBackground();
    this.drawGrid();
    this.spawnUnits();
    this.buildTurnQueue();
    this.createUI();
    this.renderAllUnits();
    this.highlightGraphics = this.add.graphics().setDepth(20);
    this.startCurrentTurn();
  }

  // ─────────────────────────────────────────────────────────────
  // Setup
  // ─────────────────────────────────────────────────────────────

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0d08, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title banner
    bg.fillStyle(0x0d0808, 0.9);
    bg.fillRect(0, 0, GAME_WIDTH, 50);
    bg.lineStyle(1, 0xc8a040, 0.6);
    bg.lineBetween(0, 50, GAME_WIDTH, 50);

    this.add.text(GAME_WIDTH / 2, 25, `KAMPF: ${this.encounter.name}`, {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    // Center divider
    const gridMid = COMBAT_GRID_X + (COMBAT_COLS / 2) * COMBAT_CELL_W;
    const gridBottom = COMBAT_GRID_Y + COMBAT_ROWS * COMBAT_CELL_H;
    this.add.graphics()
      .lineStyle(2, 0xff4444, 0.4)
      .lineBetween(gridMid, COMBAT_GRID_Y, gridMid, gridBottom);

    this.add.text(gridMid - 60, COMBAT_GRID_Y - 18, 'NÚMENOR', {
      fontSize: '13px', color: '#4a78c0',
    });
    this.add.text(gridMid + 10, COMBAT_GRID_Y - 18, 'FEINDE', {
      fontSize: '13px', color: '#cc4444',
    });
  }

  private drawGrid(): void {
    const g = this.add.graphics().setDepth(1);
    for (let row = 0; row < COMBAT_ROWS; row++) {
      for (let col = 0; col < COMBAT_COLS; col++) {
        const x = COMBAT_GRID_X + col * COMBAT_CELL_W;
        const y = COMBAT_GRID_Y + row * COMBAT_CELL_H;
        const isPlayerSide = col < COMBAT_COLS / 2;
        g.fillStyle(isPlayerSide ? 0x0d1a2a : 0x2a0d0d, 0.6);
        g.fillRect(x + 1, y + 1, COMBAT_CELL_W - 2, COMBAT_CELL_H - 2);
        g.lineStyle(1, 0x3a3020, 0.5);
        g.strokeRect(x, y, COMBAT_CELL_W, COMBAT_CELL_H);
      }
    }
  }

  private spawnUnits(): void {
    let pid = 0;
    state.playerArmy.forEach((stack, idx) => {
      if (stack.count <= 0) return;
      const unit: CombatStack = {
        ...stack,
        gridX: 1,
        gridY: idx < COMBAT_ROWS ? idx : COMBAT_ROWS - 1,
        hasActed: false,
      };
      // give unique combat id
      (unit as CombatStack & { cid: string }).cid = `player_${pid++}_${stack.id}`;
      this.combatUnits.push(unit);
    });

    let eid = 0;
    this.encounter.stacks.forEach(({ unitId, count }, idx) => {
      const def = UNIT_DEFS[unitId];
      if (!def) return;
      const unit: CombatStack = {
        ...def,
        count,
        currentHp: def.maxHp,
        gridX: COMBAT_COLS - 2,
        gridY: idx < COMBAT_ROWS ? idx : COMBAT_ROWS - 1,
        hasActed: false,
      };
      (unit as CombatStack & { cid: string }).cid = `enemy_${eid++}_${def.id}`;
      this.combatUnits.push(unit);
    });
  }

  private buildTurnQueue(): void {
    this.turnQueue = [...this.combatUnits].sort((a, b) => b.speed - a.speed);
    this.currentUnitIndex = 0;
  }

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────

  private createUI(): void {
    const panelY = COMBAT_GRID_Y + COMBAT_ROWS * COMBAT_CELL_H + 10;
    const panelH = GAME_HEIGHT - panelY - 10;

    const panelBg = this.add.graphics().setDepth(5);
    panelBg.fillStyle(0x0d0808, 0.9);
    panelBg.lineStyle(1, 0x4a3820, 0.8);
    panelBg.fillRect(10, panelY, GAME_WIDTH - 20, panelH);
    panelBg.strokeRect(10, panelY, GAME_WIDTH - 20, panelH);

    this.turnLabel = this.add.text(20, panelY + 10, '', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setDepth(6);

    this.logText = this.add.text(20, panelY + 32, '', {
      fontSize: '13px', color: '#c0b090', lineSpacing: 3,
      wordWrap: { width: GAME_WIDTH - 200 },
    }).setDepth(6);

    // Retreat button (always available)
    this.createButton(GAME_WIDTH - 140, panelY + 20, 120, 36, 'RÜCKZUG', 0x6a1010, () => {
      if (this.combatActive) this.endCombat('lose');
    });
  }

  private createButton(
    x: number, y: number, w: number, h: number, label: string,
    color: number, cb: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(10);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.lineStyle(2, 0xc8a040, 0.8);
    bg.fillRoundedRect(0, 0, w, h, 5);
    bg.strokeRoundedRect(0, 0, w, h, 5);
    const txt = this.add.text(w / 2, h / 2, label, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    container.add([bg, txt]);
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', cb);
    return container;
  }

  // ─────────────────────────────────────────────────────────────
  // Unit rendering
  // ─────────────────────────────────────────────────────────────

  private getCid(u: CombatStack): string {
    return (u as CombatStack & { cid: string }).cid;
  }

  private cellToScreen(gx: number, gy: number): { x: number; y: number } {
    return {
      x: COMBAT_GRID_X + gx * COMBAT_CELL_W + COMBAT_CELL_W / 2,
      y: COMBAT_GRID_Y + gy * COMBAT_CELL_H + COMBAT_CELL_H / 2,
    };
  }

  private renderAllUnits(): void {
    this.combatUnits.forEach(u => this.renderUnit(u));
  }

  private renderUnit(u: CombatStack): void {
    const cid = this.getCid(u);
    this.unitContainers.get(cid)?.destroy();
    if (u.count <= 0) return;

    const { x, y } = this.cellToScreen(u.gridX, u.gridY);
    const container = this.add.container(x, y).setDepth(15);

    const bg = this.add.graphics();
    bg.fillStyle(u.color, 0.85);
    bg.lineStyle(2, u.faction === 'player' ? 0x88aaff : 0xff6666, 0.9);
    bg.fillRoundedRect(-28, -28, 56, 56, 6);
    bg.strokeRoundedRect(-28, -28, 56, 56, 6);

    const sym = this.add.text(0, -8, u.symbol, {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5);

    const countTxt = this.add.text(0, 14, `${u.count}`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // HP bar
    const barW = 50;
    const hpFrac = u.currentHp / u.maxHp;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(-barW / 2, 26, barW, 5);
    const barFg = this.add.graphics();
    const barColor = hpFrac > 0.6 ? 0x44bb44 : hpFrac > 0.3 ? 0xbbbb00 : 0xbb3333;
    barFg.fillStyle(barColor, 1);
    barFg.fillRect(-barW / 2, 26, barW * hpFrac, 5);

    container.add([bg, sym, countTxt, barBg, barFg]);
    container.setInteractive(new Phaser.Geom.Rectangle(-28, -28, 56, 56), Phaser.Geom.Rectangle.Contains);
    container.on('pointerdown', () => this.onUnitClicked(u));
    container.on('pointerover', () => { if (u.count > 0) bg.setAlpha(1.2); });
    container.on('pointerout', () => bg.setAlpha(1));

    this.unitContainers.set(cid, container);
  }

  // ─────────────────────────────────────────────────────────────
  // Turn logic
  // ─────────────────────────────────────────────────────────────

  private currentUnit(): CombatStack {
    return this.turnQueue[this.currentUnitIndex];
  }

  private startCurrentTurn(): void {
    if (!this.combatActive) return;

    // Skip dead units
    while (
      this.currentUnitIndex < this.turnQueue.length &&
      this.turnQueue[this.currentUnitIndex].count <= 0
    ) {
      this.currentUnitIndex++;
    }
    if (this.currentUnitIndex >= this.turnQueue.length) {
      this.nextRound();
      return;
    }

    const unit = this.currentUnit();
    this.turnLabel.setText(`Am Zug: ${unit.name} (${unit.faction === 'player' ? 'Spieler' : 'Feind'}) — ${unit.count} Einh.`);
    this.highlightCurrent(unit);

    if (unit.faction === 'enemy') {
      this.time.delayedCall(700, () => this.executeEnemyTurn(unit));
    } else {
      this.showPlayerActions(unit);
    }
  }

  private highlightCurrent(unit: CombatStack): void {
    this.highlightGraphics.clear();
    const { x, y } = this.cellToScreen(unit.gridX, unit.gridY);
    this.highlightGraphics.lineStyle(3, 0xffffff, 0.9);
    this.highlightGraphics.strokeRect(
      x - COMBAT_CELL_W / 2 + 2,
      y - COMBAT_CELL_H / 2 + 2,
      COMBAT_CELL_W - 4,
      COMBAT_CELL_H - 4,
    );
  }

  private showPlayerActions(unit: CombatStack): void {
    const panelY = COMBAT_GRID_Y + COMBAT_ROWS * COMBAT_CELL_H + 10;
    this.logLines.push(`${unit.name} ist am Zug. Klicke einen Feind an!`);
    this.updateLog();
  }

  private onUnitClicked(target: CombatStack): void {
    if (!this.combatActive) return;
    const attacker = this.currentUnit();
    if (attacker.faction !== 'player') return;
    if (target.count <= 0) return;
    if (target.faction === 'player') return; // can't attack own units (for now)

    this.executeAttack(attacker, target);
  }

  private executeAttack(attacker: CombatStack, target: CombatStack): void {
    const isRanged = attacker.range > 1;
    const distance = Math.abs(attacker.gridX - target.gridX) + Math.abs(attacker.gridY - target.gridY);
    if (!isRanged && distance > 1) {
      this.logLines.push(`${attacker.name} ist zu weit entfernt!`);
      this.updateLog();
      return;
    }

    const rawDmg = Math.max(1, attacker.attack * attacker.count - target.defense);
    const dmg = Phaser.Math.Between(Math.floor(rawDmg * 0.8), Math.ceil(rawDmg * 1.2));
    const killed = Math.min(target.count, Math.floor(dmg / target.maxHp));
    target.currentHp -= dmg % target.maxHp || target.maxHp;
    if (target.currentHp <= 0) {
      target.currentHp = target.maxHp;
    }
    target.count -= killed;
    if (target.count < 0) target.count = 0;

    this.logLines.push(`${attacker.name} → ${target.name}: ${dmg} Schaden, ${killed} getötet`);
    this.updateLog();
    this.renderUnit(target);

    this.flashHit(target);
    this.time.delayedCall(300, () => {
      this.checkCombatEnd();
      if (this.combatActive) this.advanceTurn();
    });
  }

  private executeEnemyTurn(unit: CombatStack): void {
    const targets = this.combatUnits.filter(u => u.faction === 'player' && u.count > 0);
    if (targets.length === 0) { this.advanceTurn(); return; }

    const target = Phaser.Utils.Array.GetRandom(targets) as CombatStack;
    const isRanged = unit.range > 1;

    if (!isRanged) {
      // Move one step toward target
      const dx = Math.sign(target.gridX - unit.gridX);
      const dy = Math.sign(target.gridY - unit.gridY);
      const newX = unit.gridX + dx;
      const newY = unit.gridY + dy;
      if (!this.cellOccupied(newX, newY)) {
        unit.gridX = newX;
        unit.gridY = newY;
        this.renderUnit(unit);
      }
    }

    const distance = Math.abs(unit.gridX - target.gridX) + Math.abs(unit.gridY - target.gridY);
    if (isRanged || distance <= 1) {
      this.executeAttack(unit, target);
    } else {
      this.logLines.push(`${unit.name} rückt vor...`);
      this.updateLog();
      this.time.delayedCall(300, () => this.advanceTurn());
    }
  }

  private cellOccupied(gx: number, gy: number): boolean {
    return this.combatUnits.some(u => u.count > 0 && u.gridX === gx && u.gridY === gy);
  }

  private advanceTurn(): void {
    this.currentUnitIndex++;
    if (this.currentUnitIndex >= this.turnQueue.length) {
      this.nextRound();
    } else {
      this.startCurrentTurn();
    }
  }

  private nextRound(): void {
    this.turnQueue.forEach(u => { u.hasActed = false; });
    this.currentUnitIndex = 0;
    this.logLines.push('── Neue Runde ──');
    this.updateLog();
    this.startCurrentTurn();
  }

  private flashHit(unit: CombatStack): void {
    const container = this.unitContainers.get(this.getCid(unit));
    if (!container) return;
    this.tweens.add({
      targets: container,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 2,
    });
  }

  private updateLog(): void {
    const last4 = this.logLines.slice(-4);
    this.logText.setText(last4.join('\n'));
  }

  // ─────────────────────────────────────────────────────────────
  // Win / Lose
  // ─────────────────────────────────────────────────────────────

  private checkCombatEnd(): void {
    const playersAlive = this.combatUnits.some(u => u.faction === 'player' && u.count > 0);
    const enemiesAlive = this.combatUnits.some(u => u.faction === 'enemy' && u.count > 0);

    if (!enemiesAlive) {
      this.endCombat('win');
    } else if (!playersAlive) {
      this.endCombat('lose');
    }
  }

  private endCombat(result: 'win' | 'lose'): void {
    if (!this.combatActive) return;
    this.combatActive = false;
    this.highlightGraphics.clear();

    if (result === 'win') {
      defeatEnemy(this.encounter.id);
      gainExperience(500);
      // Sync army HP back to game state
      state.playerArmy.forEach(stack => {
        const combatStack = this.combatUnits.find(
          u => u.faction === 'player' && u.id === stack.id,
        );
        if (combatStack) {
          stack.count = combatStack.count;
          stack.currentHp = combatStack.currentHp;
        }
      });
    }

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setDepth(30);
    const resultColor = result === 'win' ? '#44ff88' : '#ff4444';
    const resultText = result === 'win' ? 'SIEG!' : 'NIEDERLAGE';
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, resultText, {
      fontSize: '56px', fontFamily: 'Georgia, serif', color: resultColor, stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(31);

    const sub = result === 'win'
      ? '+500 Erfahrung\nEriador wird befreit!'
      : 'Deine Armee wurde vernichtet.';
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, sub, {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#e0d0a8', align: 'center',
    }).setOrigin(0.5).setDepth(31);

    this.time.delayedCall(2000, () => {
      this.scene.stop('CombatScene');
      this.events.emit('combat_end', result);
    });
  }
}
