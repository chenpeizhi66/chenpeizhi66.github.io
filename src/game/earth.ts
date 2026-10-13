import { coastal } from './cityscape.ts';
import { GROUND_Y, VIEW_H, VIEW_W, WORLD_H, WORLD_W } from './level.ts';

/** Circumference matches the walk, so one loop is one trip around the earth. */
export const EARTH_R = WORLD_W / (2 * Math.PI);
/** Screen y where the player's feet meet the ground. */
export const SURFACE_Y = 176;
export const EARTH_CX = VIEW_W / 2;
export const EARTH_CY = SURFACE_Y + EARTH_R;

export type EarthPoint = {
  x: number;
  y: number;
  angle: number;
  visible: boolean;
};

function mix(from: string, to: string, t: number): string {
  const amount = Math.min(1, Math.max(0, t));
  const channel = (start: number) => {
    const a = Number.parseInt(from.slice(start, start + 2), 16);
    const b = Number.parseInt(to.slice(start, start + 2), 16);
    return Math.round(a + (b - a) * amount);
  };
  return `rgb(${channel(1)}, ${channel(3)}, ${channel(5)})`;
}

/** Shortest angle around the earth, in radians. Positive is to the right of the player. */
export function project(worldX: number, worldY: number, playerX: number): EarthPoint {
  let dx = worldX - playerX;
  dx = ((dx % WORLD_W) + WORLD_W) % WORLD_W;
  if (dx > WORLD_W / 2) dx -= WORLD_W;
  const angle = (dx / WORLD_W) * Math.PI * 2;
  const lift = GROUND_Y - worldY;
  const radius = EARTH_R + lift;
  const x = EARTH_CX + Math.sin(angle) * radius;
  const y = EARTH_CY - Math.cos(angle) * radius;
  return {
    x,
    y,
    angle,
    visible: Math.abs(angle) < 1.15 && x > -120 && x < VIEW_W + 120 && y < VIEW_H + 80,
  };
}

export function paintGlobe(ctx: CanvasRenderingContext2D, source: CanvasImageSource, playerX: number): void {
  const coast = coastal(playerX);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, mix('#c5d5df', '#b9e3f6', coast));
  sky.addColorStop(0.55, mix('#e4edf1', '#e7f6fc', coast));
  sky.addColorStop(1, mix('#d5e4ea', '#c5e6f6', coast));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.fillStyle = mix('#d5e8f0', '#e7f6fc', coast);
  ctx.beginPath();
  ctx.arc(EARTH_CX, EARTH_CY, EARTH_R + 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = mix('#1a4558', '#1e6280', coast);
  ctx.beginPath();
  ctx.arc(EARTH_CX, EARTH_CY, EARTH_R + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.imageSmoothingEnabled = false;
  for (let screenX = 0; screenX < VIEW_W; screenX += 1) {
    const offset = screenX - EARTH_CX;
    if (Math.abs(offset) >= EARTH_R) continue;
    const angle = Math.asin(offset / EARTH_R);
    const surfaceY = Math.round(EARTH_CY - Math.cos(angle) * EARTH_R);
    let srcX = Math.round(playerX + (angle / (Math.PI * 2)) * WORLD_W);
    srcX = ((srcX % WORLD_W) + WORLD_W) % WORLD_W;
    ctx.drawImage(source, srcX, 0, 1, WORLD_H, screenX, surfaceY - GROUND_Y, 1, WORLD_H);
  }
}
