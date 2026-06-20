import Phaser from 'phaser';
import {
  TILE_SIZE, MAP_COLS, MAP_ROWS, SIDEBAR_WIDTH, GAME_WIDTH, GAME_HEIGHT, TILE_CONFIG,
} from '../constants';
import { MAP_TILES, ENEMY_ENCOUNTERS, RESOURCES, STORY_TRIGGERS } from '../data/mapData';
import { STORY_EVENTS } from '../data/story';
import { CITIES } from '../data/cities';
import { ARTIFACTS } from '../data/artifacts';
import {
  state, isEnemyDefeated, isEventTriggered, triggerEvent,
  isResourceCollected, collectResource, applyArtifact, movementPoints,
} from '../GameState';
import type { EnemyEncounter, ResourceOnMap } from '../types';

const MAP_W = MAP_COLS * TILE_SIZE;

export class AdventureMap extends Phaser.Scene {
  private heroSprite!: Phaser.GameObjects.Image;
  private enemySprites = new Map<string, Phaser.GameObjects.Image>();
  private resourceSprites = new Map<string, Phaser.GameObjects.Image>();
  private highlightLayer!: Phaser.GameObjects.Container;
  private reachableTiles = new Set<string>();
  private movementLeft = 0;
  private turn = 1;
  // sidebar update refs
  private goldText!: Phaser.GameObjects.Text;
  private manaText!: Phaser.GameObjects.Text;
  private moveText!: Phaser.GameObjects.Text;
  private armyRows!: Phaser.GameObjects.Container;
  private heroLvlText!: Phaser.GameObjects.Text;
  private floatingTexts: Phaser.GameObjects.Text[] = [];

