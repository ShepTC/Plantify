import React, { useEffect, useRef, useCallback } from 'react';

/**
 * PixelGarden — isometric pixel-art view of the user's garden.
 *
 * Pure canvas 2D, no dependencies. Each UserPlant becomes a raised bed on a
 * tiled isometric grid; the grid auto-sizes to however many plants there are.
 *
 * props:
 *   userPlants  UserPlant[]  — records from the UserPlant entity
 *   night       boolean      — dark/night rendering
 *   onSelectBed (userPlant)  — fired when a bed is tapped
 */

const TW = 28, TH = 14, HW = TW / 2, HH = TH / 2, RAISE = 8;
const MAX_COLS = 4;

const COL = {
  peach: '#efa680', night: '#12302e',
  grassA: '#7ab24a', grassB: '#6da33d', dirt: '#c7a267', dirt2: '#b89158',
  wood: '#8a5730', woodDk: '#5e3720', woodMed: '#744727', woodHi: '#a9743f',
  soil: '#7a5230', soilDk: '#5a3b22',
  gDk: '#2e6f39', gMd: '#3f8f4a', gLt: '#5fb355', gLt2: '#84cf5c',
  gold: '#e0b34a', goldLt: '#eac24e', goldDk: '#c8983a',
  red: '#e2472f', red2: '#bd3420', white: '#f4ecd2',
  purple: '#8a5bb0', lilac: '#b189d6', blue: '#4f7fc0', blueLt: '#79a3dd',
  brown: '#7a4a2b', orange: '#e08a3f', heat: '#ff5a2e',
};

// crop name → sprite
const SPRITE_RULES = [
  [/tomato/i, 'tomato'],
  [/corn|maize/i, 'corn'],
  [/wheat|barley|oat|rye|grain/i, 'wheat'],
  [/carrot|radish|beet|turnip|parsnip/i, 'carrot'],
  [/lavender/i, 'lavender'],
  [/sunflower/i, 'sunflower'],
  [/strawberr/i, 'strawberry'],
  [/blueberr|raspberr|blackberr|currant/i, 'blueberry'],
  [/tulip|daffodil|iris|lily|crocus/i, 'tulip'],
  [/lettuce|spinach|kale|chard|cabbage|collard|broccoli|bok/i, 'leafy'],
];
const spriteFor = (name = '') => {
  for (const [re, key] of SPRITE_RULES) if (re.test(name)) return key;
  return 'bush';
};

