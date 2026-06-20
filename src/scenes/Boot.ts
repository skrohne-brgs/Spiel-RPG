import Phaser from 'phaser';
import { MAP_COLS, MAP_ROWS, TILE_SIZE, COMBAT_CELL_W, COMBAT_CELL_H } from '../constants';
import { MAP_TILES } from '../data/mapData';

// ── Base colors for smooth bilinear upscaling ─────────────────────────────────
const BASE_COLOR: Record<number, string> = {
  0: '#4a8a28', // grass
  1: '#5a4a38', // mountain
  2: '#1c3c0c', // forest
  3: '#0e4878', // water
  4: '#3c3020', // ruins
  5: '#7a6440', // road
  6: '#6a4c14', // wasteland
  7: '#38384e', // town
};

export class Boot extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create(): void {
    this.generateMapTexture();
    this.generateUnitTextures();
    this.generateHeroTexture();
    this.generateEnemyMarkerTexture();
    this.generateResourceTextures();
    this.scene.start('HeroSelectScene');
  }

  // ── Seeded pseudo-random ───────────────────────────────────────────────────
  private r(x: number, y: number, s = 0): number {
    const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.3) * 43758.5453;
    return v - Math.floor(v);
  }

  private neighborType(col: number, row: number, dx: number, dy: number): number {
    const c = col + dx, r = row + dy;
    if (c < 0 || c >= MAP_COLS || r < 0 || r >= MAP_ROWS) return -1;
    return MAP_TILES[r][c];
  }

  // ── Full-map canvas generation ─────────────────────────────────────────────
  private generateMapTexture(): void {
    const W = MAP_COLS * TILE_SIZE; // 960
    const H = MAP_ROWS * TILE_SIZE; // 720
    const tex = this.textures.createCanvas('map_base', W, H)!;
    const ctx = tex.context as unknown as CanvasRenderingContext2D;

    // ── Pass 1: Smooth blended base via bilinear upscaling ───────────────────
    const SMALL_SCALE = 5; // 5 px per tile → 100×75 source
    const sm = document.createElement('canvas');
    sm.width  = MAP_COLS * SMALL_SCALE;
    sm.height = MAP_ROWS * SMALL_SCALE;
    const sc = sm.getContext('2d')!;

    // Fill terrain colors (+ slight inner gradient for each block)
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const t = MAP_TILES[row][col];
        const x = col * SMALL_SCALE, y = row * SMALL_SCALE;
        sc.fillStyle = BASE_COLOR[t];
        sc.fillRect(x, y, SMALL_SCALE, SMALL_SCALE);
      }
    }

    // Draw small canvas scaled up with smooth interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sm, 0, 0, W, H);

    // ── Pass 2: Shore & cliff edges (water → land transitions) ──────────────
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const t = MAP_TILES[row][col];
        const x = col * TILE_SIZE, y = row * TILE_SIZE;
        const S = TILE_SIZE;
        if (t !== 3) {
          // If this land tile borders water → draw dark cliff base + sandy shore
          for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            if (this.neighborType(col, row, dx, dy) === 3) {
              const ex = x + (dx === 1 ? S - 6 : 0), ey = y + (dy === 1 ? S - 6 : 0);
              const ew = dx !== 0 ? 6 : S, eh = dy !== 0 ? 6 : S;
              const gx0 = ex + (dx === 1 ? 0 : dx === -1 ? ew : 0);
              const gy0 = ey + (dy === 1 ? 0 : dy === -1 ? eh : 0);
              const gx1 = ex + (dx === 1 ? ew : dx === -1 ? 0 : 0);
              const gy1 = ey + (dy === 1 ? eh : dy === -1 ? 0 : 0);
              const sg = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
              sg.addColorStop(0, 'rgba(220,200,140,0.0)');
              sg.addColorStop(0.4, 'rgba(200,175,110,0.55)');
              sg.addColorStop(1, 'rgba(30,20,5,0.35)');
              ctx.fillStyle = sg;
              ctx.fillRect(ex, ey, ew, eh);
            }
          }
        } else {
          // Water tile bordering land → darken water near shore
          for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            if (this.neighborType(col, row, dx, dy) !== 3 && this.neighborType(col, row, dx, dy) !== -1) {
              const ex = x + (dx === 1 ? S - 8 : 0), ey = y + (dy === 1 ? S - 8 : 0);
              const ew = dx !== 0 ? 8 : S, eh = dy !== 0 ? 8 : S;
              const gx0 = ex + (dx === 1 ? ew : dx === -1 ? 0 : 0);
              const gy0 = ey + (dy === 1 ? eh : dy === -1 ? 0 : 0);
              const gx1 = ex + (dx === 1 ? 0 : dx === -1 ? ew : 0);
              const gy1 = ey + (dy === 1 ? 0 : dy === -1 ? eh : 0);
              const wg = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
              wg.addColorStop(0, 'rgba(8,30,60,0.0)');
              wg.addColorStop(1, 'rgba(8,30,60,0.55)');
              ctx.fillStyle = wg;
              ctx.fillRect(ex, ey, ew, eh);
            }
          }
        }
      }
    }

    // ── Pass 3: Organic texture noise ────────────────────────────────────────
    for (let i = 0; i < 3500; i++) {
      const nx = this.r(i, 0, 77) * W;
      const ny = this.r(i, 1, 77) * H;
      const a = this.r(i, 2, 77) * 0.07 + 0.01;
      ctx.fillStyle = this.r(i, 3, 77) > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
      ctx.fillRect(nx, ny, 1 + Math.round(this.r(i, 4, 77)), 1 + Math.round(this.r(i, 5, 77)));
    }

    // ── Pass 4: Terrain details in draw order ─────────────────────────────────
    // Water + wasteland first (bottom), forest + mountain last (overflow upward)
    for (const targetType of [3, 6, 5, 0, 4, 7, 2, 1]) {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          if (MAP_TILES[row][col] !== targetType) continue;
          const x = col * TILE_SIZE, y = row * TILE_SIZE;
          ctx.save();
          this.drawDetail(ctx, targetType, x, y, col, row);
          ctx.restore();
        }
      }
    }

    // ── Pass 5: Global vignette ───────────────────────────────────────────────
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    tex.refresh();
  }

  private drawDetail(ctx: CanvasRenderingContext2D, type: number, x: number, y: number, col: number, row: number): void {
    const S = TILE_SIZE;
    switch (type) {
      case 0: this.dGrass(ctx, x, y, col, row, S); break;
      case 1: this.dMountain(ctx, x, y, col, row, S); break;
      case 2: this.dForest(ctx, x, y, col, row, S); break;
      case 3: this.dWater(ctx, x, y, col, row, S); break;
      case 4: this.dRuins(ctx, x, y, col, row, S); break;
      case 5: this.dRoad(ctx, x, y, col, row, S); break;
      case 6: this.dWasteland(ctx, x, y, col, row, S); break;
      case 7: this.dTown(ctx, x, y, S); break;
    }
  }

  // ── Terrain: Grasland ──────────────────────────────────────────────────────
  private dGrass(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();

    // Subtle colour variation per tile (sunny/shadowed patches)
    const tone = this.r(col, row, 1) * 0.18 - 0.09;
    if (tone > 0) { ctx.fillStyle = `rgba(120,200,60,${tone * 0.5})`; ctx.fillRect(x, y, S, S); }
    else           { ctx.fillStyle = `rgba(0,30,0,${-tone * 0.5})`; ctx.fillRect(x, y, S, S); }

    // Grass tufts
    const tufts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      tufts.push([x + this.r(col + i, row, 3) * (S - 8) + 4, y + this.r(col, row + i, 3) * (S - 8) + 4]);
    }
    tufts.forEach(([bx, by], ti) => {
      for (let b = -2; b <= 2; b++) {
        const lean = (this.r(ti, b, 4) - 0.5) * 5;
        const h = 5 + this.r(ti + 10, b, 4) * 4;
        ctx.strokeStyle = this.r(ti, b, 5) > 0.5 ? '#56a030' : '#3d8018';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(bx + b * 2.2, by);
        ctx.quadraticCurveTo(bx + b * 2.2 + lean, by - h * 0.55, bx + b * 2.2 + lean * 1.4, by - h);
        ctx.stroke();
      }
    });

    // Wildflowers
    for (let i = 0; i < 2; i++) {
      const fx = x + this.r(col + i * 7, row, 6) * (S - 6) + 3;
      const fy = y + this.r(col, row + i * 7, 6) * (S - 6) + 3;
      const fc = this.r(col + i, row, 7) > 0.5 ? '#fff176' : '#ffffff';
      ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(fx, fy, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f9a825'; ctx.beginPath(); ctx.arc(fx, fy, 0.7, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Terrain: Wasser ────────────────────────────────────────────────────────
  private dWater(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();

    // Depth gradient (darker center of water bodies)
    const depthG = ctx.createRadialGradient(x + S / 2, y + S / 2, 0, x + S / 2, y + S / 2, S * 0.8);
    depthG.addColorStop(0, 'rgba(8,28,55,0.35)');
    depthG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = depthG; ctx.fillRect(x, y, S, S);

    // Animated-looking wave lines
    const waveOff = this.r(col, row, 8) * 8;
    for (let wi = 0; wi < 4; wi++) {
      const wy = y + 6 + wi * 11 + waveOff % 11;
      if (wy >= y + S) continue;
      const alpha = 0.30 - wi * 0.04;
      ctx.strokeStyle = `rgba(120,190,240,${alpha})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, wy);
      for (let px = 0; px <= S; px += 3) {
        const py = wy + Math.sin((px / S) * Math.PI * 2.8 + this.r(col, wi, 9) * Math.PI) * 2.2;
        ctx.lineTo(x + px, py);
      }
      ctx.stroke();

      // Foam dots on wave crests
      for (let px = 5; px < S; px += 9 + Math.round(this.r(px, wi, 10) * 6)) {
        const py = wy + Math.sin((px / S) * Math.PI * 2.8 + this.r(col, wi, 9) * Math.PI) * 2.2;
        if (this.r(px + col, wi + row, 11) > 0.55) {
          ctx.fillStyle = `rgba(255,255,255,${0.45 + this.r(px, wi, 12) * 0.3})`;
          ctx.beginPath(); ctx.ellipse(x + px, py, 2.2, 1, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // Specular highlight
    for (let si = 0; si < 3; si++) {
      const sx = x + this.r(col + si, row, 13) * S;
      const sy = y + this.r(col, row + si, 13) * S;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + this.r(si, col, 14) * 0.3})`;
      ctx.beginPath(); ctx.ellipse(sx, sy, 3.5, 1.3, -0.3, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Terrain: Wald ─────────────────────────────────────────────────────────
  private dForest(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    // Trees overflow into tile above → NO clip
    const OVERFLOW = 20;

    // Shadow on forest floor
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();
    ctx.fillStyle = 'rgba(0,10,0,0.35)'; ctx.fillRect(x, y, S, S);
    // Leaf litter
    for (let i = 0; i < 5; i++) {
      const lx = x + this.r(col + i, row, 15) * (S - 4) + 2;
      const ly = y + this.r(col, row + i, 15) * (S - 4) + 2;
      ctx.fillStyle = `rgba(30,60,10,${0.4 + this.r(i, col, 16) * 0.3})`;
      ctx.beginPath(); ctx.ellipse(lx, ly, 3 + this.r(i, row, 17) * 3, 1.5, this.r(i, col, 18) * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.save(); // remove clip for overflow

    // Draw 3 trees per tile, sizes and positions vary by tile seed
    const treeCount = 2 + Math.round(this.r(col, row, 19));
    for (let ti = 0; ti < treeCount; ti++) {
      const tx = x + this.r(col + ti * 3, row, 20) * (S - 10) + 5;
      const ty = y + this.r(col, row + ti * 3, 20) * (S * 0.5) + S * 0.35; // upper half
      const treeH = 22 + this.r(col + ti, row, 21) * 14;
      const crownR = 9 + this.r(col, row + ti, 21) * 6;

      // Trunk
      ctx.fillStyle = `rgba(${40 + Math.round(this.r(ti, col, 22) * 20)},${25},${10},0.9)`;
      ctx.fillRect(tx - 2, ty - treeH * 0.35, 4, treeH * 0.38);

      // Shadow below crown
      ctx.fillStyle = 'rgba(0,10,0,0.25)';
      ctx.beginPath(); ctx.ellipse(tx, ty, crownR * 0.9, crownR * 0.35, 0, 0, Math.PI * 2); ctx.fill();

      // Crown layers (back to front, 3 overlapping circles)
      const layers: [number, number, number, string][] = [
        [-crownR * 0.3, -treeH + crownR * 0.5, crownR * 0.75, '#163008'],
        [ crownR * 0.25, -treeH + crownR * 0.55, crownR * 0.7, '#1a3a0a'],
        [0, -treeH, crownR, '#1e4210'],
        [0, -treeH - crownR * 0.3, crownR * 0.65, '#265218'],
      ];
      layers.forEach(([ox, oy, r, col_]) => {
        ctx.fillStyle = col_;
        ctx.beginPath(); ctx.arc(tx + ox, ty + oy, r, 0, Math.PI * 2); ctx.fill();
      });

      // Light highlight on crown top
      ctx.fillStyle = 'rgba(100,190,50,0.22)';
      ctx.beginPath(); ctx.ellipse(tx - crownR * 0.25, ty - treeH - crownR * 0.1, crownR * 0.4, crownR * 0.28, -0.5, 0, Math.PI * 2); ctx.fill();
    }
    void OVERFLOW;
  }

  // ── Terrain: Gebirge ──────────────────────────────────────────────────────
  private dMountain(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    // Peaks overflow upward → NO clip

    // Rock rubble at base (clipped to tile)
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();
    ctx.fillStyle = 'rgba(30,22,14,0.45)'; ctx.fillRect(x, y, S, S);
    for (let i = 0; i < 8; i++) {
      const rx = x + this.r(col + i, row, 23) * (S - 6);
      const ry = y + S * 0.6 + this.r(col, row + i, 23) * (S * 0.35);
      const rw = this.r(i, col, 24) * 6 + 3;
      ctx.fillStyle = `rgba(${75+Math.round(this.r(i,row,25)*30)},${65+Math.round(this.r(i,col,25)*20)},${50+Math.round(this.r(i,row+col,25)*15)},0.85)`;
      ctx.beginPath(); ctx.ellipse(rx, ry, rw, rw * 0.55, this.r(i, col, 26) * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.save();

    // 2-3 mountain peaks per tile (vary by tile)
    const peakCount = 1 + Math.round(this.r(col, row, 27) * 1.5);
    for (let pi = 0; pi < peakCount; pi++) {
      const px = x + (pi === 0 ? S * 0.45 : this.r(col + pi, row, 28) * S * 0.6 + S * 0.1);
      const py = y + S * 0.8;
      const ph = 28 + this.r(col + pi * 3, row, 28) * 22; // height above base
      const pw = 16 + this.r(col, row + pi * 3, 28) * 12;

      // Main mountain body
      const mG = ctx.createLinearGradient(px - pw, py, px + pw, py - ph);
      mG.addColorStop(0, '#8a7860');
      mG.addColorStop(0.4, '#7a6850');
      mG.addColorStop(1, '#5a4a38');
      ctx.fillStyle = mG;
      ctx.beginPath();
      ctx.moveTo(px - pw, py);
      ctx.lineTo(px - pw * 0.15, py - ph);
      ctx.lineTo(px + pw * 0.12, py - ph + 4);
      ctx.lineTo(px + pw, py);
      ctx.closePath(); ctx.fill();

      // Right shadow
      ctx.fillStyle = 'rgba(15,8,0,0.40)';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.1, py - ph + 5);
      ctx.lineTo(px + pw, py);
      ctx.lineTo(px + pw * 0.3, py);
      ctx.closePath(); ctx.fill();

      // Rock texture lines
      ctx.strokeStyle = 'rgba(40,28,15,0.35)'; ctx.lineWidth = 0.8;
      for (let li = 0; li < 3; li++) {
        const ly = py - ph * (0.3 + li * 0.2);
        ctx.beginPath();
        ctx.moveTo(px - pw * (0.6 - li * 0.1), ly);
        ctx.lineTo(px + pw * (0.4 - li * 0.08), ly + 4 + li * 2);
        ctx.stroke();
      }

      // Snow cap (upper 35% of peak)
      const snowH = ph * 0.35;
      const snowPy = py - ph;
      ctx.fillStyle = '#eef2ff';
      ctx.beginPath();
      ctx.moveTo(px - pw * 0.15, snowPy);
      ctx.lineTo(px - pw * 0.28, snowPy + snowH);
      ctx.lineTo(px + pw * 0.25, snowPy + snowH - 3);
      ctx.lineTo(px + pw * 0.12, snowPy + 4);
      ctx.closePath(); ctx.fill();
      // Snow highlight
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath(); ctx.ellipse(px - pw * 0.05, snowPy + snowH * 0.25, pw * 0.1, snowH * 0.12, -0.3, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Terrain: Ruinen ───────────────────────────────────────────────────────
  private dRuins(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();

    // Cracked floor tiles
    const stones: [number,number,number,number][] = [
      [0,S*0.55,S*0.3,S*0.25],[S*0.3,S*0.52,S*0.35,S*0.28],[S*0.65,S*0.56,S*0.35,S*0.24],
      [0,S*0.1,S*0.22,S*0.4],[S*0.22,S*0.12,S*0.38,S*0.38],[S*0.6,S*0.08,S*0.4,S*0.42],
    ];
    stones.forEach(([sx,sy,sw,sh], si) => {
      const br = 55 + Math.round(this.r(si, col, 30) * 25);
      ctx.fillStyle = `rgb(${br},${br-5},${br-12})`;
      ctx.fillRect(x + sx, y + sy, sw, sh);
      ctx.strokeStyle = 'rgba(10,6,2,0.6)'; ctx.lineWidth = 0.7;
      ctx.strokeRect(x + sx, y + sy, sw, sh);
      // Crack within stone
      if (this.r(si, row, 31) > 0.4) {
        ctx.strokeStyle = 'rgba(8,4,0,0.5)'; ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x + sx + sw * 0.25, y + sy);
        ctx.lineTo(x + sx + sw * 0.38, y + sy + sh * 0.5);
        ctx.lineTo(x + sx + sw * 0.65, y + sy + sh);
        ctx.stroke();
      }
    });

    // Broken column
    const colX = x + S * 0.1;
    const colG = ctx.createLinearGradient(colX, 0, colX + 9, 0);
    colG.addColorStop(0, '#7a7060'); colG.addColorStop(0.5, '#8a8070'); colG.addColorStop(1, '#5a5048');
    ctx.fillStyle = colG;
    ctx.fillRect(colX, y + S * 0.04, 9, S * 0.5);
    ctx.fillStyle = '#6a6258';
    ctx.fillRect(colX - 2, y + S * 0.04, 13, 5); // capital (broken)
    // Fallen column piece
    ctx.save(); ctx.translate(x + S * 0.42, y + S * 0.73); ctx.rotate(-0.48);
    ctx.fillStyle = '#6a6258'; ctx.fillRect(0, 0, S * 0.42, 7);
    ctx.restore();

    // Moss/weeds
    ctx.fillStyle = '#2a5c10';
    for (let i = 0; i < 4; i++) {
      const mx = x + this.r(col + i, row, 32) * (S - 4);
      const my = y + this.r(col, row + i, 32) * (S - 4);
      if (this.r(i, col + row, 33) > 0.45) {
        ctx.beginPath(); ctx.ellipse(mx, my, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ── Terrain: Straße ───────────────────────────────────────────────────────
  private dRoad(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();

    // Road surface
    const rG = ctx.createLinearGradient(x + S * 0.17, y, x + S * 0.83, y);
    rG.addColorStop(0, 'rgba(140,110,65,0.0)');
    rG.addColorStop(0.15, 'rgba(165,130,78,0.85)');
    rG.addColorStop(0.5, 'rgba(178,145,88,0.92)');
    rG.addColorStop(0.85, 'rgba(165,130,78,0.85)');
    rG.addColorStop(1, 'rgba(140,110,65,0.0)');
    ctx.fillStyle = rG; ctx.fillRect(x, y, S, S);

    // Wheel ruts – consistent positions for continuity between tiles
    ctx.strokeStyle = 'rgba(70,48,22,0.7)'; ctx.lineWidth = 2;
    [S * 0.28, S * 0.72].forEach(rx => {
      ctx.beginPath();
      for (let py = 0; py <= S; py += 3) {
        const wobble = Math.sin(py * 0.35 + this.r(col, row, 34) * 10) * 0.8;
        py === 0 ? ctx.moveTo(x + rx + wobble, y + py) : ctx.lineTo(x + rx + wobble, y + py);
      }
      ctx.stroke();
    });

    // Center worn stripe
    ctx.fillStyle = 'rgba(190,160,100,0.18)';
    ctx.fillRect(x + S * 0.38, y, S * 0.24, S);

    // Edge grass transition
    ctx.fillStyle = 'rgba(50,100,20,0.35)';
    ctx.fillRect(x, y, S * 0.16, S);
    ctx.fillRect(x + S * 0.84, y, S * 0.16, S);

    // Scattered pebbles
    for (let i = 0; i < 6; i++) {
      const px = x + S * 0.18 + this.r(col + i, row, 35) * (S * 0.64);
      const py = y + this.r(col, row + i, 35) * (S - 4);
      ctx.fillStyle = `rgba(${80+Math.round(this.r(i,col,36)*35)},${70+Math.round(this.r(i,row,36)*25)},50,0.8)`;
      ctx.beginPath(); ctx.ellipse(px, py, this.r(i,col+row,37)*2+1, this.r(i+1,col,37)*1.2+0.5, this.r(i,row,38)*Math.PI, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Terrain: Ödland ───────────────────────────────────────────────────────
  private dWasteland(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, S: number): void {
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();

    // Colour variation
    const v = this.r(col, row, 39) * 0.15;
    ctx.fillStyle = `rgba(${v > 0 ? 180 : 0},${v > 0 ? 120 : 0},${v > 0 ? 0 : 20},${Math.abs(v)})`;
    ctx.fillRect(x, y, S, S);

    // Ash patches
    for (let i = 0; i < 4; i++) {
      const ax = x + this.r(col + i, row, 40) * (S - 6);
      const ay = y + this.r(col, row + i, 40) * (S - 6);
      ctx.fillStyle = `rgba(28,22,18,${0.35 + this.r(i, col, 41) * 0.2})`;
      ctx.beginPath(); ctx.ellipse(ax, ay, this.r(i,row,42)*8+4, this.r(i+1,col,42)*4+2, this.r(i,col+row,42)*Math.PI, 0, Math.PI * 2); ctx.fill();
    }

    // Crack network
    const cracks: [number,number][][] = [
      [[S*0.1,S*0.22],[S*0.3,S*0.45],[S*0.18,S*0.7]],
      [[S*0.3,S*0.45],[S*0.58,S*0.38],[S*0.75,S*0.62]],
      [[S*0.58,S*0.38],[S*0.85,S*0.18],[S*0.92,S*0.42]],
      [[S*0.18,S*0.7],[S*0.4,S*0.88],[S*0.65,S*0.8],[S*0.92,S*0.92]],
      [[S*0.42,S*0.08],[S*0.58,S*0.38]],
    ];
    // Shadow cracks
    ctx.strokeStyle = 'rgba(12,6,0,0.4)'; ctx.lineWidth = 3;
    cracks.forEach(pts => {
      ctx.beginPath(); pts.forEach(([cx,cy],i) => i===0 ? ctx.moveTo(x+cx,y+cy) : ctx.lineTo(x+cx,y+cy)); ctx.stroke();
    });
    // Main crack lines
    ctx.strokeStyle = 'rgba(20,12,2,0.75)'; ctx.lineWidth = 1.1;
    cracks.forEach(pts => {
      ctx.beginPath(); pts.forEach(([cx,cy],i) => i===0 ? ctx.moveTo(x+cx,y+cy) : ctx.lineTo(x+cx,y+cy)); ctx.stroke();
    });

    // Dead twigs
    ctx.strokeStyle = `rgba(${55+Math.round(this.r(col,row,43)*20)},40,20,0.85)`; ctx.lineWidth = 1;
    const tx = x + S * 0.65, ty = y + S * 0.9;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 3, ty - 14);
    ctx.lineTo(tx - 4, ty - 22); ctx.moveTo(tx + 3, ty - 14); ctx.lineTo(tx + 8, ty - 20); ctx.stroke();
    // Second twig
    const tx2 = x + S * 0.2, ty2 = y + S * 0.75;
    ctx.beginPath(); ctx.moveTo(tx2, ty2); ctx.lineTo(tx2 + 2, ty2 - 10); ctx.lineTo(tx2 - 3, ty2 - 15); ctx.stroke();
  }

  // ── Terrain: Stadt ────────────────────────────────────────────────────────
  private dTown(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
    ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();

    // Stone floor
    ctx.fillStyle = 'rgba(50,50,70,0.5)'; ctx.fillRect(x, y, S, S);
    ctx.strokeStyle = 'rgba(70,70,90,0.4)'; ctx.lineWidth = 0.5;
    for (let fy = y; fy < y + S; fy += 10) {
      for (let fx = x + (Math.floor((fy - y) / 10) % 2 ? 5 : 0); fx < x + S; fx += 10) {
        ctx.strokeRect(fx, fy, 10, 10);
      }
    }

    // Outer wall
    const wallG = ctx.createLinearGradient(x, y + S * 0.32, x + S, y + S * 0.32);
    wallG.addColorStop(0, '#50507a'); wallG.addColorStop(0.5, '#606080'); wallG.addColorStop(1, '#404058');
    ctx.fillStyle = wallG;
    ctx.fillRect(x + 2, y + S * 0.32, S - 4, S * 0.62);
    // Wall shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + S * 0.65, y + S * 0.32, S * 0.32, S * 0.62);

    // Battlements
    ctx.fillStyle = '#505070';
    for (let bx = x + 2; bx < x + S - 2; bx += 8) ctx.fillRect(bx, y + S * 0.25, 5, S * 0.1);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let bx = x + 7; bx < x + S - 2; bx += 8) ctx.fillRect(bx, y + S * 0.25, 3, S * 0.1);

    // Central tower
    const twG = ctx.createLinearGradient(x + S * 0.33, 0, x + S * 0.67, 0);
    twG.addColorStop(0, '#606078'); twG.addColorStop(1, '#404058');
    ctx.fillStyle = twG; ctx.fillRect(x + S * 0.33, y + 2, S * 0.34, S * 0.78);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + S * 0.56, y + 2, S * 0.11, S * 0.78);
    // Tower battlements
    ctx.fillStyle = '#585870';
    [x + S*0.33, x + S*0.44, x + S*0.55].forEach(bx => ctx.fillRect(bx, y + 2, 5, 7));

    // Gate arch
    ctx.fillStyle = '#18162a';
    ctx.beginPath();
    ctx.moveTo(x + S * 0.38, y + S); ctx.lineTo(x + S * 0.38, y + S * 0.63);
    ctx.quadraticCurveTo(x + S * 0.5, y + S * 0.52, x + S * 0.62, y + S * 0.63);
    ctx.lineTo(x + S * 0.62, y + S); ctx.fill();
    // Portcullis
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = 1;
    for (let gx = x + S*0.40; gx < x + S*0.61; gx += 4) {
      ctx.beginPath(); ctx.moveTo(gx, y + S*0.65); ctx.lineTo(gx, y + S); ctx.stroke();
    }
    // Horizontal bars
    [y + S*0.72, y + S*0.83].forEach(gy => {
      ctx.beginPath(); ctx.moveTo(x + S*0.38, gy); ctx.lineTo(x + S*0.62, gy); ctx.stroke();
    });

    // Tower window (glowing)
    ctx.fillStyle = '#c8a040';
    ctx.beginPath(); ctx.ellipse(x + S * 0.5, y + S * 0.25, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,80,0.3)';
    ctx.beginPath(); ctx.ellipse(x + S * 0.5, y + S * 0.25, 5, 7, 0, 0, Math.PI * 2); ctx.fill();

    // Flag
    ctx.strokeStyle = '#5a3c10'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + S * 0.5, y + 2); ctx.lineTo(x + S * 0.5, y - 6); ctx.stroke();
    ctx.fillStyle = '#cc1a1a';
    ctx.beginPath(); ctx.moveTo(x + S * 0.5, y - 6); ctx.lineTo(x + S * 0.5 + 10, y - 3); ctx.lineTo(x + S * 0.5, y + 1); ctx.fill();
  }

  // ── Unit / Hero / Enemy textures ───────────────────────────────────────────

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
      const rv = (color >> 16) & 0xff, gv = (color >> 8) & 0xff, bv = color & 0xff;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgb(${Math.min(255,rv+50)},${Math.min(255,gv+50)},${Math.min(255,bv+50)})`);
      grad.addColorStop(1, `rgb(${Math.max(0,rv-25)},${Math.max(0,gv-25)},${Math.max(0,bv-25)})`);
      this.rrect(ctx, 2, 2, w - 4, h - 4, 6);
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
      this.rrect(ctx, 2, 2, w - 4, h - 4, 6); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.moveTo(4,4); ctx.lineTo(w-4,4); ctx.lineTo(4, h/2); ctx.closePath(); ctx.fill();
      tex.refresh();
    });
  }

  private generateHeroTexture(): void {
    const tex = this.textures.createCanvas('hero', 40, 40)!;
    const c = tex.context as unknown as CanvasRenderingContext2D;
    const g = c.createRadialGradient(18, 16, 0, 20, 20, 16);
    g.addColorStop(0, '#fff5c0'); g.addColorStop(0.5, '#ffd700'); g.addColorStop(1, '#c08a00');
    c.fillStyle = g; c.beginPath(); c.arc(20, 20, 15, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#7a5a00'; c.lineWidth = 2;
    c.beginPath(); c.arc(20, 20, 15, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1;
    c.beginPath(); c.arc(20, 20, 9, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(20, 20, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffd700'; c.beginPath(); c.arc(20, 20, 2, 0, Math.PI * 2); c.fill();
    tex.refresh();
  }

  private generateEnemyMarkerTexture(): void {
    const tex = this.textures.createCanvas('enemy_marker', 40, 40)!;
    const c = tex.context as unknown as CanvasRenderingContext2D;
    const g = c.createLinearGradient(20, 2, 20, 38);
    g.addColorStop(0, '#ff4444'); g.addColorStop(1, '#880000');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(20,2); c.lineTo(38,37); c.lineTo(2,37); c.closePath(); c.fill();
    c.strokeStyle = '#ff9999'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(20,2); c.lineTo(38,37); c.lineTo(2,37); c.closePath(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.88)';
    c.beginPath(); c.arc(20, 22, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#880000';
    c.beginPath(); c.ellipse(17.5, 22, 2, 2.5, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(22.5, 22, 2, 2.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.88)'; c.fillRect(17, 27, 6, 3);
    c.fillStyle = '#880000'; c.fillRect(18.2, 27, 1.4, 3); c.fillRect(20.6, 27, 1.4, 3);
    tex.refresh();
  }

  private generateResourceTextures(): void {
    const gt = this.textures.createCanvas('resource_gold', 32, 32)!;
    const gc = gt.context as unknown as CanvasRenderingContext2D;
    [[18,20,9],[12,20,8],[24,18,7],[10,16,6],[22,24,5]].forEach(([cx,cy,rv]) => {
      const g = gc.createRadialGradient(cx-2,cy-2,0,cx,cy,rv);
      g.addColorStop(0,'#fff5c0'); g.addColorStop(0.5,'#ffd700'); g.addColorStop(1,'#a07800');
      gc.fillStyle=g; gc.beginPath(); gc.arc(cx,cy,rv,0,Math.PI*2); gc.fill();
      gc.strokeStyle='#806000'; gc.lineWidth=0.7;
      gc.beginPath(); gc.arc(cx,cy,rv,0,Math.PI*2); gc.stroke();
    });
    gt.refresh();

    const at = this.textures.createCanvas('resource_artifact', 32, 32)!;
    const ac = at.context as unknown as CanvasRenderingContext2D;
    const ag = ac.createRadialGradient(16,16,0,16,16,14);
    ag.addColorStop(0,'rgba(200,120,255,0.4)'); ag.addColorStop(1,'rgba(80,0,160,0)');
    ac.fillStyle=ag; ac.beginPath(); ac.arc(16,16,14,0,Math.PI*2); ac.fill();
    const dg = ac.createLinearGradient(8,2,24,30);
    dg.addColorStop(0,'#e8b0ff'); dg.addColorStop(0.4,'#c060ff'); dg.addColorStop(1,'#5000b0');
    ac.fillStyle=dg;
    ac.beginPath(); ac.moveTo(16,2); ac.lineTo(26,14); ac.lineTo(16,30); ac.lineTo(6,14); ac.closePath(); ac.fill();
    ac.strokeStyle='rgba(255,255,255,0.85)'; ac.lineWidth=1.5;
    ac.beginPath(); ac.moveTo(16,2); ac.lineTo(26,14); ac.lineTo(16,30); ac.lineTo(6,14); ac.closePath(); ac.stroke();
    ac.strokeStyle='rgba(255,255,255,0.4)'; ac.lineWidth=0.8;
    ac.beginPath(); ac.moveTo(16,2); ac.lineTo(16,30); ac.stroke();
    ac.beginPath(); ac.moveTo(6,14); ac.lineTo(26,14); ac.stroke();
    at.refresh();
  }

  private rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }
}
