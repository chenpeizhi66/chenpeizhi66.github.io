export const TILE = 16;
export const COLS = 100;
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
  { x: 0, y: GROUND_Y, w: WORLD_W, h: WORLD_H - GROUND_Y },
  { x: 18 * TILE, y: GROUND_Y - 4 * TILE, w: 4 * TILE, h: TILE },
  { x: 46 * TILE, y: GROUND_Y - 4 * TILE, w: 5 * TILE, h: TILE },
  { x: 72 * TILE, y: GROUND_Y - 4 * TILE, w: 4 * TILE, h: TILE },
];

export type Scenery = {
  x: number;
  w: number;
  h: number;
  kind: 'school' | 'workshop' | 'lab' | 'desk';
};

export const scenery: Scenery[] = [
  { x: 48, w: 112, h: 70, kind: 'school' },
  { x: 400, w: 148, h: 52, kind: 'workshop' },
  { x: 780, w: 124, h: 86, kind: 'lab' },
  { x: 1188, w: 96, h: 40, kind: 'desk' },
];

export type MarkerIcon = 'book' | 'gear' | 'screen' | 'laptop';

export type Marker = {
  id: string;
  x: number;
  label: string;
  icon: MarkerIcon;
};

export const markers: Marker[] = [
  { id: 'dalian', x: 210, label: 'Dalian', icon: 'book' },
  { id: 'nio', x: 600, label: 'NIO', icon: 'gear' },
  { id: 'cmu', x: 960, label: 'CMU', icon: 'screen' },
  { id: 'software', x: 1340, label: 'Code', icon: 'laptop' },
];

export const trees = [28, 250, 700, 1120, 1500];

export const SPAWN_X = 56;
