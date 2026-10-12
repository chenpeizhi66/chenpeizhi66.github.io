import type Phaser from 'phaser';
import { paintTexture } from './art.ts';
import { drawPixelText, pixelTextSize } from './pixelFont.ts';
import { GROUND_Y, platforms, WORLD_H, WORLD_W } from './level.ts';

/** Props the scene animates. Coordinates stay in this file so the art lines up. */
export const life = {
  flag: { x: 482, y: GROUND_Y - 132 },
  fountain: { x: 2410, y: GROUND_Y - 22 },
  incline: { x0: 1568, y0: 174, x1: 1704, y1: 128 },
};

export const gulls = [
  { x: 280, y: 40, speed: 18, phase: 0.4 },
  { x: 860, y: 28, speed: 26, phase: 1.6 },
  { x: 1640, y: 36, speed: 16, phase: 2.5 },
  { x: 2240, y: 26, speed: 22, phase: 0.9 },
];

export const placeLabels = [
  { id: 'coast', text: 'THE COAST' },
  { id: 'dalian', text: 'DALIAN' },
  { id: 'crossing', text: 'CROSSING' },
  { id: 'pittsburgh', text: 'PITTSBURGH' },
] as const;

export function placeFor(x: number): (typeof placeLabels)[number] {
  let u = x % WORLD_W;
  if (u < 0) u += WORLD_W;
  if (u < 180 || u >= 2580) return placeLabels[0];
  if (u < 980) return placeLabels[1];
  if (u < 1560) return placeLabels[2];
  return placeLabels[3];
}

function mix(from: string, to: string, t: number): string {
  const amount = Math.min(1, Math.max(0, t));
  const channel = (start: number) => {
    const a = Number.parseInt(from.slice(start, start + 2), 16);
    const b = Number.parseInt(to.slice(start, start + 2), 16);
    return Math.round(a + (b - a) * amount);
  };
  return `rgb(${channel(1)}, ${channel(3)}, ${channel(5)})`;
}

function wave(x: number, cycles: number): number {
  return Math.sin((x / WORLD_W) * cycles * Math.PI * 2);
}

/** 1 on the Dalian coast, 0 in Pittsburgh, matching again at both ends of the loop. */
function coastal(x: number): number {
  const u = x / WORLD_W;
  if (u < 0.3) return 1;
  if (u < 0.48) return 1 - (u - 0.3) / 0.18;
  if (u < 0.78) return 0;
  if (u < 0.92) return (u - 0.78) / 0.14;
  return 1;
}

function hash(n: number): number {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  ctx.fillStyle = color;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(1, Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    ctx.fillRect(Math.round(x0 + dx * t), Math.round(y0 + dy * t), 1, 1);
  }
}

function pane(x: number, y: number, glass: string): string {
  return hash(x * 19 + y * 7) > 0.84 ? '#ffe3a6' : glass;
}

function drawTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  body: string,
  glass: string,
  trim: string,
): void {
  const top = GROUND_Y - h;
  ctx.fillStyle = body;
  ctx.fillRect(x, top, w, h);
  ctx.fillStyle = trim;
  ctx.fillRect(x, top, 2, h);
  ctx.fillStyle = mix(body, '#1c242c', 0.35);
  ctx.fillRect(x + w - 3, top, 3, h);
  for (let row = top + 6; row < GROUND_Y - 10; row += 8) {
    for (let col = x + 4; col < x + w - 6; col += 6) {
      ctx.fillStyle = pane(col, row, glass);
      ctx.fillRect(col, row, 3, 4);
    }
  }
  ctx.fillStyle = trim;
  ctx.fillRect(x + Math.floor(w / 2) - 1, top - 12, 2, 12);
  ctx.fillRect(x + Math.floor(w / 2) - 4, top - 12, 8, 1);
  ctx.fillRect(x + 2, top, w - 4, 2);
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  wall: string,
  roof: string,
  glass: string,
): void {
  const top = GROUND_Y - h;
  ctx.fillStyle = roof;
  ctx.fillRect(x - 3, top - 6, w + 6, 7);
  ctx.fillStyle = mix(roof, '#1c1c1c', 0.25);
  for (let col = x - 2; col < x + w + 2; col += 4) ctx.fillRect(col, top - 5, 1, 5);
  ctx.fillStyle = wall;
  ctx.fillRect(x, top, w, h);
  ctx.fillStyle = mix(wall, '#ffffff', 0.35);
  ctx.fillRect(x, top, 2, h);
  ctx.fillStyle = mix(wall, '#1c1c1c', 0.2);
  ctx.fillRect(x + w - 2, top, 2, h);
  for (let row = top + 8; row < GROUND_Y - 14; row += 12) {
    for (let col = x + 6; col < x + w - 8; col += 12) {
      ctx.fillStyle = pane(col, row, glass);
      ctx.fillRect(col, row, 6, 6);
      ctx.fillStyle = mix(wall, '#ffffff', 0.2);
      ctx.fillRect(col + 4, row - 2, 8, 2);
    }
  }
  ctx.fillStyle = mix(wall, '#1c1c1c', 0.15);
  ctx.fillRect(x + Math.floor(w / 2) - 5, GROUND_Y - 14, 10, 14);
}

