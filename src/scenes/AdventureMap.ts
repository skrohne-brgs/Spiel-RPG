import Phaser from 'phaser';
import {
  TILE_SIZE, MAP_COLS, MAP_ROWS, SIDEBAR_WIDTH, GAME_WIDTH, GAME_HEIGHT, TILE_CONFIG,
  HEX_SIZE, HEX_W, HEX_OFFSET_Y,
} from '../constants';
import { CAMPAIGN } from '../data/campaign';
import { STORY_EVENTS } from '../data/story';
import { ARTIFACTS } from '../data/artifacts';
import {
  state, isEnemyDefeated, isEventTriggered, triggerEvent,
  isResourceCollected, collectResource, applyArtifact, movementPoints,
  updateFog, saveGame, advanceMission, setVictoryPhase,
  collectLore, isLoreCollected,
} from '../GameState';
import { music } from '../audio/ChiptuneEngine';
import type { EnemyEncounter, ResourceOnMap, MissionData } from '../types';

const MAP_W = MAP_COLS * TILE_SIZE; // 960

// ── Hex helpers ───────────────────────────────────────────────────────────────

function hexCenter(col: number, row: number) {
  return {
    x: (col + (row % 2 === 1 ? 1 : 0.5)) * HEX_W,
    y: HEX_OFFSET_Y + row * 1.5 * HEX_SIZE + HEX_SIZE,
  };
}

function hexNeighbors(col: number, row: number): [number, number][] {
  const odd = row % 2 === 1;
  return ([
    [col - 1, row], [col + 1, row],
    [col + (odd ? 0 : -1), row - 1], [col + (odd ? 1 : 0), row - 1],
    [col + (odd ? 0 : -1), row + 1], [col + (odd ? 1 : 0), row + 1],
  ] as [number, number][]).filter(([c, r]) => c >= 0 && c < MAP_COLS && r >= 0 && r < MAP_ROWS);
}

function pixelToHex(px: number, py: number): [number, number] | null {
  let best = Infinity, bc = 0, br = 0;
  for (let r = 0; r < MAP_ROWS; r++)
    for (let c = 0; c < MAP_COLS; c++) {
      const { x, y } = hexCenter(c, r);
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < best) { best = d; bc = c; br = r; }
    }
  return best < HEX_W * HEX_W ? [bc, br] : null;
}

