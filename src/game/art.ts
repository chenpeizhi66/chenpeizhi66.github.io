import type Phaser from 'phaser';
import { GROUND_Y, platforms, scenery, trees, WORLD_H, WORLD_W } from './level.ts';

const palette: Record<string, string> = {
  h: '#2a211c',
  s: '#f0c8a4',
  e: '#1c1c1c',
  t: '#24344a',
  p: '#3c3832',
  b: '#1c1c1c',
};

function frame(rows: readonly string[]): string[] {
  const body = rows.map((row) => {
    if (row.length !== 16) {
      throw new Error(`Sprite row must be 16 characters, got ${row.length}: ${row}`);
    }
    return row;
  });
  if (body.length > 24) {
    throw new Error('Sprite is taller than 24 pixels.');
  }
  const pad = Array.from({ length: 24 - body.length }, () => '................');
  return [...pad, ...body];
}

const idleOpen = frame([
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhsssshh....',
  '....hseesshh....',
  '....hssssshh....',
  '.....ssssss.....',
  '....tttttttt....',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '....tttttttt....',
  '....pp....pp....',
  '....pp....pp....',
  '....pp....pp....',
  '....pp....pp....',
  '....bb....bb....',
  '....bb....bb....',
]);

const idleShut = frame([
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhsssshh....',
  '....hssssshh....',
  '....hssssshh....',
  '.....ssssss.....',
  '....tttttttt....',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '....tttttttt....',
  '....pp....pp....',
  '....pp....pp....',
  '....pp....pp....',
  '....pp....pp....',
  '....bb....bb....',
  '....bb....bb....',
]);

const walkA = frame([
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhsssshh....',
  '....hseesshh....',
  '....hssssshh....',
  '.....ssssss.....',
  '....tttttttt....',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '....tttttttt....',
  '...tt......tt...',
  '..pp........pp..',
  '..pp........pp..',
  '..pp......pp....',
  '..bb......pp....',
  '..........bb....',
  '..........bb....',
]);

const walkB = frame([
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhsssshh....',
  '....hseesshh....',
  '....hssssshh....',
  '.....ssssss.....',
  '....tttttttt....',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '....tttttttt....',
  '....tt....tt....',
  '....pppppppp....',
  '....pp....pp....',
  '....pp....pp....',
  '....bb....bb....',
  '....bb....bb....',
  '................',
]);

const jump = frame([
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhsssshh....',
  '....hseesshh....',
  '....hssssshh....',
  '..s..ssssss..s..',
  '....tttttttt....',
  '...tttttttttt...',
  '...tttttttttt...',
  '...tttttttttt...',
  '....tttttttt....',
  '.....pppppp.....',
  '.....pp..pp.....',
  '.....pp..pp.....',
  '.....bb..bb.....',
  '.....bb..bb.....',
]);

export const playerFrames = {
  idle0: idleOpen,
  idle1: idleShut,
  walk0: walkA,
  walk1: walkB,
  walk2: walkA,
  jump0: jump,
};

function paintPixels(
  ctx: CanvasRenderingContext2D,
  rows: readonly string[],
  colors: Record<string, string>,
): void {
  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = colors[pixel];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  });
}

export function paintTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): void {
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) {
    throw new Error(`Could not create the ${key} texture.`);
  }
  const ctx = texture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  draw(ctx);
  texture.refresh();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  roof: string,
): void {
  const top = GROUND_Y - h;
  ctx.fillStyle = '#f7f5f1';
  ctx.fillRect(x, top, w, h);
  ctx.fillStyle = '#dedad3';
  ctx.fillRect(x, top, 3, h);
  ctx.fillStyle = roof;
  ctx.fillRect(x - 4, top - 5, w + 8, 5);
  ctx.fillRect(x + 10, top - 9, w - 20, 4);
  ctx.fillStyle = '#9ec3d4';
  for (let wx = x + 8; wx < x + w - 10; wx += 12) {
    ctx.fillRect(wx, top + 10, 6, 7);
    if (h > 56) ctx.fillRect(wx, top + 24, 6, 7);
  }
  ctx.fillStyle = '#3a342e';
  ctx.fillRect(x + Math.floor(w / 2) - 5, GROUND_Y - 16, 10, 16);
}

function drawTree(ctx: CanvasRenderingContext2D, x: number): void {
  ctx.fillStyle = '#6d4c34';
  ctx.fillRect(x + 5, GROUND_Y - 14, 3, 14);
  ctx.fillStyle = '#5e7c4c';
  ctx.fillRect(x, GROUND_Y - 30, 14, 18);
  ctx.fillStyle = '#73915d';
  ctx.fillRect(x + 2, GROUND_Y - 34, 10, 8);
}