export default function PixelGarden({ userPlants = [], night = false, onSelectBed }) {
  const canvasRef = useRef(null);
  const bedsRef = useRef([]);
  const selRef = useRef(-1);

  // ── layout: grid auto-sizes to the number of plants ──
  const n = Math.max(userPlants.length, 1);
  const cols = Math.min(MAX_COLS, Math.max(1, Math.ceil(Math.sqrt(n))));
  const rows = Math.ceil(n / cols);
  const NXT = cols * 3 + 1;
  const NYT = rows * 3 + 1;
  const W = Math.max(400, (NXT + NYT) * HW + 80);
  const H = Math.max(260, 96 + (NXT + NYT) * HH + 60);
  const ORIGX = Math.round(W / 2 - ((NXT - NYT) * HW) / 2);
  const ORIGY = 92;

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let s = 99;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const iso = (a, b) => ({ x: ORIGX + (a - b) * HW, y: ORIGY + (a + b) * HH });
    const R = (x, y, w, h, col, a) => {
      ctx.globalAlpha = a === undefined ? 1 : a;
      ctx.fillStyle = col;
      ctx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0));
      ctx.globalAlpha = 1;
    };
    const ell = (cx, cy, rx, ry, col) => {
      for (let dy = -ry; dy <= ry; dy++) {
        const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) * (dy / ry))));
        R(cx - hw, cy + dy, 2 * hw + 1, 1, col);
      }
    };
    const dia = (cx, cy, hw, hh, col) => {
      for (let dy = -hh; dy <= hh; dy++) {
        const half = Math.round(hw * (1 - Math.abs(dy) / hh));
        R(cx - half, cy + dy, 2 * half + 1, 1, col);
      }
    };
    const ln = (p, q, col) => {
      const steps = Math.max(Math.abs(q.x - p.x), Math.abs(q.y - p.y)) | 0;
      for (let i = 0; i <= steps; i++)
        R(Math.round(p.x + (q.x - p.x) * i / steps), Math.round(p.y + (q.y - p.y) * i / steps), 1, 1, col);
    };
    const isoBox = (cx, cyTop, hw, boxH, topC, leftC, rightC) => {
      const hh = Math.round(hw / 2);
      let x, t;
      for (x = cx - hw; x <= cx; x++) { t = (x - (cx - hw)) / hw; R(x, Math.round(cyTop + t * hh), 1, boxH, leftC); }
      for (x = cx; x <= cx + hw; x++) { t = (x - cx) / hw; R(x, Math.round(cyTop + hh - t * hh), 1, boxH, rightC); }
      dia(cx, cyTop, hw, hh, topC);
    };
    const surf = (bed, u, v) => {
      const p = iso(bed.cs + u * 2, bed.rs + v * 2);
      return { x: p.x, y: p.y - RAISE };
    };

    // ── plant sprites ──
    const P = {
      sunflower(x, base) {
        R(x - 1, base - 30, 2, 30, COL.gMd);
        ell(x - 6, base - 15, 5, 3, COL.gDk); ell(x + 6, base - 21, 5, 3, COL.gMd);
        const hy = base - 36;
        for (let a = 0; a < 12; a++) {
          const g = (a / 12) * 6.283;
          R(x + Math.round(Math.cos(g) * 8) - 1, hy + Math.round(Math.sin(g) * 5) - 1, 3, 3, COL.gold);
        }
        ell(x, hy, 5, 4, '#6e4322'); ell(x, hy, 3, 2, '#4d2d16');
      },
      corn(x, base) {
        R(x - 1, base - 38, 3, 38, COL.gMd);
        for (let k = 0; k < 4; k++) {
          const ly = base - 8 - k * 8;
          for (let i = 0; i < 11; i++) { R(x + 2 + i, ly - (i >> 1), 1, 2, COL.gDk); R(x - 2 - i, ly - 2 - (i >> 1), 1, 2, COL.gMd); }
        }
        ell(x + 3, base - 22, 3, 5, COL.gold); R(x + 1, base - 27, 4, 3, COL.gDk);
      },
      wheat(x, base) {
        for (let i = -3; i <= 3; i++) {
          const bx = x + i * 3, h = 18 + ((i + 3) % 3) * 3;
          R(bx, base - h, 1, h, COL.goldDk);
          for (let k = 0; k < 6; k++) R(bx - 1, base - h - k * 2, 3, 2, k % 2 ? COL.gold : COL.goldLt);
        }
      },
      carrot(x, base) {
        ell(x, base - 1, 4, 2, COL.orange);
        for (let i = -3; i <= 3; i++) {
          const fx = x + i * 2, h = 11 + (i & 1 ? 2 : 0);
          for (let k = 0; k < h; k++) R(fx + Math.round(i * 0.35 * k / h), base - 2 - k, 1, 1, k % 2 ? COL.gLt : COL.gMd);
        }
      },
      tomato(x, base) {
        R(x, base - 24, 1, 24, COL.brown);
        ell(x, base - 13, 8, 7, COL.gDk); ell(x - 4, base - 17, 5, 4, COL.gMd); ell(x + 4, base - 9, 5, 4, COL.gLt);
        [[-3, -10], [4, -14], [0, -6], [-5, -16]].forEach((f) => {
          R(x + f[0], base + f[1], 3, 3, COL.red);
          R(x + f[0] + 2, base + f[1], 1, 1, COL.red2);
        });
      },
      lavender(x, base) {
        for (let i = -3; i <= 3; i++) {
          const bx = x + i * 2, h = 13 + ((i + 3) % 2) * 3;
          R(bx, base - h, 1, h, COL.gMd); R(bx - 1, base - h - 3, 2, 4, COL.purple); R(bx - 1, base - h - 5, 2, 2, COL.lilac);
        }
      },
      bush(x, base) {
        ell(x, base - 6, 7, 6, COL.gMd); ell(x - 3, base - 8, 4, 3, COL.gLt);
        ell(x + 3, base - 5, 4, 3, COL.gDk); ell(x, base - 10, 4, 3, COL.gLt2);
      },
      leafy(x, base) {
        ell(x, base - 4, 9, 5, COL.gDk); ell(x, base - 6, 6, 4, COL.gMd); ell(x, base - 8, 3, 2, COL.gLt2);
      },
      strawberry(x, base) {
        ell(x, base - 3, 9, 4, COL.gMd); ell(x - 3, base - 4, 4, 3, COL.gDk); ell(x + 4, base - 3, 4, 3, COL.gLt);
        [[-4, -2], [3, -3], [0, -5]].forEach((f) => { R(x + f[0], base + f[1], 2, 3, COL.red); });
        R(x - 6, base - 6, 2, 2, COL.white); R(x + 5, base - 5, 2, 2, COL.white);
      },
      blueberry(x, base) {
        ell(x, base - 8, 8, 7, COL.gDk); ell(x - 3, base - 11, 4, 3, COL.gMd); ell(x + 4, base - 6, 4, 3, COL.gLt);
        [[-3, -8], [3, -10], [0, -6], [-5, -5]].forEach((f) => {
          R(x + f[0], base + f[1], 2, 2, COL.blue); R(x + f[0], base + f[1], 1, 1, COL.blueLt);
        });
      },
      tulip(x, base, col) {
        R(x, base - 15, 1, 15, COL.gMd); R(x - 3, base - 8, 3, 2, COL.gDk); R(x + 1, base - 11, 3, 2, COL.gMd);
        R(x - 2, base - 20, 5, 5, col); R(x - 1, base - 21, 1, 1, col); R(x + 1, base - 21, 1, 1, col);
      },
      sprout(x, base) {
        R(x, base - 5, 1, 5, COL.gMd); R(x - 2, base - 6, 2, 2, COL.gLt); R(x + 1, base - 7, 2, 2, COL.gLt2);
      },
    };
    const TULIPS = ['#e2472f', '#e8557f', '#eac24e', '#8a5bb0'];
    const TALL = { sunflower: 1, corn: 1, wheat: 1 };
    const POS5 = [[.28, .3], [.72, .3], [.5, .52], [.3, .76], [.72, .76]];
    const POS3 = [[.32, .34], [.7, .4], [.5, .72]];

    // ── props ──
    const fencePost = (p) => {
      R(p.x - 1, p.y - 11, 3, 11, COL.wood); R(p.x - 1, p.y - 11, 3, 2, COL.woodHi); R(p.x - 2, p.y - 8, 5, 2, COL.woodMed);
    };
    const tree = (x, base) => {
      R(x - 2, base - 16, 4, 16, COL.brown); R(x - 2, base - 16, 2, 16, '#5e3720');
      ell(x, base - 24, 13, 9, COL.gDk); ell(x - 6, base - 22, 8, 6, COL.gMd);
      ell(x + 6, base - 26, 8, 6, COL.gMd); ell(x, base - 30, 9, 6, COL.gLt);
      [[-6, -24], [5, -27], [-2, -31]].forEach((f) => R(x + f[0], base + f[1], 2, 2, COL.red));
    };

    // ── beds from real UserPlant records ──
    const beds = userPlants.slice(0, cols * rows).map((up, i) => {
      const gx = i % cols, gy = Math.floor(i / cols);
      const cs = 1 + gx * 3, rs = 1 + gy * 3;
      const c = iso(cs + 1, rs + 1);
      return { up, i, cs, rs, x: c.x, y: c.y - RAISE, sprite: spriteFor(up.plant_name) };
    });
    bedsRef.current = beds;

    const drawBed = (bed) => {
      const cx = bed.x, cyTop = bed.y;
      const selected = selRef.current === bed.i;
      ell(cx, cyTop + RAISE + 3, TW - 2, TH - 3, '#1e1408', 0.14);
      isoBox(cx, cyTop, TW, RAISE, selected ? COL.heat : COL.wood, COL.woodDk, COL.woodMed);
      dia(cx, cyTop, TW - 4, TH - 2, COL.soil);
      for (let k = 1; k <= 3; k++) { const v = k / 4; ln(surf(bed, 0.12, v), surf(bed, 0.88, v), COL.soilDk); }

      if (bed.up.status === 'planned') {
        for (let k = 1; k <= 3; k++) {
          const v = k / 4, a = surf(bed, 0.14, v), b = surf(bed, 0.86, v);
          for (let t = 0; t <= 6; t++)
            R(Math.round(a.x + (b.x - a.x) * t / 6), Math.round(a.y + (b.y - a.y) * t / 6), 1, 1, '#3a2413');
        }
        [[.3, .4], [.6, .55], [.4, .7]].forEach((p) => { const pt = surf(bed, p[0], p[1]); P.sprout(pt.x, pt.y); });
      } else {
        const pts = (TALL[bed.sprite] ? POS3 : POS5).slice().sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
        pts.forEach((p, k) => {
          const pt = surf(bed, p[0], p[1]);
          if (bed.sprite === 'tulip') P.tulip(pt.x, pt.y, TULIPS[k % 4]);
          else (P[bed.sprite] || P.bush)(pt.x, pt.y);
        });
      }
    };

    // ── scene ──
    ctx.clearRect(0, 0, W, H);
    R(0, 0, W, H, night ? COL.night : COL.peach);

    const tiles = [];
    for (let col = 0; col < NXT; col++) for (let row = 0; row < NYT; row++) tiles.push([col, row]);
    tiles.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    tiles.forEach(([col, row]) => {
      const cx = ORIGX + (col - row) * HW, cy = ORIGY + (col + row + 1) * HH;
      const path = col % 3 === 0 || row % 3 === 0;
      const c = path
        ? ((col + row) & 1 ? COL.dirt : COL.dirt2)
        : ((col + row) & 1 ? COL.grassA : COL.grassB);
      dia(cx, cy, HW + 1, HH + 1, c);
      if (!path && rnd() < 0.18) R(cx + ((rnd() * 10 - 5) | 0), cy + ((rnd() * 4 - 2) | 0), 1, 1, COL.gDk);
    });

    for (let k = 0; k <= NXT; k++) fencePost(iso(k, 0));
    for (let k = 0; k <= NYT; k++) fencePost(iso(0, k));
    tree(iso(2, -1).x, iso(2, -1).y + 6);
    tree(iso(-1, 3).x, iso(-1, 3).y + 6);

    beds.slice().sort((a, b) => (a.cs + a.rs) - (b.cs + b.rs)).forEach(drawBed);

    if (night) R(0, 0, W, H, '#0a1428', 0.42);
  }, [userPlants, night, cols, rows, NXT, NYT, W, H, ORIGX]);

  useEffect(() => { draw(); }, [draw]);

  const handleClick = (e) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const lx = (e.clientX - r.left) * (W / r.width);
    const ly = (e.clientY - r.top) * (H / r.height);
    const hit = bedsRef.current
      .slice()
      .sort((a, b) => (b.cs + b.rs) - (a.cs + a.rs))
      .find((b) => Math.abs(lx - b.x) / TW + Math.abs(ly - b.y) / TH <= 1.05);
    selRef.current = hit ? hit.i : -1;
    draw();
    if (onSelectBed) onSelectBed(hit ? hit.up : null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      onClick={handleClick}
      style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated', cursor: 'pointer' }}
    />
  );
}