function hexPts(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

// Minimap terrain colors
const MM_COL: Record<number, number> = {
  0: 0x4a8a28, 1: 0x6a5a4a, 2: 0x265c18,
  3: 0x1a5a8a, 4: 0x4a3a2a, 5: 0x8a7050,
  6: 0x7a6030, 7: 0x3a3a5a,
};

// ──────────────────────────────────────────────────────────────────────────────

export class AdventureMap extends Phaser.Scene {
  private mission!: MissionData;
  private heroSprite!: Phaser.GameObjects.Image;
  private enemySprites    = new Map<string, Phaser.GameObjects.Image>();
  private resourceSprites = new Map<string, Phaser.GameObjects.Image>();
  private loreSprites     = new Map<string, Phaser.GameObjects.Text>();
  private objectiveBannerText!: Phaser.GameObjects.Text;
  private highlightLayer!: Phaser.GameObjects.Container;
  private fogLayer!:       Phaser.GameObjects.Graphics;
  private minimapGfx!:    Phaser.GameObjects.Graphics;
  private reachableTiles  = new Set<string>();
  private movementLeft = 0;
  private turn = 1;
  private goldText!:    Phaser.GameObjects.Text;
  private manaText!:    Phaser.GameObjects.Text;
  private moveText!:    Phaser.GameObjects.Text;
  private armyRows!:    Phaser.GameObjects.Container;
  private heroLvlText!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'AdventureMap' }); }

  create(): void {
    this.mission = CAMPAIGN[state.currentMissionIdx];
    this.cameras.main.setBackgroundColor('#0a120a');
    this.movementLeft = movementPoints();

    this.renderMap();
    this.renderCities();
    this.renderResources();
    this.createEnemyMarkers();
    this.renderVictoryMarker();
    this.renderLoreItems();
    this.createHero();
    this.createFogLayer();
    this.createSidebar();
    this.renderObjectiveBanner();
    this.setupInput();

    // Initial fog reveal around starting position
    updateFog(state.heroTile.x, state.heroTile.y);
    this.renderFog();
    this.updateSpriteVisibility();
    this.renderMinimap();

    music.play('map');
    this.triggerStartEvent();
  }

  // ── Map ────────────────────────────────────────────────────────────────────

  private renderMap(): void {
    const key = `map_base_${state.currentMissionIdx}`;
    this.add.image(MAP_W / 2, GAME_HEIGHT / 2, key).setDepth(0);
  }

  private renderCities(): void {
    this.mission.cities.forEach(city => {
      const { x, y } = hexCenter(city.tileX, city.tileY);
      this.add.text(x, y - HEX_SIZE - 2, city.name, {
        fontSize: '10px', color: '#ffd060', stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(4);
    });
  }

  private renderResources(): void {
    this.mission.resources.forEach(r => {
      if (isResourceCollected(r.id)) return;
      const key = r.type === 'artifact' ? 'resource_artifact' : 'resource_gold';
      const { x, y } = hexCenter(r.tileX, r.tileY);
      const sprite = this.add.image(x, y, key).setDepth(6).setScale(0.85).setAlpha(0);
      this.tweens.add({ targets: sprite, y: y - 3, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.resourceSprites.set(r.id, sprite);
    });
  }

  private createEnemyMarkers(): void {
    this.mission.enemies.forEach(enc => {
      if (isEnemyDefeated(enc.id)) return;
      const { x, y } = hexCenter(enc.tileX, enc.tileY);
      const sprite = this.add.image(x, y, 'enemy_marker').setDepth(5).setScale(0.88).setAlpha(0);
      this.tweens.add({ targets: sprite, y: y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.enemySprites.set(enc.id, sprite);
    });
  }

  private createHero(): void {
    const { x, y } = hexCenter(state.heroTile.x, state.heroTile.y);
    this.heroSprite = this.add.image(x, y, 'hero').setDepth(10);
    this.highlightLayer = this.add.container(0, 0).setDepth(3);
    this.computeReachable();
    this.renderHighlights();
  }

  // ── Mission objective ────────────────────────────────────────────────────────

  private cityNameAt(tx: number, ty: number): string {
    return this.mission.cities.find(c => c.tileX === tx && c.tileY === ty)?.name ?? 'das markierte Ziel';
  }

  private currentObjectiveText(): string {
    const vc = this.mission.victoryCondition;
    const phase = state.missionVictoryPhase;
    if (vc.type === 'reach') {
      return `Erreiche ${this.cityNameAt(this.mission.victoryTile.x, this.mission.victoryTile.y)}`;
    }
    if (vc.type === 'artifact') {
      const art = ARTIFACTS.find(a => a.id === vc.artifactId);
      return `Finde: ${art?.name ?? vc.artifactId}`;
    }
    if (vc.type === 'boss_then_reach') {
      if (phase < 1) {
        const boss = this.mission.enemies.find(e => e.id === vc.enemyId);
        return `Besiege: ${boss?.name ?? vc.enemyId}`;
      }
      return `Erreiche ${this.cityNameAt(this.mission.victoryTile.x, this.mission.victoryTile.y)}`;
    }
    if (vc.type === 'artifact_then_reach') {
      if (phase < 1) {
        const art = ARTIFACTS.find(a => a.id === vc.artifactId);
        return `Finde: ${art?.name ?? vc.artifactId}`;
      }
      return `Erreiche ${this.cityNameAt(this.mission.victoryTile.x, this.mission.victoryTile.y)}`;
    }
    return 'Unbekanntes Ziel';
  }

  /** Pulsing golden marker on the victory tile — only shown for reach-type phases. */
  private renderVictoryMarker(): void {
    const vc = this.mission.victoryCondition;
    if (vc.type === 'artifact') return;
    const { x, y } = hexCenter(this.mission.victoryTile.x, this.mission.victoryTile.y);
    const ring = this.add.graphics().setDepth(12);
    ring.lineStyle(3, 0xffd060, 0.9);
    ring.strokePoints(hexPts(x, y, HEX_SIZE - 2), true);
    const star = this.add.text(x, y - HEX_SIZE - 10, '✪', {
      fontSize: '22px', color: '#ffd060', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12);
    this.tweens.add({
      targets: [ring, star], alpha: 0.35, duration: 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  /** Objective banner across the top of the map — text is updatable when phase changes. */
  private renderObjectiveBanner(): void {
    const w = 560, h = 30, x = MAP_W / 2 - w / 2, y = 6;
    const g = this.add.graphics().setDepth(60);
    g.fillStyle(0x0a0a05, 0.82);
    g.lineStyle(1, 0xc8a040, 0.7);
    g.fillRoundedRect(x, y, w, h, 6);
    g.strokeRoundedRect(x, y, w, h, 6);
    this.objectiveBannerText = this.add.text(MAP_W / 2, y + h / 2,
      this.bannerContent(), {
        fontSize: '13px', fontFamily: 'Georgia, serif', color: '#ffd060',
      }).setOrigin(0.5).setDepth(61);
  }

  private bannerContent(): string {
    return `Mission ${state.currentMissionIdx + 1}/${CAMPAIGN.length}: ${this.mission.title}   ✪ ${this.currentObjectiveText()}`;
  }

  private updateObjectiveBanner(): void {
    this.objectiveBannerText?.setText(this.bannerContent());
  }

  /** Render lore scroll markers on the map. */
  private renderLoreItems(): void {
    (this.mission.loreItems ?? []).forEach(lore => {
      if (isLoreCollected(lore.id)) return;
      const { x, y } = hexCenter(lore.tileX, lore.tileY);
      const marker = this.add.text(x, y, '📜', {
        fontSize: '18px',
      }).setOrigin(0.5).setDepth(6).setAlpha(0);
      this.tweens.add({ targets: marker, y: y - 3, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.loreSprites.set(lore.id, marker);
    });
  }

  // ── Fog of War ─────────────────────────────────────────────────────────────

  private createFogLayer(): void {
    this.fogLayer = this.add.graphics().setDepth(11);
  }

  private renderFog(): void {
    this.fogLayer.clear();
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const fog = state.fogMap[row][col];
        if (fog === 2) continue;
        const { x, y } = hexCenter(col, row);
        const pts = hexPts(x, y, HEX_SIZE + 0.5);
        this.fogLayer.fillStyle(0x000000, fog === 0 ? 1.0 : 0.58);
        this.fogLayer.fillPoints(pts, true);
      }
    }
  }

  private updateSpriteVisibility(): void {
    this.mission.resources.forEach(r => {
      const sprite = this.resourceSprites.get(r.id);
      if (sprite) sprite.setAlpha(state.fogMap[r.tileY][r.tileX] === 2 ? 1 : 0);
    });
    this.mission.enemies.forEach(enc => {
      const sprite = this.enemySprites.get(enc.id);
      if (sprite) sprite.setAlpha(state.fogMap[enc.tileY][enc.tileX] === 2 ? 1 : 0);
    });
    (this.mission.loreItems ?? []).forEach(lore => {
      const sprite = this.loreSprites.get(lore.id);
      if (sprite) sprite.setAlpha(state.fogMap[lore.tileY][lore.tileX] === 2 ? 1 : 0);
    });
  }

  // ── Minimap ────────────────────────────────────────────────────────────────

  private renderMinimap(): void {
    if (!this.minimapGfx) {
      this.minimapGfx = this.add.graphics().setDepth(50);
    }
    const mx = MAP_W + 10, my = 468, mw = SIDEBAR_WIDTH - 20, mh = 98;
    const tw = mw / MAP_COLS, th = mh / MAP_ROWS;
    this.minimapGfx.clear();

    // Background
    this.minimapGfx.fillStyle(0x000000, 0.85);
    this.minimapGfx.fillRect(mx, my, mw, mh);

    // Terrain
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const fog = state.fogMap[r][c];
        if (fog === 0) continue;
        this.minimapGfx.fillStyle(MM_COL[this.mission.mapTiles[r][c]], fog === 1 ? 0.35 : 0.9);
        this.minimapGfx.fillRect(mx + c * tw, my + r * th, tw - 0.3, th - 0.3);
      }
    }

    // Cities (gold dots)
    this.mission.cities.forEach(city => {
      if (state.fogMap[city.tileY][city.tileX] > 0) {
        this.minimapGfx.fillStyle(0xffd060, 1);
        this.minimapGfx.fillCircle(mx + city.tileX * tw + tw / 2, my + city.tileY * th + th / 2, 2.5);
      }
    });

    // Enemies (red dots, only when visible)
    this.mission.enemies.forEach(enc => {
      if (!isEnemyDefeated(enc.id) && state.fogMap[enc.tileY][enc.tileX] === 2) {
        this.minimapGfx.fillStyle(0xff3333, 1);
        this.minimapGfx.fillCircle(mx + enc.tileX * tw + tw / 2, my + enc.tileY * th + th / 2, 2);
      }
    });

    // Hero (bright gold)
    this.minimapGfx.fillStyle(0xffffff, 1);
    this.minimapGfx.fillCircle(
      mx + state.heroTile.x * tw + tw / 2,
      my + state.heroTile.y * th + th / 2, 3,
    );

    // Border
    this.minimapGfx.lineStyle(1, 0xc8a040, 0.7);
    this.minimapGfx.strokeRect(mx, my, mw, mh);
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────

  private createSidebar(): void {
    const sx = MAP_W;
    const bg = this.add.graphics();
    bg.fillStyle(0x060610, 1); bg.lineStyle(1, 0x3a2810, 1);
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
    if (h.artifacts.length > 0)
      this.add.text(sx + 14, 120, `Artefakte: ${h.artifacts.length}`, { fontSize: '11px', color: '#c080ff' });

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

    this.divider(sx + 8, 428, SIDEBAR_WIDTH - 16);
    this.moveText = this.add.text(sx + 14, 442,
      `Bewegung: ${this.movementLeft} / ${movementPoints()}  |  Zug: ${this.turn}`, { fontSize: '12px', color: '#c0b090' });

    // Minimap label
    this.add.text(sx + SIDEBAR_WIDTH / 2, 460, '── KARTE ──', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#c8a040',
    }).setOrigin(0.5);

    // Mini-map is drawn by renderMinimap() at y=468

    this.add.text(sx + 14, GAME_HEIGHT - 90,
      'Klick = Bewegen  •  Rotes △ = Kampf\nGold = Ressource  •  Lila = Artefakt',
      { fontSize: '10px', color: '#604030', lineSpacing: 3 });

    const btnY = GAME_HEIGHT - 50;
    const btnG = this.add.graphics();
    btnG.fillStyle(0x2a1a08, 1); btnG.lineStyle(2, 0xc8a040, 1);
    btnG.fillRoundedRect(sx + 16, btnY, SIDEBAR_WIDTH - 32, 38, 6);
    btnG.strokeRoundedRect(sx + 16, btnY, SIDEBAR_WIDTH - 32, 38, 6);
    const btnTxt = this.add.text(sx + SIDEBAR_WIDTH / 2, btnY + 19, 'ZUG BEENDEN', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);
    const z = this.add.zone(sx + SIDEBAR_WIDTH / 2, btnY + 19, SIDEBAR_WIDTH - 32, 38).setInteractive({ cursor: 'pointer' });
    z.on('pointerdown', () => this.endTurn());
    z.on('pointerover', () => btnTxt.setColor('#ffffff'));
    z.on('pointerout',  () => btnTxt.setColor('#ffd060'));
  }

  private refreshArmyPanel(sx: number): void {
    this.armyRows.removeAll(true);
    let yo = 0;
    state.playerArmy.forEach(stack => {
      const rowBg = this.add.graphics();
      rowBg.fillStyle(stack.color, 0.15); rowBg.lineStyle(1, stack.color, 0.4);
      rowBg.fillRoundedRect(sx + 10, yo, SIDEBAR_WIDTH - 20, 40, 4);
      rowBg.strokeRoundedRect(sx + 10, yo, SIDEBAR_WIDTH - 20, 40, 4);
      this.armyRows.add(rowBg);
      this.armyRows.add([
        this.add.text(sx + 22, yo + 5,  `[${stack.symbol}] ${stack.name}`, { fontSize: '12px', color: '#e0d0a0' }),
        this.add.text(sx + 22, yo + 22, `×${stack.count}  HP ${stack.currentHp}/${stack.maxHp}`, { fontSize: '11px', color: '#a09070' }),
      ]);
      yo += 46;
    });
  }

  private divider(x: number, y: number, w: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0x4a3820, 0.6); g.lineBetween(x, y, x + w, y);
  }

  // ── Input ──────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.x >= MAP_W) return;
      const hex = pixelToHex(ptr.x, ptr.y);
      if (!hex) return;
      this.handleTileClick(hex[0], hex[1]);
    });
  }

  private handleTileClick(col: number, row: number): void {
    if (!this.reachableTiles.has(`${col},${row}`)) return;
    const cfg  = TILE_CONFIG[this.mission.mapTiles[row][col]];
    const cost = Math.max(1, Math.ceil(cfg.moveCost));
    if (this.movementLeft < cost) return;

    this.movementLeft -= cost;
    state.heroTile = { x: col, y: row };

    const { x: tx, y: ty } = hexCenter(col, row);
    this.tweens.add({
      targets: this.heroSprite, x: tx, y: ty, duration: 200, ease: 'Linear',
      onComplete: () => this.onHeroArrived(col, row),
    });

    // Update fog, sprites, minimap
    updateFog(col, row);
    this.renderFog();
    this.updateSpriteVisibility();
    this.renderMinimap();

    this.computeReachable();
    this.renderHighlights();
    this.moveText.setText(`Bewegung: ${this.movementLeft} / ${movementPoints()}  |  Zug: ${this.turn}`);

    saveGame();
  }

  private onHeroArrived(col: number, row: number): void {
    // Lore collection
    const lore = (this.mission.loreItems ?? []).find(l => l.tileX === col && l.tileY === row && !isLoreCollected(l.id));
    if (lore) {
      collectLore(lore.id);
      this.loreSprites.get(lore.id)?.destroy();
      this.loreSprites.delete(lore.id);
      const ev = STORY_EVENTS[lore.id];
      if (ev) { this.launchDialog(ev); return; }
    }

    // Resources
    const res = this.mission.resources.find(r => r.tileX === col && r.tileY === row && !isResourceCollected(r.id));
    if (res) this.collectResourceItem(res);

    const city = this.mission.cities.find(c => c.tileX === col && c.tileY === row);
    if (city) { this.openCity(city.id); return; }

    // Story triggers — gate final victory event on phase 1 for two-step missions
    const storyKey = `${col},${row}`;
    if (this.mission.storyTriggers[storyKey] && !isEventTriggered(this.mission.storyTriggers[storyKey])) {
      const evId = this.mission.storyTriggers[storyKey];
      const vc = this.mission.victoryCondition;
      const isFinalVictoryEvent = evId === this.mission.victoryEventId;
      const requiresPhase = vc.type === 'boss_then_reach' || vc.type === 'artifact_then_reach';
      if (isFinalVictoryEvent && requiresPhase && state.missionVictoryPhase < 1) {
        // Boss/artifact not yet completed — don't trigger the final event
        const enc = this.mission.enemies.find(e => e.tileX === col && e.tileY === row && !isEnemyDefeated(e.id));
        if (enc) this.startCombat(enc);
        return;
      }
      const ev = STORY_EVENTS[evId];
      if (ev) { triggerEvent(evId); this.launchDialog(ev); return; }
    }

    const enc = this.mission.enemies.find(e => e.tileX === col && e.tileY === row && !isEnemyDefeated(e.id));
    if (enc) this.startCombat(enc);
  }

  private collectResourceItem(res: ResourceOnMap): void {
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
      // Check victory artifact conditions
      const vc = this.mission.victoryCondition;
      if (vc.type === 'artifact' && vc.artifactId === res.artifactId) {
        // Mission victory: show victory event dialog
        const ev = STORY_EVENTS[this.mission.victoryEventId];
        if (ev) { triggerEvent(ev.id); this.time.delayedCall(600, () => this.launchDialog(ev)); }
      } else if (vc.type === 'artifact_then_reach' && vc.artifactId === res.artifactId && state.missionVictoryPhase < 1) {
        // Phase 1 unlocked: show transition dialog, then reach victoryTile
        setVictoryPhase(1);
        saveGame();
        this.updateObjectiveBanner();
        if (this.mission.phaseOneEventId) {
          const ev = STORY_EVENTS[this.mission.phaseOneEventId];
          if (ev) this.time.delayedCall(600, () => this.launchDialog(ev));
        }
      }
    }
  }

  private showFloat(msg: string, color: number, tileCol: number, tileRow: number): void {
    const { x, y } = hexCenter(tileCol, tileRow);
    const t = this.add.text(x, y - 8, msg, {
      fontSize: '14px', color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 1400, onComplete: () => t.destroy() });
  }

  private openCity(cityId: string): void {
    music.stop();
    this.scene.pause('AdventureMap');
    this.scene.launch('CityScene', { cityId, missionIdx: state.currentMissionIdx });
    this.scene.get('CityScene').events.once('shutdown', () => {
      this.refreshArmyPanel(MAP_W);
      this.goldText.setText(`⚙ Gold: ${state.gold}`);
      this.scene.resume('AdventureMap');
      music.play('map');
    });
  }

  private launchDialog(ev: { id: string; lines: { speaker: string; text: string }[]; onComplete?: string }): void {
    this.scene.pause('AdventureMap');
    this.scene.launch('DialogScene', { event: ev });
    this.scene.get('DialogScene').events.once('shutdown', () => {
      if (ev.onComplete === 'victory') {
        music.stop();
        this.scene.stop('AdventureMap');
        this.scene.start('VictoryScene');
      } else if (ev.onComplete === 'mission_complete') {
        music.stop();
        advanceMission();
        saveGame();
        this.scene.stop('AdventureMap');
        this.scene.start('CampaignScene');
      } else {
        this.scene.resume('AdventureMap');
      }
    });
  }

  private startCombat(encounter: EnemyEncounter): void {
    music.stop();
    this.scene.pause('AdventureMap');
    this.scene.launch('CombatScene', { encounter });
    this.scene.get('CombatScene').events.once('combat_end', (result: 'win' | 'lose') => {
      if (result === 'win') {
        encounter.defeated = true;
        this.enemySprites.get(encounter.id)?.destroy();
        this.enemySprites.delete(encounter.id);
        this.refreshArmyPanel(MAP_W);
        this.heroLvlText.setText(`Stufe ${state.hero.level}  ATK ${state.hero.attack}  DEF ${state.hero.defense}  WIS ${state.hero.knowledge}`);

        // Check if this was the boss for a boss_then_reach mission
        const vc = this.mission.victoryCondition;
        if ((vc.type === 'boss_then_reach') && vc.enemyId === encounter.id && state.missionVictoryPhase < 1) {
          setVictoryPhase(1);
          saveGame();
          this.updateObjectiveBanner();
          if (this.mission.phaseOneEventId) {
            const ev = STORY_EVENTS[this.mission.phaseOneEventId];
            if (ev) {
              this.time.delayedCall(300, () => {
                this.scene.resume('AdventureMap');
                music.play('map');
                this.launchDialog(ev);
              });
              return;
            }
          }
        }

        this.scene.resume('AdventureMap');
        music.play('map');
      } else {
        music.stop();
        this.scene.stop('CombatScene');
        this.scene.stop('AdventureMap');
        this.scene.start('GameOverScene');
      }
    });
  }

  // ── Hex movement ───────────────────────────────────────────────────────────

  private computeReachable(): void {
    this.reachableTiles.clear();
    const { x: sx, y: sy } = state.heroTile;
    const queue: [number, number, number][] = [[sx, sy, 0]];
    const visited = new Set<string>([`${sx},${sy}`]);
    while (queue.length > 0) {
      const [cx, cy, cost] = queue.shift()!;
      for (const [nx, ny] of hexNeighbors(cx, cy)) {
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        visited.add(key);
        const cfg = TILE_CONFIG[this.mission.mapTiles[ny][nx]];
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
      // Only show highlights in visible area
      if (state.fogMap[row]?.[col] !== 2) return;
      const { x, y } = hexCenter(col, row);
      const g = this.add.graphics();
      g.fillStyle(0x88ccff, 0.22);
      g.lineStyle(1.2, 0x4499ff, 0.7);
      g.fillPoints(hexPts(x, y, HEX_SIZE - 1), true);
      g.strokePoints(hexPts(x, y, HEX_SIZE - 1), true);
      this.highlightLayer.add(g);
    });
  }

  private endTurn(): void {
    this.turn++;
    this.movementLeft = movementPoints();
    this.computeReachable();
    this.renderHighlights();
    this.moveText.setText(`Bewegung: ${this.movementLeft} / ${movementPoints()}  |  Zug: ${this.turn}`);
    saveGame();
  }

  private triggerStartEvent(): void {
    const key = `${state.heroTile.x},${state.heroTile.y}`;
    if (this.mission.storyTriggers[key] && !isEventTriggered(this.mission.storyTriggers[key])) {
      const evId = this.mission.storyTriggers[key];
      const ev = STORY_EVENTS[evId];
      if (ev) { triggerEvent(evId); this.time.delayedCall(500, () => this.launchDialog(ev)); }
    }
  }
}