export function drawWorld(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#e7f3f8';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = '#f4fafc';
  ctx.fillRect(0, 0, WORLD_W, 36);
  ctx.fillStyle = '#d7e7d6';
  for (let x = 0; x < WORLD_W; x += 1) {
    const hill = 46 + Math.round(10 * Math.sin(x / 48) + 6 * Math.sin(x / 19));
    ctx.fillRect(x, 78 - hill, 1, hill);
  }

  for (const x of trees) drawTree(ctx, x);

  for (const piece of scenery) {
    if (piece.kind === 'school') drawBuilding(ctx, piece.x, piece.w, piece.h, '#6d4e3d');
    if (piece.kind === 'workshop') {
      drawBuilding(ctx, piece.x, piece.w, piece.h, '#5e666c');
      ctx.fillStyle = '#5e666c';
      ctx.fillRect(piece.x + 18, GROUND_Y - piece.h - 22, 8, 18);
      ctx.fillRect(piece.x + 14, GROUND_Y - piece.h - 26, 16, 4);
    }
    if (piece.kind === 'lab') drawBuilding(ctx, piece.x, piece.w, piece.h, '#31445c');
    if (piece.kind === 'desk') {
      ctx.fillStyle = '#d7d2c8';
      ctx.fillRect(piece.x, GROUND_Y - 8, piece.w, 8);
      ctx.fillStyle = '#24344a';
      ctx.fillRect(piece.x + 10, GROUND_Y - 28, 16, 12);
      ctx.fillRect(piece.x + 40, GROUND_Y - 32, 16, 16);
      ctx.fillRect(piece.x + 70, GROUND_Y - 26, 16, 10);
      ctx.fillStyle = '#b7d4e4';
      ctx.fillRect(piece.x + 12, GROUND_Y - 26, 12, 8);
      ctx.fillRect(piece.x + 42, GROUND_Y - 30, 12, 12);
      ctx.fillRect(piece.x + 72, GROUND_Y - 24, 12, 6);
    }
  }

  ctx.fillStyle = '#8d6d49';
  ctx.fillRect(0, GROUND_Y + 4, WORLD_W, WORLD_H - GROUND_Y - 4);
  ctx.fillStyle = '#6f8f5b';
  ctx.fillRect(0, GROUND_Y, WORLD_W, 4);
  ctx.fillStyle = '#5d7a4b';
  for (let x = 0; x < WORLD_W; x += 5) {
    ctx.fillRect(x, GROUND_Y - 2, 1, 2);
  }

  for (const platform of platforms.slice(1)) {
    ctx.fillStyle = '#d9d4c8';
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#6f8f5b';
    ctx.fillRect(platform.x, platform.y, platform.w, 3);
    ctx.fillStyle = '#b7b1a4';
    ctx.fillRect(platform.x, platform.y + platform.h - 2, platform.w, 2);
  }
}

const iconRows: Record<string, string[]> = {
  book: [
    '................',
    '................',
    '....bbbbbbbb....',
    '...bssssssssb...',
    '...bsbbbbbbsb...',
    '...bssssssssb...',
    '...bsbbbbbbsb...',
    '...bssssssssb...',
    '....bbbbbbbb....',
    '................',
    '.......bb.......',
    '.......bb.......',
    '.......bb.......',
    '......bbbb......',
    '................',
    '................',
  ],
  gear: [
    '................',
    '......mmmm......',
    '....mmmmmmmm....',
    '...mmmmmmmmmm...',
    '..mmm.mmmm.mmm..',
    '..mmmmmmmmmmmm..',
    '..mmmm.mm.mmmm..',
    '..mmmmmmmmmmmm..',
    '..mmm.mmmm.mmm..',
    '...mmmmmmmmmm...',
    '....mmmmmmmm....',
    '......mmmm......',
    '.......bb.......',
    '.......bb.......',
    '......bbbb......',
    '................',
  ],
  screen: [
    '................',
    '..ssssssssssss..',
    '..s..........s..',
    '..s.cccccccc.s..',
    '..s.cccccccc.s..',
    '..s.cccccccc.s..',
    '..s.cccccccc.s..',
    '..s..........s..',
    '..ssssssssssss..',
    '......ssss......',
    '......ssss......',
    '....ssssssss....',
    '.......bb.......',
    '.......bb.......',
    '......bbbb......',
    '................',
  ],
  laptop: [
    '................',
    '................',
    '...llllllllll...',
    '...l........l...',
    '...l.ccccccll...',
    '...l.ccccccll...',
    '...l........l...',
    '...llllllllll...',
    '..llllllllllll..',
    '..l..........l..',
    '...llllllllll...',
    '.......bb.......',
    '.......bb.......',
    '......bbbb......',
    '................',
    '................',
  ],
};

const iconColors: Record<string, string> = {
  b: '#3a342e',
  s: '#f4efe4',
  m: '#8d9398',
  c: '#9ec3d4',
  l: '#24344a',
};

export function drawIcons(scene: Phaser.Scene): void {
  for (const [key, rows] of Object.entries(iconRows)) {
    paintTexture(scene, `icon-${key}`, 16, 16, (ctx) => {
      paintPixels(ctx, rows, iconColors);
    });
  }
}

export function drawPlayer(scene: Phaser.Scene): void {
  for (const [key, rows] of Object.entries(playerFrames)) {
    paintTexture(scene, key, 16, 24, (ctx) => {
      paintPixels(ctx, rows, palette);
    });
  }

  scene.anims.create({
    key: 'idle',
    frames: [{ key: 'idle0' }, { key: 'idle0' }, { key: 'idle0' }, { key: 'idle1' }],
    frameRate: 3,
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk',
    frames: [{ key: 'walk0' }, { key: 'walk1' }, { key: 'walk2' }, { key: 'walk1' }],
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'jump',
    frames: [{ key: 'jump0' }],
    frameRate: 1,
  });
}