function drawPine(ctx: CanvasRenderingContext2D, x: number, leaf: string, scale = 1): void {
  const trunk = Math.round(16 * scale);
  ctx.fillStyle = '#5c4030';
  ctx.fillRect(x + 5, GROUND_Y - trunk, 3, trunk);
  ctx.fillStyle = leaf;
  ctx.fillRect(x + 3, GROUND_Y - trunk - 10, 8, 8);
  ctx.fillRect(x, GROUND_Y - trunk - 18, 14, 8);
  ctx.fillRect(x + 3, GROUND_Y - trunk - 26, 8, 8);
  ctx.fillStyle = mix(leaf, '#1c1c1c', 0.25);
  ctx.fillRect(x + 8, GROUND_Y - trunk - 16, 4, 14);
}

function drawLighthouse(ctx: CanvasRenderingContext2D, x: number): void {
  ctx.fillStyle = '#e7e1d6';
  ctx.fillRect(x, GROUND_Y - 78, 16, 78);
  ctx.fillStyle = '#c4503c';
  ctx.fillRect(x - 1, GROUND_Y - 78, 18, 5);
  ctx.fillRect(x - 1, GROUND_Y - 48, 18, 4);
  ctx.fillStyle = '#9ec4d8';
  ctx.fillRect(x + 4, GROUND_Y - 70, 8, 6);
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(x + 2, GROUND_Y - 92, 12, 14);
  ctx.fillStyle = '#ffe3a6';
  ctx.fillRect(x + 5, GROUND_Y - 88, 6, 6);
  ctx.fillStyle = '#c4503c';
  ctx.fillRect(x - 2, GROUND_Y - 98, 20, 6);
  ctx.fillRect(x + 6, GROUND_Y - 108, 4, 10);
}

function drawBridge(ctx: CanvasRenderingContext2D, x: number, span: number): void {
  const deck = GROUND_Y - 58;
  ctx.fillStyle = '#e7eef3';
  ctx.fillRect(x, deck, span, 5);
  ctx.fillStyle = '#c5d0da';
  ctx.fillRect(x, deck + 5, span, 2);
  const pylons = [x + Math.round(span * 0.28), x + Math.round(span * 0.68)];
  for (const pylon of pylons) {
    ctx.fillStyle = '#f7f8f8';
    ctx.fillRect(pylon, deck - 70, 8, 74);
    ctx.fillStyle = '#d5dbe2';
    ctx.fillRect(pylon + 6, deck - 70, 2, 74);
    ctx.fillRect(pylon - 6, deck - 52, 20, 3);
    for (let i = -3; i <= 3; i += 1) {
      line(ctx, pylon + 4, deck - 66, pylon + 4 + i * 18, deck, '#9aa8b4');
    }
  }
  ctx.fillStyle = '#dfe6ec';
  ctx.fillRect(x + 16, deck + 7, 5, GROUND_Y - deck - 7);
  ctx.fillRect(x + span - 22, deck + 7, 5, GROUND_Y - deck - 7);
}

