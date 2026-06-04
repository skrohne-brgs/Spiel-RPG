import Phaser from 'phaser';
import {
  TILE_SIZE, MAP_COLS, MAP_ROWS, SIDEBAR_WIDTH, GAME_WIDTH, GAME_HEIGHT, TILE_CONFIG,
} from '../constants';
import { MAP_TILES, ENEMY_ENCOUNTERS, STORY_TRIGGERS, VICTORY_TILE } from '../data/mapData';
import { STORY_EVENTS } from '../data/story';
import { state, isEnemyDefeated, isEventTriggered, triggerEvent } from '../GameState';
import type { EnemyEncounter } from '../types';

const MAP_W = MAP_COLS * TILE_SIZE; // 960

export class AdventureMap extends Phaser.Scene {
  private heroSprite!: Phaser.GameObjects.Image;
  private heroTween?: Phaser.Tweens.Tween;
  private enemySprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private sidebar!: Phaser.GameObjects.Container;
  private hoverTile?: Phaser.GameObjects.Rectangle;
  private reachableTiles: Set<string> = new Set();
  private movementLeft = 8;
  private highlightLayer!: Phaser.GameObjects.Container;
  private turnText!: Phaser.GameObjects.Text;
  private turn = 1;

  constructor() { super({ key: 'AdventureMap' }); }

  create(): void {
    this.cameras.main.setBackgroundColor('#0d1a0d');
    this.renderMap();
    this.createEnemyMarkers();
    this.createHero();
    this.createSidebar();
    this.setupInput();
    this.triggerStartEvent();
  }

