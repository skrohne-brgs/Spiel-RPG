import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { state, applySkill, saveGame } from '../GameState';
import { SKILL_DEFS } from '../data/skills';
import { getHeroSkillTree, type SkillTreeNode } from '../data/skillTrees';

type NodeState = 'unlocked' | 'available' | 'prereq_met' | 'locked';

export class SkillTreeScene extends Phaser.Scene {
  private resumeScene = 'AdventureMap';

  constructor() { super({ key: 'SkillTreeScene' }); }

  init(data: { resumeScene?: string }): void {
    this.resumeScene = data.resumeScene ?? 'AdventureMap';
  }

  create(): void {
    const hero = state.hero;
    const tree = getHeroSkillTree(hero.id);

    // ── Background overlay ────────────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.82);

    // ── Panel ─────────────────────────────────────────────────────────────────
    const PW = 1100, PH = 640;
    const PX = (GAME_WIDTH - PW) / 2;
    const PY = (GAME_HEIGHT - PH) / 2;

    const panelG = this.add.graphics();
    panelG.fillStyle(0x08060f, 1);
    panelG.lineStyle(2, 0xc8a040, 1);
    panelG.fillRoundedRect(PX, PY, PW, PH, 12);
    panelG.strokeRoundedRect(PX, PY, PW, PH, 12);

    // ── Header ────────────────────────────────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, PY + 22, `SKILLTREE – ${hero.name}`, {
      fontSize: '24px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5);

    const ptColor = hero.skillPoints > 0 ? '#60ff80' : '#806040';
    this.add.text(GAME_WIDTH / 2, PY + 52, `Verfügbare Punkte: ${hero.skillPoints}`, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: ptColor,
    }).setOrigin(0.5);

    // ── Divider ───────────────────────────────────────────────────────────────
    this.add.graphics().lineStyle(1, 0x3a2810, 0.8).lineBetween(PX + 16, PY + 72, PX + PW - 16, PY + 72);

    // ── Close button ─────────────────────────────────────────────────────────
    const closeTxt = this.add.text(PX + PW - 18, PY + 12, '✕', {
      fontSize: '22px', color: '#806040',
    }).setOrigin(1, 0).setInteractive({ cursor: 'pointer' });
    closeTxt.on('pointerover', () => closeTxt.setColor('#ffd060'));
    closeTxt.on('pointerout',  () => closeTxt.setColor('#806040'));
    closeTxt.on('pointerdown', () => this.close());
    this.input.keyboard?.once('keydown-ESC', () => this.close());
    this.input.keyboard?.once('keydown-SPACE', () => this.close());