function drawShip(ctx: CanvasRenderingContext2D, x: number): void {
  const y = GROUND_Y - 46;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 10, y + 8, 8, 1);
  ctx.fillRect(x - 18, y + 12, 10, 1);
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(x, y, 46, 10);
  ctx.fillStyle = '#d5dbe2';
  ctx.fillRect(x + 4, y + 8, 38, 2);
  ctx.fillStyle = '#2f4f66';
  ctx.fillRect(x + 8, y - 12, 22, 12);
  ctx.fillRect(x + 32, y - 7, 8, 7);
  ctx.fillStyle = '#9ec4d8';
  ctx.fillRect(x + 12, y - 8, 4, 4);
  ctx.fillRect(x + 18, y - 8, 4, 4);
  ctx.fillStyle = '#c4503c';
  ctx.fillRect(x + 14, y - 20, 2, 8);
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x + 6, y + 10, 6, 3);
}

function drawMonument(ctx: CanvasRenderingContext2D, x: number): void {
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(x, GROUND_Y - 12, 78, 12);
  ctx.fillRect(x + 8, GROUND_Y - 22, 62, 10);
  ctx.fillRect(x + 20, GROUND_Y - 46, 38, 24);
  ctx.fillStyle = '#e4ddd0';
  for (let col = x + 24; col < x + 54; col += 8) ctx.fillRect(col, GROUND_Y - 42, 3, 18);
  ctx.fillStyle = '#c4503c';
  ctx.fillRect(x + 36, GROUND_Y - 62, 6, 16);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(x + 30, GROUND_Y - 70, 18, 8);
}

function brickWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, brick: string): void {
  ctx.fillStyle = brick;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ead8c8';
  for (let row = y; row < y + h; row += 5) {
    ctx.fillRect(x, row, w, 1);
    const offset = Math.floor((row - y) / 5) % 2 === 0 ? 0 : 5;
    for (let col = x + offset; col < x + w; col += 10) ctx.fillRect(col, row, 1, 5);
  }
}

function drawHillside(ctx: CanvasRenderingContext2D): void {
  const x0 = 1508;
  const x1 = 1736;
  for (let x = x0; x < x1; x += 1) {
    const t = (x - x0) / (x1 - x0);
    const top = Math.round(198 - Math.sin(t * Math.PI) * 62);
    ctx.fillStyle = mix('#7d8a62', '#6a5848', t);
    ctx.fillRect(x, top, 1, GROUND_Y - top);
  }
  const homes = [
    { x: 1536, w: 34, h: 28 },
    { x: 1576, w: 30, h: 36 },
    { x: 1612, w: 36, h: 30 },
    { x: 1654, w: 28, h: 40 },
    { x: 1688, w: 32, h: 26 },
  ];
  for (const home of homes) {
    const t = (home.x + home.w / 2 - x0) / (x1 - x0);
    const base = Math.round(198 - Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) * 62);
    const top = base - home.h;
    brickWall(ctx, home.x, top + 4, home.w, home.h - 4, hash(home.x) > 0.5 ? '#b5644c' : '#c9846a');
    ctx.fillStyle = '#6e4034';
    ctx.fillRect(home.x - 2, top, home.w + 4, 5);
    ctx.fillStyle = '#f6e7c4';
    ctx.fillRect(home.x + 6, top + 10, 5, 5);
    ctx.fillRect(home.x + home.w - 12, top + 10, 5, 5);
  }
  line(ctx, life.incline.x0, life.incline.y0, life.incline.x1, life.incline.y1, '#3a342e');
  line(ctx, life.incline.x0 + 6, life.incline.y0, life.incline.x1 + 6, life.incline.y1, '#3a342e');
  for (let i = 0; i <= 6; i += 1) {
    const t = i / 6;
    const x = Math.round(life.incline.x0 + (life.incline.x1 - life.incline.x0) * t);
    const y = Math.round(life.incline.y0 + (life.incline.y1 - life.incline.y0) * t);
    ctx.fillStyle = '#5c5348';
    ctx.fillRect(x, y, 8, 2);
  }
}

function drawTruss(ctx: CanvasRenderingContext2D, x: number, span: number): void {
  const deck = GROUND_Y - 8;
  ctx.fillStyle = '#e2b84a';
  ctx.fillRect(x, deck, span, 8);
  ctx.fillStyle = '#c7962e';
  ctx.fillRect(x, deck, span, 2);
  ctx.fillRect(x, GROUND_Y - 32, span, 3);
  for (let col = x; col < x + span; col += 16) {
    ctx.fillRect(col, GROUND_Y - 32, 2, 24);
    line(ctx, col, GROUND_Y - 32, col + 16, deck, '#c7962e');
  }
  ctx.fillStyle = '#8d8378';
  ctx.fillRect(x + 10, GROUND_Y - 46, 8, 16);
  ctx.fillRect(x + span - 18, GROUND_Y - 46, 8, 16);
}