  private renderMap(): void {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tileType = MAP_TILES[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, `tile_${tileType}`);
      }
    }

    // Map border
    const border = this.add.graphics();
    border.lineStyle(2, 0x8a7050, 0.6);
    border.strokeRect(0, 0, MAP_W, GAME_HEIGHT);
  }

  private createEnemyMarkers(): void {
    ENEMY_ENCOUNTERS.forEach(enc => {
      if (isEnemyDefeated(enc.id)) return;
      const x = enc.tileX * TILE_SIZE + TILE_SIZE / 2;
      const y = enc.tileY * TILE_SIZE + TILE_SIZE / 2;
      const sprite = this.add.image(x, y, 'enemy_marker').setDepth(5);
      sprite.setScale(0.9);
      this.tweens.add({
        targets: sprite,
        y: y - 4,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.enemySprites.set(enc.id, sprite);
    });
  }

  private createHero(): void {
    const { x, y } = state.heroTile;
    this.heroSprite = this.add.image(
      x * TILE_SIZE + TILE_SIZE / 2,
      y * TILE_SIZE + TILE_SIZE / 2,
      'hero',
    ).setDepth(10);
    this.highlightLayer = this.add.container(0, 0).setDepth(3);
    this.computeReachable();
    this.renderHighlights();
  }

  private createSidebar(): void {
    const sx = MAP_W;
    const bg = this.add.graphics();
    bg.fillStyle(0x0d0d1a, 1);
    bg.lineStyle(1, 0x4a3820, 1);
    bg.fillRect(sx, 0, SIDEBAR_WIDTH, GAME_HEIGHT);
    bg.strokeRect(sx, 0, SIDEBAR_WIDTH, GAME_HEIGHT);

    this.add.text(sx + SIDEBAR_WIDTH / 2, 20, '── HELD ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    this.add.text(sx + 16, 50, `${state.hero.name}`, {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#ffd060',
    });
    this.add.text(sx + 16, 75, `${state.hero.title}`, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#a09060',
    });
    this.add.text(sx + 16, 98, `Stufe ${state.hero.level}  ATK ${state.hero.attack}  DEF ${state.hero.defense}`, {
      fontSize: '13px', color: '#c0b090',
    });

    const divider = this.add.graphics();
    divider.lineStyle(1, 0x4a3820, 0.8);
    divider.lineBetween(sx + 10, 120, sx + SIDEBAR_WIDTH - 10, 120);

    this.add.text(sx + SIDEBAR_WIDTH / 2, 135, '── ARMEE ──', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    let yOff = 160;
    state.playerArmy.forEach(stack => {
      const bar = this.add.graphics();
      bar.fillStyle(stack.color, 0.3);
      bar.lineStyle(1, stack.color, 0.6);
      bar.fillRoundedRect(sx + 10, yOff, SIDEBAR_WIDTH - 20, 40, 4);
      bar.strokeRoundedRect(sx + 10, yOff, SIDEBAR_WIDTH - 20, 40, 4);

      this.add.text(sx + 22, yOff + 6, `[${stack.symbol}] ${stack.name}`, {
        fontSize: '13px', color: '#e0d0a0',
      });
      this.add.text(sx + 22, yOff + 23, `x${stack.count}  HP ${stack.currentHp}/${stack.maxHp}`, {
        fontSize: '12px', color: '#a09070',
      });
      yOff += 50;
    });

    const divider2 = this.add.graphics();
    divider2.lineStyle(1, 0x4a3820, 0.8);
    divider2.lineBetween(sx + 10, yOff + 10, sx + SIDEBAR_WIDTH - 10, yOff + 10);

    this.add.text(sx + SIDEBAR_WIDTH / 2, yOff + 25, '── AKTIONEN ──', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    this.turnText = this.add.text(sx + 16, yOff + 50, `Zug: ${this.turn}  Bewegung: ${this.movementLeft}`, {
      fontSize: '13px', color: '#c0b090',
    });

    // End-turn button
    const btnY = GAME_HEIGHT - 80;
    const btnG = this.add.graphics();
    btnG.fillStyle(0x3a2810, 1);
    btnG.lineStyle(2, 0xc8a040, 1);
    btnG.fillRoundedRect(sx + 20, btnY, SIDEBAR_WIDTH - 40, 50, 6);
    btnG.strokeRoundedRect(sx + 20, btnY, SIDEBAR_WIDTH - 40, 50, 6);

    const btnTxt = this.add.text(sx + SIDEBAR_WIDTH / 2, btnY + 25, 'ZUG BEENDEN', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);

    const btnZone = this.add.zone(sx + SIDEBAR_WIDTH / 2, btnY + 25, SIDEBAR_WIDTH - 40, 50).setInteractive({ cursor: 'pointer' });
    btnZone.on('pointerdown', () => this.endTurn());
    btnZone.on('pointerover', () => btnTxt.setColor('#ffffff'));
    btnZone.on('pointerout', () => btnTxt.setColor('#ffd060'));

    // Help text
    this.add.text(sx + 16, GAME_HEIGHT - 130, 'Klick auf Karte = Bewegen\nFeind-Dreieck = Kampf', {
      fontSize: '12px', color: '#806040', lineSpacing: 4,
    });
  }

  private setupInput(): void {
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.x >= MAP_W) return; // sidebar click
      if (this.heroTween?.isPlaying()) return;
      const col = Math.floor(ptr.x / TILE_SIZE);
      const row = Math.floor(ptr.y / TILE_SIZE);
      this.handleTileClick(col, row);
    });
  }

  private handleTileClick(col: number, row: number): void {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return;
    const key = `${col},${row}`;
    if (!this.reachableTiles.has(key)) return;

    const tileType = MAP_TILES[row][col];
    const cfg = TILE_CONFIG[tileType];
    const cost = Math.ceil(cfg.moveCost);

    if (this.movementLeft < cost) return;

    this.movementLeft -= cost;
    state.heroTile = { x: col, y: row };
    this.moveHeroTo(col, row, () => this.onHeroArrived(col, row));
    this.computeReachable();
    this.renderHighlights();
    this.updateTurnText();
  }

  private moveHeroTo(col: number, row: number, onDone: () => void): void {
    const tx = col * TILE_SIZE + TILE_SIZE / 2;
    const ty = row * TILE_SIZE + TILE_SIZE / 2;
    this.heroTween = this.tweens.add({
      targets: this.heroSprite,
      x: tx, y: ty,
      duration: 250,
      ease: 'Linear',
      onComplete: onDone,
    });
  }

  private onHeroArrived(col: number, row: number): void {
    const storyKey = `${col},${row}`;
    if (STORY_TRIGGERS[storyKey] && !isEventTriggered(STORY_TRIGGERS[storyKey])) {
      const eventId = STORY_TRIGGERS[storyKey];
      triggerEvent(eventId);
      const ev = STORY_EVENTS[eventId];
      if (ev) {
        this.scene.pause('AdventureMap');
        this.scene.launch('DialogScene', { event: ev });
        return;
      }
    }

    const encounter = ENEMY_ENCOUNTERS.find(
      e => e.tileX === col && e.tileY === row && !isEnemyDefeated(e.id),
    );
    if (encounter) {
      this.startCombat(encounter);
    }
  }

  private startCombat(encounter: EnemyEncounter): void {
    this.scene.pause('AdventureMap');
    this.scene.launch('CombatScene', { encounter });
    this.scene.get('CombatScene').events.once('combat_end', (result: 'win' | 'lose') => {
      if (result === 'win') {
        encounter.defeated = true;
        const sprite = this.enemySprites.get(encounter.id);
        sprite?.destroy();
        this.enemySprites.delete(encounter.id);
        this.scene.resume('AdventureMap');
      } else {
        this.scene.stop('CombatScene');
        this.scene.stop('AdventureMap');
        this.scene.start('GameOverScene');
      }
    });
  }

  private computeReachable(): void {
    this.reachableTiles.clear();
    const { x: sx, y: sy } = state.heroTile;
    const queue: Array<[number, number, number]> = [[sx, sy, 0]];
    const visited = new Set<string>([`${sx},${sy}`]);

    while (queue.length > 0) {
      const [cx, cy, cost] = queue.shift()!;
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) continue;
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        visited.add(key);
        const ttype = MAP_TILES[ny][nx];
        const cfg = TILE_CONFIG[ttype];
        if (!cfg.walkable) continue;
        const newCost = cost + Math.ceil(cfg.moveCost);
        if (newCost <= this.movementLeft) {
          this.reachableTiles.add(key);
          queue.push([nx, ny, newCost]);
        }
      }
    }
  }

  private renderHighlights(): void {
    this.highlightLayer.removeAll(true);
    this.reachableTiles.forEach(key => {
      const [col, row] = key.split(',').map(Number);
      const rect = this.add.rectangle(
        col * TILE_SIZE + TILE_SIZE / 2,
        row * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE - 2,
        TILE_SIZE - 2,
        0x88ccff,
        0.22,
      );
      this.highlightLayer.add(rect);
    });
  }

  private endTurn(): void {
    this.turn++;
    this.movementLeft = 8;
    this.computeReachable();
    this.renderHighlights();
    this.updateTurnText();
  }

  private updateTurnText(): void {
    this.turnText?.setText(`Zug: ${this.turn}  Bewegung: ${this.movementLeft}`);
  }

  private triggerStartEvent(): void {
    const key = `${state.heroTile.x},${state.heroTile.y}`;
    if (STORY_TRIGGERS[key] && !isEventTriggered(STORY_TRIGGERS[key])) {
      const eventId = STORY_TRIGGERS[key];
      triggerEvent(eventId);
      const ev = STORY_EVENTS[eventId];
      if (ev) {
        this.time.delayedCall(400, () => {
          this.scene.pause('AdventureMap');
          this.scene.launch('DialogScene', { event: ev });
        });
      }
    }
  }
}
