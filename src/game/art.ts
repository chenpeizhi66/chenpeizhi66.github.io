import Phaser from 'phaser';
import { drawPixelText, pixelTextSize } from './pixelFont.ts';

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
  scale = 1,
): void {
  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = colors[pixel];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
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
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
}


export function drawLabel(
  scene: Phaser.Scene,
  key: string,
  text: string,
  foreground: string,
  background: string,
  scale = 2,
): void {
  const textSize = pixelTextSize(text, scale);
  const width = textSize.width + 10;
  const height = textSize.height + 8;
  paintTexture(scene, key, width, height, (ctx) => {
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = background;
    ctx.fillRect(1, 1, width - 2, height - 2);
    drawPixelText(ctx, text, 5, 4, foreground, scale);
  });
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
    paintTexture(scene, `icon-${key}`, 32, 32, (ctx) => {
      paintPixels(ctx, rows, iconColors, 2);
    });
  }
}

export function drawPlayer(scene: Phaser.Scene): void {
  for (const [key, rows] of Object.entries(playerFrames)) {
    paintTexture(scene, key, 32, 48, (ctx) => {
      paintPixels(ctx, rows, palette, 2);
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