function drawHall(ctx: CanvasRenderingContext2D, x: number, w: number, h: number): void {
  const top = GROUND_Y - h;
  for (let i = 0; i < 12; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#f7f4ee' : '#e7e1d4';
    ctx.fillRect(x + i, top - 12 + i, w - i * 2, 1);
  }
  ctx.fillStyle = '#f3efe6';
  ctx.fillRect(x, top, w, h);
  ctx.fillStyle = '#e4ddd0';
  ctx.fillRect(x, top, w, 6);
  for (let col = x + 8; col < x + w - 10; col += 14) {
    ctx.fillStyle = '#ded6c8';
    ctx.fillRect(col, top + 10, 5, h - 22);
    ctx.fillStyle = '#9ec4d8';
    ctx.fillRect(col + 1, top + 16, 3, 8);
  }
  ctx.fillStyle = '#c4503c';
  ctx.fillRect(x + Math.floor(w / 2) - 4, GROUND_Y - 16, 8, 16);
}

function drawSteelTower(ctx: CanvasRenderingContext2D, x: number): void {
  const h = 128;
  const w = 28;
  const top = GROUND_Y - h;
  ctx.fillStyle = '#2c3844';
  ctx.fillRect(x, top, w, h);
  ctx.fillStyle = '#465868';
  ctx.fillRect(x, top, 3, h);
  for (let i = 0; i < 18; i += 1) {
    const inset = Math.floor(i / 2);
    ctx.fillStyle = i > 12 ? '#d7e4ee' : '#3d4c5c';
    ctx.fillRect(x + inset, top - i, w - inset * 2, 1);
  }
  ctx.fillStyle = '#d7e4ee';
  for (let row = top + 8; row < GROUND_Y - 12; row += 8) {
    ctx.fillRect(x + 6, row, 4, 3);
    ctx.fillRect(x + 14, row, 4, 3);
    ctx.fillRect(x + 20, row, 3, 3);
  }
}

function drawGlassCastle(ctx: CanvasRenderingContext2D, x: number): void {
  const spikes = [46, 78, 54, 108, 62, 84, 40];
  let cursor = x;
  for (const h of spikes) {
    const top = GROUND_Y - h;
    ctx.fillStyle = '#d5eaf4';
    ctx.fillRect(cursor, top, 12, h);
    ctx.fillStyle = '#f7fbfe';
    ctx.fillRect(cursor, top, 2, h);
    ctx.fillStyle = '#8fb4c6';
    ctx.fillRect(cursor + 10, top, 2, h);
    for (let row = top + 6; row < GROUND_Y - 8; row += 8) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cursor + 4, row, 4, 3);
    }
    ctx.fillStyle = '#f7fbfe';
    ctx.fillRect(cursor + 4, top - 10, 4, 10);
    ctx.fillRect(cursor + 5, top - 16, 2, 6);
    cursor += 14;
  }
}

function drawSign(ctx: CanvasRenderingContext2D, x: number, text: string): void {
  ctx.fillStyle = '#6b4a32';
  ctx.fillRect(x, GROUND_Y - 46, 3, 40);
  const size = pixelTextSize(text, 2);
  const w = size.width + 8;
  const h = size.height + 6;
  const y = GROUND_Y - 52 - h;
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x - 6, y, w, h);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(x - 5, y + 1, w - 2, h - 2);
  drawPixelText(ctx, text, x - 2, y + 3, '#1c1c1c', 2);
}