    if (!tree) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Kein Skilltree für diesen Helden.', {
        fontSize: '18px', color: '#806040',
      }).setOrigin(0.5);
      return;
    }

    // ── Grid layout parameters ────────────────────────────────────────────────
    const NODE_W   = 80;
    const NODE_H   = 60;
    const COLS     = 5;
    const COL_GAP  = 180;   // horizontal spacing between column centers
    const TIER_GAP = 130;   // vertical spacing between tier rows
    const GRID_W   = (COLS - 1) * COL_GAP;
    const GRID_X   = PX + (PW - GRID_W) / 2;  // left edge of col 0 center
    const GRID_Y   = PY + 100;                 // top of tier 0

    // Helper: pixel position of node center
    const nodePos = (n: SkillTreeNode) => ({
      x: GRID_X + n.col * COL_GAP,
      y: GRID_Y + n.tier * TIER_GAP,
    });

    // Helper: compute node state
    const getNodeState = (node: SkillTreeNode): NodeState => {
      const currentLevel = hero.skills[node.skillId] ?? 0;
      if (currentLevel >= node.toLevel) return 'unlocked';
      // Check prereqs
      const prereqsMet = node.requires.every(reqId => {
        const reqNode = tree.nodes.find(n => n.nodeId === reqId);
        if (!reqNode) return true;
        return (hero.skills[reqNode.skillId] ?? 0) >= reqNode.toLevel;
      });
      if (!prereqsMet) return 'locked';
      if (hero.skillPoints > 0) return 'available';
      return 'prereq_met';
    };

    // ── Draw connector lines first (underneath nodes) ─────────────────────────
    const lineG = this.add.graphics();
    tree.nodes.forEach(node => {
      const toPos = nodePos(node);
      node.requires.forEach(reqId => {
        const reqNode = tree.nodes.find(n => n.nodeId === reqId);
        if (!reqNode) return;
        const fromPos = nodePos(reqNode);
        const ns = getNodeState(node);
        const lineColor = ns === 'unlocked' ? 0xc8a040 :
                          ns === 'available' ? 0x40a060 :
                          ns === 'prereq_met' ? 0x304870 : 0x2a2a2a;
        lineG.lineStyle(2, lineColor, 0.7);
        lineG.lineBetween(fromPos.x, fromPos.y, toPos.x, toPos.y);
      });
    });

    // ── Draw nodes ────────────────────────────────────────────────────────────
    tree.nodes.forEach(node => {
      const { x, y } = nodePos(node);
      const ns = getNodeState(node);
      const def = SKILL_DEFS[node.skillId];

      // Node background
      const nodeG = this.add.graphics();
      let fillColor: number;
      let strokeColor: number;
      let strokeAlpha: number;
      switch (ns) {
        case 'unlocked':
          fillColor = 0x2a1e00; strokeColor = 0xc8a040; strokeAlpha = 1; break;
        case 'available':
          fillColor = 0x0a2010; strokeColor = 0x40c060; strokeAlpha = 1; break;
        case 'prereq_met':
          fillColor = 0x0a1020; strokeColor = 0x304870; strokeAlpha = 0.9; break;
        default: // locked
          fillColor = 0x141414; strokeColor = 0x303030; strokeAlpha = 0.6; break;
      }
      nodeG.fillStyle(fillColor, 1);
      nodeG.lineStyle(2, strokeColor, strokeAlpha);
      nodeG.fillRoundedRect(x - NODE_W / 2, y - NODE_H / 2, NODE_W, NODE_H, 6);
      nodeG.strokeRoundedRect(x - NODE_W / 2, y - NODE_H / 2, NODE_W, NODE_H, 6);

      // Pulse tween for available nodes
      if (ns === 'available') {
        this.tweens.add({
          targets: nodeG,
          alpha: { from: 0.7, to: 1 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      // Skill symbol / icon
      const symbol = def?.name?.charAt(0) ?? '?';
      const textColor = ns === 'unlocked' ? '#ffd060' :
                        ns === 'available' ? '#60ff80' :
                        ns === 'prereq_met' ? '#4060a0' : '#404040';
      this.add.text(x, y - 14, symbol, {
        fontSize: '20px', fontFamily: 'Georgia, serif', color: textColor,
      }).setOrigin(0.5);

      // Skill name
      const skillName = def?.name ?? node.skillId;
      this.add.text(x, y + 4, skillName.length > 10 ? skillName.slice(0, 9) + '…' : skillName, {
        fontSize: '9px', color: textColor,
      }).setOrigin(0.5);

      // Level indicator
      this.add.text(x, y + 18, `Lv${node.toLevel}`, {
        fontSize: '9px', color: ns === 'locked' ? '#303030' : '#a09060',
      }).setOrigin(0.5);

      // Click zone for available nodes
      if (ns === 'available') {
        const zone = this.add.zone(x, y, NODE_W, NODE_H).setInteractive({ cursor: 'pointer' });
        zone.on('pointerover', () => {
          nodeG.clear();
          nodeG.fillStyle(0x1a4028, 1);
          nodeG.lineStyle(3, 0x80ff80, 1);
          nodeG.fillRoundedRect(x - NODE_W / 2, y - NODE_H / 2, NODE_W, NODE_H, 6);
          nodeG.strokeRoundedRect(x - NODE_W / 2, y - NODE_H / 2, NODE_W, NODE_H, 6);
          this.showTooltip(x, y - NODE_H / 2 - 10, node);
        });
        zone.on('pointerout', () => {
          nodeG.clear();
          nodeG.fillStyle(0x0a2010, 1);
          nodeG.lineStyle(2, 0x40c060, 1);
          nodeG.fillRoundedRect(x - NODE_W / 2, y - NODE_H / 2, NODE_W, NODE_H, 6);
          nodeG.strokeRoundedRect(x - NODE_W / 2, y - NODE_H / 2, NODE_W, NODE_H, 6);
          this.hideTooltip();
        });
        zone.on('pointerdown', () => this.spendPoint(node));
      } else if (ns !== 'locked') {
        // Hoverable for tooltip even if not clickable
        const zone = this.add.zone(x, y, NODE_W, NODE_H).setInteractive({ cursor: 'default' });
        zone.on('pointerover', () => this.showTooltip(x, y - NODE_H / 2 - 10, node));
        zone.on('pointerout',  () => this.hideTooltip());
      }
    });

    // ── Reminder if points left ───────────────────────────────────────────────
    if (hero.skillPoints > 0) {
      this.add.text(GAME_WIDTH / 2, PY + PH - 22,
        `Du hast noch ${hero.skillPoints} Punkt${hero.skillPoints > 1 ? 'e' : ''}! Wähle eine Fähigkeit oder schließe mit [ESC].`, {
        fontSize: '11px', color: '#60c060',
      }).setOrigin(0.5);
    } else {
      this.add.text(GAME_WIDTH / 2, PY + PH - 22, '[ESC] oder [SPACE] schließen', {
        fontSize: '11px', color: '#3a2810',
      }).setOrigin(0.5);
    }
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────
  private tooltipContainer?: Phaser.GameObjects.Container;

  private showTooltip(x: number, y: number, node: SkillTreeNode): void {
    this.hideTooltip();
    const def = SKILL_DEFS[node.skillId];
    if (!def) return;
    const desc = def.description(node.toLevel);
    const tw = 200, th = 56;
    // Keep tooltip inside panel
    const cx = Math.min(Math.max(x, tw / 2 + 10), GAME_WIDTH - tw / 2 - 10);
    const cy = y - th / 2 - 4;

    const bg = this.add.graphics();
    bg.fillStyle(0x0d0a1a, 0.97);
    bg.lineStyle(1, 0xc8a040, 0.8);
    bg.fillRoundedRect(-tw / 2, -th / 2, tw, th, 6);
    bg.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 6);

    const title = this.add.text(0, -th / 2 + 8, def.name, {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#ffd060',
    }).setOrigin(0.5, 0);

    const body = this.add.text(0, -th / 2 + 24, desc, {
      fontSize: '9px', color: '#c0b090', wordWrap: { width: tw - 16 }, lineSpacing: 2,
    }).setOrigin(0.5, 0);

    this.tooltipContainer = this.add.container(cx, cy, [bg, title, body]);
    this.tooltipContainer.setDepth(100);
  }

  private hideTooltip(): void {
    this.tooltipContainer?.destroy();
    this.tooltipContainer = undefined;
  }

  // ── Spend a skill point ───────────────────────────────────────────────────
  private spendPoint(node: SkillTreeNode): void {
    if (state.hero.skillPoints <= 0) return;
    applySkill(node.skillId);
    state.hero.skillPoints--;
    saveGame();
    // Restart scene to re-render updated state
    this.scene.restart({ resumeScene: this.resumeScene });
  }

  // ── Close ────────────────────────────────────────────────────────────────
  private close(): void {
    this.events.emit('skilltree_close');
    this.scene.stop();
  }
}
