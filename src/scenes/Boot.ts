import Phaser from 'phaser';
import { COMBAT_CELL_W, COMBAT_CELL_H } from '../constants';

export class Boot extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create(): void {
    this.generateTileTextures();
    this.generateUnitTextures();
    this.generateHeroTexture();
    this.generateEnemyMarkerTexture();
    this.generateResourceTextures();
    this.scene.start('HeroSelectScene');
  }

  // ── Canvas helper ──────────────────────────────────────────────────────────

  private tile(key: string, draw: (c: CanvasRenderingContext2D) => void): void {
    const tex = this.textures.createCanvas(key, 48, 48)!;
    const c = tex.context as unknown as CanvasRenderingContext2D;
    draw(c);
    tex.refresh();
  }

  /** Seeded pseudo-random – same key always → same value */
  private rng(x: number, y: number, seed = 0): number {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453123;
    return s - Math.floor(s);
  }

  private lg(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]): CanvasGradient {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([t, col]) => g.addColorStop(t, col));
    return g;
  }

  private rg(c: CanvasRenderingContext2D, x: number, y: number, r0: number, r1: number, stops: [number, string][]): CanvasGradient {
    const g = c.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([t, col]) => g.addColorStop(t, col));
    return g;
  }

  // ── Tile textures ──────────────────────────────────────────────────────────

  private generateTileTextures(): void {
    this.drawGrass();
    this.drawMountain();
    this.drawForest();
    this.drawWater();
    this.drawRuins();
    this.drawRoad();
    this.drawWasteland();
    this.drawTown();
  }

  private drawGrass(): void {
    this.tile('tile_0', c => {
      // Base gradient: bright top, darker base (sunlight from above)
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#5fa832'],[0.5,'#4a9028'],[1,'#3a7820']]);
      c.fillRect(0, 0, 48, 48);

      // Subtle soil patches
      for (let i = 0; i < 6; i++) {
        const px = this.rng(i, 0) * 42 + 3;
        const py = this.rng(i, 1) * 42 + 3;
        const r = this.rng(i, 2) * 5 + 3;
        c.fillStyle = `rgba(40,80,10,${this.rng(i,3)*0.18+0.06})`;
        c.beginPath(); c.ellipse(px, py, r, r * 0.6, 0, 0, Math.PI * 2); c.fill();
      }

      // Grass tufts – clusters of bezier blades
      const tufts: [number, number][] = [[7,36],[18,14],[32,40],[42,22],[14,28],[38,8],[24,44]];
      tufts.forEach(([bx, by], ti) => {
        for (let b = -2; b <= 2; b++) {
          const lean = (this.rng(ti, b + 10) - 0.5) * 6;
          const h = 6 + this.rng(ti, b + 20) * 5;
          const shade = this.rng(ti, b + 30) > 0.5 ? '#5ab828' : '#3a8010';
          c.strokeStyle = shade; c.lineWidth = 1.2;
          c.beginPath();
          c.moveTo(bx + b * 2.5, by);
          c.quadraticCurveTo(bx + b * 2.5 + lean, by - h * 0.6, bx + b * 2.5 + lean * 1.5, by - h);
          c.stroke();
        }
      });

      // Tiny wildflowers
      [[11,20,'#fff176'],[34,32,'#ffffff'],[44,14,'#ffcc60']].forEach(([fx, fy, fc]) => {
        c.fillStyle = fc as string;
        c.beginPath(); c.arc(fx as number, fy as number, 1.8, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffff00';
        c.beginPath(); c.arc(fx as number, fy as number, 0.8, 0, Math.PI * 2); c.fill();
      });

      // Light edge vignette
      c.fillStyle = 'rgba(0,0,0,0.10)';
      c.fillRect(0, 0, 48, 2); c.fillRect(0, 46, 48, 2);
      c.fillRect(0, 0, 2, 48); c.fillRect(46, 0, 2, 48);
    });
  }

  private drawMountain(): void {
    this.tile('tile_1', c => {
      // Rocky earth base
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#5a4a38'],[1,'#3a2c20']]);
      c.fillRect(0, 0, 48, 48);

      // Scree / rubble at base
      for (let i = 0; i < 10; i++) {
        const rx = this.rng(i, 0, 5) * 44 + 2;
        const ry = 34 + this.rng(i, 1, 5) * 12;
        const rw = this.rng(i, 2, 5) * 5 + 2;
        c.fillStyle = `rgba(${80+Math.round(this.rng(i,3,5)*40)},${70+Math.round(this.rng(i,4,5)*30)},${60+Math.round(this.rng(i,5,5)*20)},0.8)`;
        c.fillRect(rx, ry, rw, rw * 0.6);
      }

      // Main mountain body
      c.fillStyle = this.lg(c, 0, 6, 48, 44, [[0,'#7a6a58'],[0.4,'#6a5a48'],[1,'#4a3c2c']]);
      c.beginPath();
      c.moveTo(4, 44); c.lineTo(16, 14); c.lineTo(24, 6); c.lineTo(32, 18); c.lineTo(44, 44);
      c.closePath(); c.fill();

      // Right-side shadow
      c.fillStyle = 'rgba(20,10,0,0.45)';
      c.beginPath();
      c.moveTo(24, 6); c.lineTo(32, 18); c.lineTo(44, 44); c.lineTo(36, 44);
      c.closePath(); c.fill();

      // Rocky texture lines on mountain face
      c.strokeStyle = 'rgba(50,40,30,0.5)'; c.lineWidth = 0.8;
      [[10,36,20,20],[14,40,26,28],[28,38,36,26]].forEach(([x1,y1,x2,y2]) => {
        c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      });

      // Snow cap
      c.fillStyle = this.lg(c, 18, 4, 30, 20, [[0,'#f0f4ff'],[1,'#c8d8f0']]);
      c.beginPath();
      c.moveTo(24, 5); c.lineTo(19, 17); c.lineTo(29, 17);
      c.closePath(); c.fill();
      // Snow highlight
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath(); c.ellipse(22, 10, 3, 2, -0.4, 0, Math.PI * 2); c.fill();

      // Peak highlight
      c.fillStyle = 'rgba(255,255,255,0.15)';
      c.beginPath();
      c.moveTo(4,44); c.lineTo(16,14); c.lineTo(22,16); c.lineTo(12,44);
      c.closePath(); c.fill();
    });
  }

  private drawForest(): void {
    this.tile('tile_2', c => {
      // Dark forest floor
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#1e3c0e'],[1,'#142808']]);
      c.fillRect(0, 0, 48, 48);

      // Forest floor litter: small leaf/twig marks
      c.strokeStyle = 'rgba(40,80,10,0.5)'; c.lineWidth = 0.7;
      for (let i = 0; i < 8; i++) {
        const lx = this.rng(i, 0, 7) * 46;
        const ly = 28 + this.rng(i, 1, 7) * 18;
        c.beginPath();
        c.moveTo(lx, ly);
        c.lineTo(lx + (this.rng(i,2,7)-0.5)*8, ly + (this.rng(i,3,7)-0.5)*4);
        c.stroke();
      }

      // Trees (3, overlapping, back to front)
      const trees: [number, number, number, string, string][] = [
        [38, 42, 12, '#1a4a0a', '#2a6010'],
        [10, 44, 14, '#163808', '#225010'],
        [26, 46, 16, '#1e4c0c', '#2e6818'],
      ];
      trees.forEach(([tx, ty, tr, dark, light]) => {
        // Trunk
        c.fillStyle = '#3a2010';
        c.fillRect(tx - 2, ty - 10, 4, 10);

        // Layered crown (3 circles, bottom to top)
        [[0, 0, tr, dark], [-4, -tr*0.5, tr*0.8, dark], [4, -tr*0.4, tr*0.75, dark],
         [0, -tr*0.8, tr*0.7, light]].forEach(([ox, oy, r, col]) => {
          c.fillStyle = col as string;
          c.beginPath();
          c.arc(tx + (ox as number), ty - tr * 0.3 + (oy as number), r as number, 0, Math.PI * 2);
          c.fill();
        });

        // Sunlight spot on crown top
        c.fillStyle = 'rgba(120,200,40,0.3)';
        c.beginPath(); c.ellipse(tx - 3, ty - tr * 0.9, tr * 0.35, tr * 0.25, -0.5, 0, Math.PI * 2); c.fill();
      });

      // Dark edge vignette to feel enclosed
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.fillRect(0, 0, 48, 3); c.fillRect(0, 45, 48, 3);
      c.fillRect(0, 0, 3, 48); c.fillRect(45, 0, 3, 48);
    });
  }

  private drawWater(): void {
    this.tile('tile_3', c => {
      // Deep water gradient (darker at bottom = depth)
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#1a6a9a'],[0.5,'#145880'],[1,'#0c3f60']]);
      c.fillRect(0, 0, 48, 48);

      // Depth shading – radial darker centre
      c.fillStyle = this.rg(c, 24, 30, 0, 28, [[0,'rgba(0,20,50,0.35)'],[1,'transparent']]);
      c.fillRect(0, 0, 48, 48);

      // Wave lines (sinusoidal arcs)
      const waveY = [8, 18, 28, 38];
      waveY.forEach((wy, wi) => {
        c.strokeStyle = `rgba(${80+wi*15},${160+wi*12},${210+wi*10},${0.55 - wi*0.05})`;
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(0, wy);
        for (let x = 0; x <= 48; x += 4) {
          const y = wy + Math.sin((x / 48) * Math.PI * 2.5 + wi * 0.8) * 2.5;
          c.lineTo(x, y);
        }
        c.stroke();

        // Foam dots at wave crests
        for (let x = 4; x < 48; x += 10 + wi * 2) {
          const crY = wy + Math.sin((x / 48) * Math.PI * 2.5 + wi * 0.8) * 2.5;
          if (this.rng(x, wy, wi) > 0.6) {
            c.fillStyle = 'rgba(255,255,255,0.55)';
            c.beginPath(); c.ellipse(x, crY, 2, 1, 0, 0, Math.PI * 2); c.fill();
          }
        }
      });

      // Specular highlights
      [[8,6],[36,14],[20,32],[44,40]].forEach(([sx,sy], si) => {
        c.fillStyle = `rgba(255,255,255,${0.5 + this.rng(si,si,9)*0.3})`;
        c.beginPath(); c.ellipse(sx, sy, 3, 1.2, -0.3, 0, Math.PI * 2); c.fill();
      });
    });
  }

  private drawRuins(): void {
    this.tile('tile_4', c => {
      // Dark ash/earth base
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#3a3028'],[1,'#282018']]);
      c.fillRect(0, 0, 48, 48);

      // Cracked stone floor
      const stones: [number, number, number, number][] = [
        [1,30,14,14],[15,28,12,16],[27,32,18,12],[1,14,10,14],[11,16,16,12],[27,14,18,16]
      ];
      stones.forEach(([sx,sy,sw,sh], si) => {
        const shade = 60 + this.rng(si, 0, 1) * 20;
        c.fillStyle = `rgb(${shade},${shade-5},${shade-10})`;
        c.fillRect(sx, sy, sw, sh);
        // Crack lines
        c.strokeStyle = 'rgba(10,8,5,0.7)'; c.lineWidth = 0.8;
        c.strokeRect(sx, sy, sw, sh);
        if (this.rng(si, 1, 1) > 0.4) {
          c.beginPath();
          c.moveTo(sx + sw * 0.3, sy);
          c.lineTo(sx + sw * 0.45, sy + sh * 0.6);
          c.lineTo(sx + sw * 0.7, sy + sh);
          c.stroke();
        }
      });

      // Broken column (left side)
      c.fillStyle = this.lg(c, 4, 0, 12, 0, [[0,'#787060'],[0.5,'#888078'],[1,'#585048']]);
      c.fillRect(4, 2, 8, 26);
      // Column capital (broken)
      c.fillStyle = '#6a6058';
      c.fillRect(2, 2, 12, 4);
      // Fallen column piece
      c.fillStyle = '#6a6058';
      c.save(); c.translate(20, 36); c.rotate(-0.5);
      c.fillRect(0, 0, 18, 6); c.restore();
      // Column shadow
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.fillRect(10, 4, 4, 24);

      // Moss / grass in cracks
      c.fillStyle = '#3a6a18';
      [[8,26],[22,34],[36,20],[14,44]].forEach(([mx,my]) => {
        if (this.rng(mx, my, 3) > 0.4) {
          c.beginPath(); c.ellipse(mx, my, 2.5, 1.5, 0, 0, Math.PI * 2); c.fill();
        }
      });

      // Rubble pile (right)
      for (let i = 0; i < 6; i++) {
        const rx = 28 + this.rng(i,0,4) * 16;
        const ry = 4 + this.rng(i,1,4) * 24;
        const rr = this.rng(i,2,4) * 4 + 2;
        c.fillStyle = `rgba(${70+i*5},${65+i*4},${55+i*3},0.9)`;
        c.beginPath(); c.ellipse(rx, ry, rr, rr*0.7, this.rng(i,3,4)*Math.PI, 0, Math.PI*2); c.fill();
      }
    });
  }

  private drawRoad(): void {
    this.tile('tile_5', c => {
      // Earthen base
      c.fillStyle = this.lg(c, 0, 0, 48, 0, [[0,'#6a5030'],[0.5,'#8a7050'],[1,'#7a6040']]);
      c.fillRect(0, 0, 48, 48);

      // Road surface (lighter packed dirt center)
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#a08060'],[0.4,'#987858'],[1,'#886848']]);
      c.fillRect(8, 0, 32, 48);

      // Worn center stripe
      c.fillStyle = 'rgba(180,150,100,0.25)';
      c.fillRect(16, 0, 16, 48);

      // Wheel ruts
      c.strokeStyle = '#5a4020'; c.lineWidth = 2.5;
      [12, 34].forEach(rx => {
        c.beginPath();
        for (let y = 0; y <= 48; y += 4) {
          const x = rx + Math.sin(y * 0.3) * 1.2;
          y === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      });

      // Road-edge grass fringe
      c.fillStyle = '#3a6818';
      for (let i = 0; i < 7; i++) {
        const gy = this.rng(i, 0, 6) * 44;
        // Left edge tufts
        c.fillRect(6, gy, 2, 4);
        c.fillRect(5, gy + 1, 1, 3);
        // Right edge tufts
        c.fillRect(40, gy + 4, 2, 4);
      }

      // Scattered pebbles
      for (let i = 0; i < 8; i++) {
        const px = 10 + this.rng(i, 0, 8) * 28;
        const py = this.rng(i, 1, 8) * 46;
        const pr = this.rng(i, 2, 8) * 1.8 + 0.8;
        c.fillStyle = `rgba(${60+Math.round(this.rng(i,3,8)*40)},${55+Math.round(this.rng(i,4,8)*30)},${45},0.8)`;
        c.beginPath(); c.ellipse(px, py, pr, pr * 0.7, this.rng(i,5,8)*Math.PI, 0, Math.PI*2); c.fill();
      }

      // Edge shadows
      c.fillStyle = 'rgba(0,0,0,0.2)';
      c.fillRect(8, 0, 3, 48); c.fillRect(37, 0, 3, 48);
    });
  }

  private drawWasteland(): void {
    this.tile('tile_6', c => {
      // Scorched, cracked earth
      c.fillStyle = this.lg(c, 0, 0, 48, 48, [[0,'#7a5018'],[0.5,'#6a4010'],[1,'#4a2c08']]);
      c.fillRect(0, 0, 48, 48);

      // Ash patches
      [[6,8,8],[22,30,10],[40,16,7],[14,42,6]].forEach(([ax,ay,ar]) => {
        c.fillStyle = 'rgba(30,25,20,0.55)';
        c.beginPath(); c.ellipse(ax,ay,ar,ar*0.6,0,0,Math.PI*2); c.fill();
      });

      // Cracked earth pattern
      c.strokeStyle = 'rgba(30,18,5,0.75)'; c.lineWidth = 1;
      const cracks: [number, number][][] = [
        [[4,10],[14,22],[8,34]],
        [[14,22],[28,18],[36,30]],
        [[28,18],[40,8],[44,20]],
        [[8,34],[18,42],[30,38],[44,44]],
        [[36,30],[42,40]],
        [[20,4],[28,18]],
      ];
      cracks.forEach(pts => {
        c.beginPath();
        pts.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y));
        c.stroke();
      });
      // Crack width shadows
      c.strokeStyle = 'rgba(15,8,0,0.4)'; c.lineWidth = 2.5;
      cracks.slice(0,4).forEach(pts => {
        c.beginPath();
        pts.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y));
        c.stroke();
      });

      // Dead vegetation
      c.strokeStyle = '#4a3820'; c.lineWidth = 1;
      // Dead shrub
      c.beginPath(); c.moveTo(32,44); c.lineTo(32,30);
      c.lineTo(26,22); c.moveTo(32,30); c.lineTo(38,24);
      c.moveTo(32,36); c.lineTo(27,32); c.stroke();
      // Bare twig
      c.beginPath(); c.moveTo(10,46); c.lineTo(12,38); c.lineTo(9,32); c.stroke();

      // Dust/sand surface noise – subtle lighter patches
      c.fillStyle = 'rgba(150,110,60,0.15)';
      for (let i = 0; i < 5; i++) {
        const nx = this.rng(i,0,9)*42, ny = this.rng(i,1,9)*42;
        c.beginPath(); c.ellipse(nx,ny,5,3,this.rng(i,2,9)*Math.PI,0,Math.PI*2); c.fill();
      }

      // Hot edge glow (darker at bottom)
      c.fillStyle = 'rgba(0,0,0,0.25)';
      c.fillRect(0, 40, 48, 8);
    });
  }

  private drawTown(): void {
    this.tile('tile_7', c => {
      // Stone floor
      c.fillStyle = this.lg(c, 0, 0, 0, 48, [[0,'#484860'],[1,'#30303e']]);
      c.fillRect(0, 0, 48, 48);

      // Stone floor tiles
      c.strokeStyle = 'rgba(80,80,100,0.4)'; c.lineWidth = 0.5;
      for (let x = 0; x < 48; x += 10) c.strokeRect(x, 28, 10, 10);
      for (let x = 5; x < 48; x += 10) c.strokeRect(x, 38, 10, 10);

      // Outer wall
      c.fillStyle = this.lg(c, 0, 8, 48, 8, [[0,'#585870'],[0.5,'#686880'],[1,'#484858']]);
      c.fillRect(2, 8, 44, 34);
      // Wall shadow
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.fillRect(34, 8, 12, 34);

      // Battlements (top)
      c.fillStyle = '#585870';
      [2,10,18,26,34,42].forEach(bx => c.fillRect(bx, 2, 6, 8));
      c.fillStyle = 'rgba(0,0,0,0.4)';
      [6,14,22,30,38].forEach(bx => c.fillRect(bx, 2, 4, 8));

      // Central tower
      c.fillStyle = this.lg(c, 14, 0, 34, 0, [[0,'#686878'],[1,'#484858']]);
      c.fillRect(16, 0, 16, 36);
      // Tower battlements
      c.fillStyle = '#585868';
      [16,22,28].forEach(bx => c.fillRect(bx, 0, 4, 6));
      // Tower shadow
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.fillRect(28, 0, 4, 36);

      // Gate arch
      c.fillStyle = '#1a1828';
      c.beginPath();
      c.moveTo(18, 48); c.lineTo(18, 32);
      c.quadraticCurveTo(24, 26, 30, 32);
      c.lineTo(30, 48); c.closePath(); c.fill();
      // Gate door
      c.fillStyle = '#2a2018';
      c.fillRect(19, 36, 10, 12);
      // Portcullis bars
      c.strokeStyle = '#4a3820'; c.lineWidth = 1;
      for (let gx = 20; gx < 30; gx += 3) {
        c.beginPath(); c.moveTo(gx, 36); c.lineTo(gx, 48); c.stroke();
      }

      // Tower windows
      c.fillStyle = '#c8a840';
      c.beginPath(); c.ellipse(24, 12, 2.5, 3.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,200,80,0.35)';
      c.beginPath(); c.ellipse(24, 12, 2.5, 3.5, 0, 0, Math.PI * 2); c.fill();

      // Side windows
      [[8,18],[40,22]].forEach(([wx,wy]) => {
        c.fillStyle = '#202030';
        c.fillRect(wx-2, wy-3, 4, 5);
        c.fillStyle = 'rgba(200,160,60,0.2)';
        c.fillRect(wx-2, wy-3, 4, 5);
      });

      // Flag on tower
      c.strokeStyle = '#6a4010'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(24, 0); c.lineTo(24, -4); c.stroke();
      c.fillStyle = '#cc2222';
      c.beginPath(); c.moveTo(24,-4); c.lineTo(32,-1); c.lineTo(24,2); c.fill();
    });
  }

  // ── Unit / Hero / Enemy textures (unchanged) ───────────────────────────────

  private generateUnitTextures(): void {
    const colors: Record<string, number> = {
      numenorean_warrior: 0x4a78c0, numenorean_archer: 0x3aa060,
      dunedain_ranger: 0x5a8040, elven_warrior: 0xc0c040, elven_cavalry: 0xe0d060,
      orc_soldier: 0x6a3010, orc_archer: 0x804010, orc_warg_rider: 0x8a4018,
      troll: 0x505850, nazgul: 0x2a1a3a,
    };
    Object.entries(colors).forEach(([id, color]) => {
      const tex = this.textures.createCanvas(`unit_${id}`, COMBAT_CELL_W - 8, COMBAT_CELL_H - 14)!;
      const ctx = tex.context as unknown as CanvasRenderingContext2D;
      const w = COMBAT_CELL_W - 8, h = COMBAT_CELL_H - 14;
      const r = ((color >> 16) & 0xff), g = ((color >> 8) & 0xff), b = (color & 0xff);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`);
      grad.addColorStop(1, `rgb(${Math.max(0,r-20)},${Math.max(0,g-20)},${Math.max(0,b-20)})`);
      ctx.fillStyle = grad;
      this.roundRect(ctx, 2, 2, w-4, h-4, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, 2, 2, w-4, h-4, 6);
      ctx.stroke();
      tex.refresh();
    });
  }

  private generateHeroTexture(): void {
    const tex = this.textures.createCanvas('hero', 40, 40)!;
    const c = tex.context as unknown as CanvasRenderingContext2D;
    const grad = c.createRadialGradient(20, 18, 0, 20, 20, 16);
    grad.addColorStop(0, '#fff0a0');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(1, '#c89000');
    c.fillStyle = grad;
    c.beginPath(); c.arc(20, 20, 15, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#8b6914'; c.lineWidth = 2;
    c.beginPath(); c.arc(20, 20, 15, 0, Math.PI*2); c.stroke();
    // Inner ring
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1;
    c.beginPath(); c.arc(20, 20, 9, 0, Math.PI*2); c.stroke();
    // Center gem
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(20, 20, 4, 0, Math.PI*2); c.fill();
    c.fillStyle = '#ffd700';
    c.beginPath(); c.arc(20, 20, 2, 0, Math.PI*2); c.fill();
    tex.refresh();
  }

  private generateEnemyMarkerTexture(): void {
    const tex = this.textures.createCanvas('enemy_marker', 40, 40)!;
    const c = tex.context as unknown as CanvasRenderingContext2D;
    const grad = c.createLinearGradient(20, 2, 20, 38);
    grad.addColorStop(0, '#ff4444');
    grad.addColorStop(1, '#880000');
    c.fillStyle = grad;
    c.beginPath(); c.moveTo(20,2); c.lineTo(38,37); c.lineTo(2,37); c.closePath(); c.fill();
    c.strokeStyle = '#ff8888'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(20,2); c.lineTo(38,37); c.lineTo(2,37); c.closePath(); c.stroke();
    // Skull icon
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath(); c.arc(20, 22, 6, 0, Math.PI*2); c.fill();
    c.fillStyle = '#880000';
    c.beginPath(); c.ellipse(17.5, 22, 2, 2.5, 0, 0, Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(22.5, 22, 2, 2.5, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(17, 27, 6, 3);
    c.fillStyle = '#880000';
    c.fillRect(18, 27, 1.5, 3); c.fillRect(20.5, 27, 1.5, 3);
    tex.refresh();
  }

  private generateResourceTextures(): void {
    // Gold pile
    const gtex = this.textures.createCanvas('resource_gold', 32, 32)!;
    const gc = gtex.context as unknown as CanvasRenderingContext2D;
    [[18,20,9],[12,20,8],[24,18,7],[10,16,6],[22,24,5]].forEach(([cx,cy,r], i) => {
      const g = gc.createRadialGradient(cx-2,cy-2,0,cx,cy,r);
      g.addColorStop(0,'#fff0a0'); g.addColorStop(0.5,'#ffd700'); g.addColorStop(1,'#b08800');
      gc.fillStyle = g;
      gc.beginPath(); gc.arc(cx,cy,r,0,Math.PI*2); gc.fill();
      gc.strokeStyle = '#8b6000'; gc.lineWidth = 0.8;
      gc.beginPath(); gc.arc(cx,cy,r,0,Math.PI*2); gc.stroke();
    });
    gtex.refresh();

    // Artifact diamond
    const atex = this.textures.createCanvas('resource_artifact', 32, 32)!;
    const ac = atex.context as unknown as CanvasRenderingContext2D;
    const ag = ac.createRadialGradient(16,16,0,16,16,14);
    ag.addColorStop(0,'rgba(200,120,255,0.4)'); ag.addColorStop(1,'rgba(100,0,200,0)');
    ac.fillStyle = ag; ac.beginPath(); ac.arc(16,16,14,0,Math.PI*2); ac.fill();
    // Diamond shape
    const dg = ac.createLinearGradient(8,2,24,30);
    dg.addColorStop(0,'#e0a0ff'); dg.addColorStop(0.4,'#c060ff'); dg.addColorStop(1,'#6000c0');
    ac.fillStyle = dg;
    ac.beginPath(); ac.moveTo(16,2); ac.lineTo(26,14); ac.lineTo(16,30); ac.lineTo(6,14); ac.closePath(); ac.fill();
    ac.strokeStyle = 'rgba(255,255,255,0.8)'; ac.lineWidth = 1.5;
    ac.beginPath(); ac.moveTo(16,2); ac.lineTo(26,14); ac.lineTo(16,30); ac.lineTo(6,14); ac.closePath(); ac.stroke();
    // Facet lines
    ac.strokeStyle = 'rgba(255,255,255,0.4)'; ac.lineWidth = 0.8;
    ac.beginPath(); ac.moveTo(16,2); ac.lineTo(16,30); ac.stroke();
    ac.beginPath(); ac.moveTo(6,14); ac.lineTo(26,14); ac.stroke();
    atex.refresh();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
}