function drawBus(ctx: CanvasRenderingContext2D, x: number): void {
  const y = GROUND_Y - 34;
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(x, y, 58, 22);
  ctx.fillStyle = '#c4503c';
  ctx.fillRect(x, y + 8, 58, 3);
  ctx.fillStyle = '#24344a';
  ctx.fillRect(x + 4, y + 2, 10, 6);
  ctx.fillRect(x + 16, y + 2, 10, 6);
  ctx.fillRect(x + 28, y + 2, 10, 6);
  ctx.fillRect(x + 40, y + 2, 12, 6);
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x + 6, y + 20, 10, 6);
  ctx.fillRect(x + 40, y + 20, 10, 6);
  ctx.fillStyle = '#d5dbe2';
  ctx.fillRect(x + 8, y + 22, 6, 3);
  ctx.fillRect(x + 42, y + 22, 6, 3);
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, color: string): void {
  const y = GROUND_Y - 18;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 24, 8);
  ctx.fillStyle = '#d7eef8';
  ctx.fillRect(x + 3, y + 1, 7, 4);
  ctx.fillRect(x + 13, y + 1, 7, 4);
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x + 2, y + 7, 5, 3);
  ctx.fillRect(x + 16, y + 7, 5, 3);
}

function drawFarSkyline(ctx: CanvasRenderingContext2D): void {
  const coasts: readonly [number, number, number][] = [
    [250, 16, 26],
    [274, 12, 38],
    [296, 20, 22],
  ];
  for (const [x, w, h] of coasts) {
    ctx.fillStyle = '#b7d7ea';
    ctx.fillRect(x, 154 - h, w, h);
    ctx.fillStyle = '#e7f4fb';
    for (let row = 154 - h + 4; row < 150; row += 6) ctx.fillRect(x + 3, row, 2, 2);
  }
  const downtown: readonly [number, number, number][] = [
    [1848, 14, 36],
    [1868, 10, 52],
    [1884, 16, 28],
    [1906, 12, 44],
  ];
  for (const [x, w, h] of downtown) {
    ctx.fillStyle = '#c5d0d8';
    ctx.fillRect(x, 150 - h, w, h);
    ctx.fillStyle = '#eef3f6';
    for (let row = 150 - h + 4; row < 146; row += 6) ctx.fillRect(x + 3, row, 2, 2);
  }
}

function drawFountain(ctx: CanvasRenderingContext2D): void {
  const x = life.fountain.x;
  ctx.fillStyle = '#d5dbe2';
  ctx.fillRect(x - 10, GROUND_Y - 10, 28, 6);
  ctx.fillStyle = '#9ec4d8';
  ctx.fillRect(x - 6, GROUND_Y - 14, 20, 4);
  ctx.fillStyle = '#e7f6ff';
  ctx.fillRect(x + 2, life.fountain.y, 2, GROUND_Y - 14 - life.fountain.y);
}

