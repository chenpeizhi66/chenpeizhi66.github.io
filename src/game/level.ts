export const TILE = 16;
export const COLS = 200;
export const ROWS = 15;
export const VIEW_W = 400;
export const VIEW_H = ROWS * TILE;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;
export const GROUND_Y = 13 * TILE;

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const platforms: Rect[] = [
  { x: -48, y: GROUND_Y, w: WORLD_W + 96, h: WORLD_H - GROUND_Y },
  { x: 360, y: GROUND_Y - 5 * TILE, w: 4 * TILE, h: TILE },
  { x: 1288, y: GROUND_Y - 5 * TILE, w: 4 * TILE, h: TILE },
  { x: 2768, y: GROUND_Y - 5 * TILE, w: 4 * TILE, h: TILE },
];

export type MarkerIcon = 'book' | 'gear' | 'screen' | 'laptop';

export type Marker = {
  id: string;
  x: number;
  label: string;
  icon: MarkerIcon;
};

export const markers: Marker[] = [
  { id: 'dalian', x: 520, label: 'Dalian', icon: 'book' },
  { id: 'pittsburgh', x: 2004, label: 'Pittsburgh', icon: 'screen' },
  { id: 'shenzhen', x: 2920, label: 'Shenzhen', icon: 'gear' },
];

export const SPAWN_X = 220;
