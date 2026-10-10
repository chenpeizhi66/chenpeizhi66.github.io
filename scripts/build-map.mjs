import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const here = dirname(fileURLToPath(import.meta.url));
const topo = JSON.parse(readFileSync(resolve(here, 'land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);
const width = 960;
const height = 480;
const projection = geoEquirectangular()
  .scale(width / (2 * Math.PI))
  .translate([width / 2, height / 2]);
const outline = geoPath(projection)(land);

if (!outline) {
  throw new Error('The land outline was empty.');
}

const samples = [
  ['Dalian', 38.914, 121.6147],
  ['Pittsburgh', 40.4406, -79.9959],
];

for (const [name, lat, lng] of samples) {
  const projected = projection([lng, lat]);
  const expected = [((lng + 180) / 360) * width, ((90 - lat) / 180) * height];
  if (!projected) {
    throw new Error(`Could not project ${name}.`);
  }
  const drift = Math.hypot(projected[0] - expected[0], projected[1] - expected[1]);
  if (drift > 0.6) {
    throw new Error(`${name} pin would miss the map by ${drift.toFixed(2)}px.`);
  }
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
  <title>World map</title>
  <desc>Land outlines from Natural Earth 110m, packaged by world-atlas. Public-domain source data, ISC package license.</desc>
  <path fill="#f3f3f1" stroke="#cfcfcb" stroke-width="0.6" stroke-linejoin="round" d="${outline}"/>
</svg>
`;

const outDir = resolve(here, '../public/assets');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'world.svg'), svg);
console.log(`Wrote ${resolve(outDir, 'world.svg')} (${svg.length} bytes)`);