export function drawWorld(ctx: CanvasRenderingContext2D): void {
  for (let x = 0; x < WORLD_W; x += 4) {
    const coast = coastal(x);
    ctx.fillStyle = mix('#c5d5df', '#b9e3f6', coast);
    ctx.fillRect(x, 0, 4, 78);
    ctx.fillStyle = mix('#e4edf1', '#e7f6fc', coast);
    ctx.fillRect(x, 78, 4, WORLD_H - 78);
  }

  ctx.fillStyle = '#fff6d8';
  for (let py = -11; py <= 11; py += 1) {
    const half = Math.round(Math.sqrt(121 - py * py));
    ctx.fillRect(560 - half, 58 + py, half * 2, 1);
  }

  for (let x = 0; x < WORLD_W; x += 1) {
    const far = 96 + Math.round(16 * wave(x, 2) + 6 * wave(x, 4));
    ctx.fillStyle = mix('#aebaae', '#8fc6de', coastal(x));
    ctx.fillRect(x, far, 1, 146 - far);
  }

  for (let x = 0; x < WORLD_W; x += 1) {
    const hill = 132 + Math.round(12 * wave(x, 3) + 5 * wave(x, 6));
    ctx.fillStyle = mix('#738868', '#6ea6c4', coastal(x));
    ctx.fillRect(x, hill, 1, GROUND_Y - 28 - hill);
  }

  drawFarSkyline(ctx);

  for (let x = 0; x < WORLD_W; x += 1) {
    const coast = coastal(x);
    const surface = Math.round(178 - coast * 22 + wave(x, 5) * 2);
    if (surface >= GROUND_Y - 4) continue;
    ctx.fillStyle = mix('#3d6274', '#7eb6d4', coast);
    ctx.fillRect(x, surface, 1, GROUND_Y - surface);
    ctx.fillStyle = mix('#6e8ea0', '#d7f1fb', coast);
    ctx.fillRect(x, surface, 1, 1);
    if (Math.floor(x / 14) % 3 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, surface + 1, 4, 1);
    }
    if (Math.floor(x / 22) % 2 === 0) {
      ctx.fillStyle = mix('#ffffff', '#d5eaf4', coast);
      ctx.fillRect(x, surface + 5, 6, 1);
    }
  }

  drawLighthouse(ctx, 196);
  drawBlock(ctx, 236, 58, 52, '#f6f1e8', '#c4503c', '#f0d7a4');
  drawBlock(ctx, 302, 48, 66, '#f3efe6', '#8d5a45', '#f2d48a');
  drawTower(ctx, 440, 24, 100, '#f7f8f8', '#8eb7d2', '#d5dbe0');
  drawTower(ctx, 472, 22, 118, '#e7eef3', '#6fa4c6', '#c5ced6');
  drawBlock(ctx, 504, 70, 48, '#f7f4ee', '#c4503c', '#f0d7a4');
  drawBridge(ctx, 600, 230);
  drawTower(ctx, 860, 30, 84, '#f4f7f8', '#9ec6da', '#d0d7de');
  drawMonument(ctx, 930);
  drawBlock(ctx, 1024, 108, 40, '#e7eef2', '#5f6a73', '#d5e2ea');
  drawShip(ctx, 1168);

  ctx.fillStyle = '#5c656c';
  ctx.fillRect(life.flag.x, life.flag.y, 1, 16);

  drawHillside(ctx);
  drawTruss(ctx, 1752, 192);
  drawHall(ctx, 1964, 104, 64);
  drawSteelTower(ctx, 2088);
  drawTower(ctx, 2136, 20, 74, '#4d5d6e', '#d7e4ee', '#31404c');
  drawGlassCastle(ctx, 2208);
  drawBlock(ctx, 2320, 70, 46, '#c9846a', '#6e4034', '#f6e7c4');
  drawFountain(ctx);
  drawBlock(ctx, 2448, 64, 42, '#d7b89a', '#f2f0ea', '#f6e2bf');

  const pines: readonly [number, string, number][] = [
    [64, '#2f6a4e', 1],
    [140, '#3e7c5c', 0.85],
    [1248, '#7d8a4e', 1],
    [1472, '#c48a3a', 0.95],
    [2588, '#c46a32', 1],
    [2712, '#d89a3a', 0.9],
    [2848, '#6d8a52', 1],
    [2976, '#3e7c5c', 0.85],
    [3064, '#2f6a4e', 1],
    [3140, '#3e7c5c', 0.85],
  ];
  for (const [x, leaf, scale] of pines) drawPine(ctx, x, leaf, scale);

  for (let x = 1180; x < 1540; x += 36) {
    const warm = (x - 1180) / 360;
    ctx.fillStyle = mix('#d5dbe2', '#3a342e', warm);
    ctx.fillRect(x, GROUND_Y - 28, 2, 22);
    ctx.fillStyle = mix('#f4e7b2', '#e2b84a', warm);
    ctx.fillRect(x - 3, GROUND_Y - 32, 8, 4);
  }

  drawSign(ctx, 1512, 'RIVER');

  for (let x = 0; x < WORLD_W; x += 4) {
    const coast = coastal(x);
    ctx.fillStyle = mix('#6b5344', '#4e6a45', coast);
    ctx.fillRect(x, GROUND_Y, 4, WORLD_H - GROUND_Y);
    if (hash(x) > 0.62) {
      ctx.fillStyle = mix('#8a6a48', '#6d8a5c', coast);
      ctx.fillRect(x, GROUND_Y + 6 + Math.floor(hash(x + 9) * 16), 2, 2);
    }
  }
  for (let x = 0; x < WORLD_W; x += 2) {
    const coast = coastal(x);
    const onBridge = x >= 1752 && x < 1944;
    if (onBridge) continue;
    ctx.fillStyle = coast > 0.55 ? (Math.floor(x / 16) % 2 === 0 ? '#e4ddd0' : '#d4cdc0') : coast > 0.2 ? '#5e584f' : '#8d735c';
    ctx.fillRect(x, GROUND_Y - 6, 2, 6);
    if (coast > 0.55 && x % 16 === 0) {
      ctx.fillStyle = '#c9c1b4';
      ctx.fillRect(x, GROUND_Y - 6, 1, 6);
    }
    if (coast <= 0.55 && coast >= 0.18 && Math.floor(x / 18) % 2 === 0) {
      ctx.fillStyle = '#f4f1ea';
      ctx.fillRect(x, GROUND_Y - 4, 8, 2);
    }
  }

  for (let x = 120; x < 186; x += 10) {
    ctx.fillStyle = '#d5dbe2';
    ctx.fillRect(x, GROUND_Y - 16, 1, 10);
    ctx.fillRect(x, GROUND_Y - 16, 8, 1);
  }

  const blooms = [210, 268, 620, 900, 1144, 2880, 3010];
  for (const x of blooms) {
    ctx.fillStyle = '#3f6b45';
    ctx.fillRect(x, GROUND_Y - 12, 1, 6);
    ctx.fillStyle = x > 2500 ? '#e2b84a' : '#d24b6a';
    ctx.fillRect(x - 1, GROUND_Y - 14, 3, 2);
  }

  drawCar(ctx, 1224, '#c4503c');
  drawCar(ctx, 1372, '#24344a');
  drawBus(ctx, 1436);

  for (const platform of platforms.slice(1)) {
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(platform.x - 1, platform.y - 1, platform.w + 2, platform.h + 2);
    ctx.fillStyle = '#e7d7b8';
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#f7f4ee';
    ctx.fillRect(platform.x, platform.y, platform.w, 3);
    ctx.fillStyle = '#8d735c';
    ctx.fillRect(platform.x, platform.y + platform.h - 3, platform.w, 3);
    for (let col = platform.x + 4; col < platform.x + platform.w - 2; col += 8) {
      ctx.fillStyle = '#c4a574';
      ctx.fillRect(col, platform.y + 6, 2, 2);
    }
  }
}