  constructor() { super({ key: 'AdventureMap' }); }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a120a');
    this.movementLeft = movementPoints();
    this.renderMap();
    this.renderCities();
    this.renderResources();
    this.createEnemyMarkers();
    this.createHero();
    this.createSidebar();
    this.setupInput();
    this.triggerStartEvent();
  }

  // ── Map rendering ─────────────────────────────────────────────────────────

  private renderMap(): void {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const t = MAP_TILES[row][col];
        this.add.image(col * TILE_SIZE + 24, row * TILE_SIZE + 24, `tile_${t}`);
      }
    }
  }

  private renderCities(): void {
    CITIES.forEach(city => {
      // Cities use tile_7 (already in map data), just add name labels
      this.add.text(
        city.tileX * TILE_SIZE + 24,
        city.tileY * TILE_SIZE - 6,
        city.name,
        { fontSize: '10px', color: '#ffd060', stroke: '#000000', strokeThickness: 2 },
      ).setOrigin(0.5).setDepth(4);
    });
  }

  private renderResources(): void {
    RESOURCES.forEach(r => {
      if (isResourceCollected(r.id)) return;
      const key = r.type === 'artifact' ? 'resource_artifact' : 'resource_gold';
      const sprite = this.add.image(
        r.tileX * TILE_SIZE + 24, r.tileY * TILE_SIZE + 24, key,
      ).setDepth(6).setScale(0.85);
      this.tweens.add({
        targets: sprite, y: sprite.y - 3, duration: 1200, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.resourceSprites.set(r.id, sprite);
    });
  }

  private createEnemyMarkers(): void {
    ENEMY_ENCOUNTERS.forEach(enc => {
      if (isEnemyDefeated(enc.id)) return;
      const sprite = this.add.image(
        enc.tileX * TILE_SIZE + 24, enc.tileY * TILE_SIZE + 24, 'enemy_marker',
      ).setDepth(5).setScale(0.88);
      this.tweens.add({ targets: sprite, y: sprite.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.enemySprites.set(enc.id, sprite);
    });
  }

  private createHero(): void {
    const { x, y } = state.heroTile;
    this.heroSprite = this.add.image(
      x * TILE_SIZE + 24, y * TILE_SIZE + 24, 'hero',
    ).setDepth(10);
    this.highlightLayer = this.add.container(0, 0).setDepth(3);
    this.computeReachable();
    this.renderHighlights();
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────

  private createSidebar(): void {
    const sx = MAP_W;
    const bg = this.add.graphics();
    bg.fillStyle(0x060610, 1);
    bg.lineStyle(1, 0x3a2810, 1);
    bg.fillRect(sx, 0, SIDEBAR_WIDTH, GAME_HEIGHT);
    bg.strokeRect(sx, 0, SIDEBAR_WIDTH, GAME_HEIGHT);

    this.add.text(sx + SIDEBAR_WIDTH / 2, 18, '── HELD ──', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    const h = state.hero;
    this.add.text(sx + 14, 38, h.name, { fontSize: '22px', fontFamily: 'Georgia, serif', color: '#ffd060' });
    this.add.text(sx + 14, 63, h.title, { fontSize: '11px', color: '#806040', wordWrap: { width: SIDEBAR_WIDTH - 28 } });

    this.heroLvlText = this.add.text(sx + 14, 86,
      `Stufe ${h.level}  ATK ${h.attack}  DEF ${h.defense}  WIS ${h.knowledge}`, { fontSize: '12px', color: '#c0b090' });

    this.manaText = this.add.text(sx + 14, 103,
      `Mana: ${h.mana}/${h.maxMana}  |  Zauberstärke: ${h.spellPower}`, { fontSize: '12px', color: '#80a0ff' });

    if (h.artifacts.length > 0) {
      this.add.text(sx + 14, 120, `Artefakte: ${h.artifacts.length}`, { fontSize: '11px', color: '#c080ff' });
    }

    this.divider(sx + 8, 136, SIDEBAR_WIDTH - 16);
    this.add.text(sx + SIDEBAR_WIDTH / 2, 150, '── ARMEE ──', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    this.armyRows = this.add.container(0, 165);
    this.refreshArmyPanel(sx);

    this.divider(sx + 8, 370, SIDEBAR_WIDTH - 16);
    this.add.text(sx + SIDEBAR_WIDTH / 2, 384, '── RESSOURCEN ──', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    this.goldText = this.add.text(sx + 14, 404, `⚙ Gold: ${state.gold}`, { fontSize: '15px', color: '#ffd060' });

    this.divider(sx + 8, 430, SIDEBAR_WIDTH - 16);
    this.moveText = this.add.text(sx + 14, 444,
      `Bewegung: ${this.movementLeft} / ${movementPoints()}  |  Zug: ${this.turn}`, { fontSize: '12px', color: '#c0b090' });

    this.add.text(sx + 14, GAME_HEIGHT - 130,
      'Klick = Bewegen\nRotes Dreieck = Kampf\nGold = Ressource\nLila = Artefakt\nStadt = Anwerbung',
      { fontSize: '11px', color: '#604030', lineSpacing: 3 });

    // End-turn button
    const btnY = GAME_HEIGHT - 70;
    const btnG = this.add.graphics();
    btnG.fillStyle(0x2a1a08, 1);
    btnG.lineStyle(2, 0xc8a040, 1);
    btnG.fillRoundedRect(sx + 16, btnY, SIDEBAR_WIDTH - 32, 50, 6);
    btnG.strokeRoundedRect(sx + 16, btnY, SIDEBAR_WIDTH - 32, 50, 6);
    const btnTxt = this.add.text(sx + SIDEBAR_WIDTH / 2, btnY + 25, 'ZUG BEENDEN', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const z = this.add.zone(sx + SIDEBAR_WIDTH / 2, btnY + 25, SIDEBAR_WIDTH - 32, 50).setInteractive({ cursor: 'pointer' });
    z.on('pointerdown', () => this.endTurn());
    z.on('pointerover', () => btnTxt.setColor('#ffffff'));
    z.on('pointerout', () => btnTxt.setColor('#ffd060'));
  }

  private refreshArmyPanel(sx: number): void {
    this.armyRows.removeAll(true);
    let yo = 0;
    state.playerArmy.forEach(stack => {
      const rowBg = this.add.graphics();
      rowBg.fillStyle(stack.color, 0.15);
      rowBg.lineStyle(1, stack.color, 0.4);
      rowBg.fillRoundedRect(sx + 10, yo, SIDEBAR_WIDTH - 20, 40, 4);
      rowBg.strokeRoundedRect(sx + 10, yo, SIDEBAR_WIDTH - 20, 40, 4);
      this.armyRows.add(rowBg);

      const t1 = this.add.text(sx + 22, yo + 5, `[${stack.symbol}] ${stack.name}`, { fontSize: '12px', color: '#e0d0a0' });
      const t2 = this.add.text(sx + 22, yo + 22, `×${stack.count}  HP ${stack.currentHp}/${stack.maxHp}`, { fontSize: '11px', color: '#a09070' });
      this.armyRows.add([t1, t2]);
      yo += 46;
    });
  }

  private divider(x: number, y: number, w: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0x4a3820, 0.6);
    g.lineBetween(x, y, x + w, y);
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.x >= MAP_W) return;
      const col = Math.floor(ptr.x / TILE_SIZE);
      const row = Math.floor(ptr.y / TILE_SIZE);
      this.handleTileClick(col, row);
    });
  }

  private handleTileClick(col: number, row: number): void {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return;
    if (!this.reachableTiles.has(`${col},${row}`)) return;

    const tileType = MAP_TILES[row][col];
    const cfg = TILE_CONFIG[tileType];
    const cost = Math.max(1, Math.ceil(cfg.moveCost));
    if (this.movementLeft < cost) return;

    this.movementLeft -= cost;
    state.heroTile = { x: col, y: row };

    this.tweens.add({
      targets: this.heroSprite,
      x: col * TILE_SIZE + 24, y: row * TILE_SIZE + 24,
      duration: 200, ease: 'Linear',
      onComplete: () => this.onHeroArrived(col, row),
    });

    this.computeReachable();
    this.renderHighlights();
    this.moveText.setText(`Bewegung: ${this.movementLeft} / ${movementPoints()}  |  Zug: ${this.turn}`);
  }

  private onHeroArrived(col: number, row: number): void {
    // Check resource/artifact
    const res = RESOURCES.find(r => r.tileX === col && r.tileY === row && !isResourceCollected(r.id));
    if (res) this.collectResource(res);

    // Check city
    const city = CITIES.find(c => c.tileX === col && c.tileY === row);
    if (city) {
      this.openCity(city.id);
      return;
    }

    // Check story event
    const storyKey = `${col},${row}`;
    if (STORY_TRIGGERS[storyKey] && !isEventTriggered(STORY_TRIGGERS[storyKey])) {
      const ev = STORY_EVENTS[STORY_TRIGGERS[storyKey]];
      if (ev) {
        triggerEvent(STORY_TRIGGERS[storyKey]);
        this.launchDialog(ev);
        return;
      }
    }

    // Check enemy
    const enc = ENEMY_ENCOUNTERS.find(e => e.tileX === col && e.tileY === row && !isEnemyDefeated(e.id));
    if (enc) this.startCombat(enc);
  }

  private collectResource(res: ResourceOnMap): void {
    collectResource(res.id);
    this.resourceSprites.get(res.id)?.destroy();
    this.resourceSprites.delete(res.id);

    if (res.type === 'gold' && res.goldValue) {
      state.gold += res.goldValue;
      this.goldText.setText(`⚙ Gold: ${state.gold}`);
      this.showFloat(`+${res.goldValue} Gold`, 0xffd060, res.tileX, res.tileY);
    } else if (res.type === 'artifact' && res.artifactId) {
      applyArtifact(res.artifactId);
      const art = ARTIFACTS.find(a => a.id === res.artifactId);
      if (art) {
        this.showFloat(`${art.name} gefunden!`, 0xc080ff, res.tileX, res.tileY);
        this.manaText.setText(`Mana: ${state.hero.mana}/${state.hero.maxMana}  |  Zauberstärke: ${state.hero.spellPower}`);
        this.heroLvlText.setText(`Stufe ${state.hero.level}  ATK ${state.hero.attack}  DEF ${state.hero.defense}  WIS ${state.hero.knowledge}`);
      }
    }
  }

  private showFloat(msg: string, color: number, tileX: number, tileY: number): void {
    const t = this.add.text(
      tileX * TILE_SIZE + 24, tileY * TILE_SIZE,
      msg, { fontSize: '14px', color: `#${color.toString(16).padStart(6, '0')}`, stroke: '#000000', strokeThickness: 2 },
    ).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 1400, onComplete: () => t.destroy() });
  }

  private openCity(cityId: string): void {
    this.scene.pause('AdventureMap');
    this.scene.launch('CityScene', { cityId });
    this.scene.get('CityScene').events.once('shutdown', () => {
      this.refreshArmyPanel(MAP_W);
      this.goldText.setText(`⚙ Gold: ${state.gold}`);
      this.scene.resume('AdventureMap');
    });
  }

  private launchDialog(ev: { id: string; lines: { speaker: string; text: string }[]; onComplete?: string }): void {
    this.scene.pause('AdventureMap');
    this.scene.launch('DialogScene', { event: ev });
    this.scene.get('DialogScene').events.once('shutdown', () => {
      if (ev.onComplete === 'victory') {
        this.scene.stop('AdventureMap');
        this.scene.start('VictoryScene');
      } else {
        this.scene.resume('AdventureMap');
      }
    });
  }

  private startCombat(encounter: EnemyEncounter): void {
    this.scene.pause('AdventureMap');
    this.scene.launch('CombatScene', { encounter });
    this.scene.get('CombatScene').events.once('combat_end', (result: 'win' | 'lose') => {
      if (result === 'win') {
        encounter.defeated = true;
        this.enemySprites.get(encounter.id)?.destroy();
        this.enemySprites.delete(encounter.id);
        this.refreshArmyPanel(MAP_W);
        this.heroLvlText.setText(`Stufe ${state.hero.level}  ATK ${state.hero.attack}  DEF ${state.hero.defense}  WIS ${state.hero.knowledge}`);
        this.scene.resume('AdventureMap');
      } else {
        this.scene.stop('CombatScene');
        this.scene.stop('AdventureMap');
        this.scene.start('GameOverScene');
      }
    });
  }

  // ── Movement system ───────────────────────────────────────────────────────

  private computeReachable(): void {
    this.reachableTiles.clear();
    const { x: sx, y: sy } = state.heroTile;
    const queue: Array<[number, number, number]> = [[sx, sy, 0]];
    const visited = new Set<string>([`${sx},${sy}`]);
    while (queue.length > 0) {
      const [cx, cy, cost] = queue.shift()!;
      for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) continue;
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        visited.add(key);
        const cfg = TILE_CONFIG[MAP_TILES[ny][nx]];
        if (!cfg.walkable) continue;
        const nc = cost + Math.max(1, Math.ceil(cfg.moveCost));
        if (nc <= this.movementLeft) { this.reachableTiles.add(key); queue.push([nx, ny, nc]); }
      }
    }
  }

  private renderHighlights(): void {
    this.highlightLayer.removeAll(true);
    this.reachableTiles.forEach(key => {
      const [col, row] = key.split(',').map(Number);
      this.highlightLayer.add(
        this.add.rectangle(col * TILE_SIZE + 24, row * TILE_SIZE + 24, TILE_SIZE - 2, TILE_SIZE - 2, 0x88ccff, 0.2),
      );
    });
  }

  private endTurn(): void {
    this.turn++;
    this.movementLeft = movementPoints();
    this.computeReachable();
    this.renderHighlights();
    this.moveText.setText(`Bewegung: ${this.movementLeft} / ${movementPoints()}  |  Zug: ${this.turn}`);
  }

  private triggerStartEvent(): void {
    const key = `${state.heroTile.x},${state.heroTile.y}`;
    if (STORY_TRIGGERS[key] && !isEventTriggered(STORY_TRIGGERS[key])) {
      const ev = STORY_EVENTS[STORY_TRIGGERS[key]];
      if (ev) {
        triggerEvent(STORY_TRIGGERS[key]);
        this.time.delayedCall(500, () => this.launchDialog(ev));
      }
    }
  }
}