export function paintCreatures(scene: Phaser.Scene): void {
  paintTexture(scene, 'gull-0', 22, 12, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, 2, 5, 2);
    ctx.fillRect(16, 2, 5, 2);
    ctx.fillRect(7, 5, 8, 3);
    ctx.fillStyle = '#d7dee6';
    ctx.fillRect(8, 8, 6, 2);
    ctx.fillStyle = '#e2b84a';
    ctx.fillRect(11, 7, 2, 2);
  });
  paintTexture(scene, 'gull-1', 22, 12, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 6, 6, 2);
    ctx.fillRect(16, 6, 6, 2);
    ctx.fillRect(7, 4, 8, 3);
    ctx.fillStyle = '#d7dee6';
    ctx.fillRect(8, 7, 6, 2);
    ctx.fillStyle = '#e2b84a';
    ctx.fillRect(11, 6, 2, 2);
  });
  paintTexture(scene, 'flag-0', 12, 8, (ctx) => {
    ctx.fillStyle = '#c4503c';
    ctx.fillRect(0, 0, 8, 2);
    ctx.fillRect(0, 2, 10, 2);
    ctx.fillRect(0, 4, 7, 2);
    ctx.fillRect(0, 6, 5, 2);
  });
  paintTexture(scene, 'flag-1', 12, 8, (ctx) => {
    ctx.fillStyle = '#c4503c';
    ctx.fillRect(0, 0, 5, 2);
    ctx.fillRect(0, 2, 8, 2);
    ctx.fillRect(0, 4, 11, 2);
    ctx.fillRect(0, 6, 7, 2);
  });
  paintTexture(scene, 'incline-car', 18, 12, (ctx) => {
    ctx.fillStyle = '#c4503c';
    ctx.fillRect(1, 2, 16, 7);
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(3, 3, 4, 4);
    ctx.fillRect(9, 3, 4, 4);
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(3, 9, 3, 2);
    ctx.fillRect(12, 9, 3, 2);
  });
  paintTexture(scene, 'drop', 3, 3, (ctx) => {
    ctx.fillStyle = '#e7f6ff';
    ctx.fillRect(1, 0, 1, 3);
    ctx.fillRect(0, 1, 3, 1);
  });
}
