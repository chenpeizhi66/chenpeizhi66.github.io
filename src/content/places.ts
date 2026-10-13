export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/** Cities visited. lat/lng are decimal degrees for the city center. */
export const places: Place[] = [
  { id: 'shenyang', name: 'Shenyang', lat: 41.8057, lng: 123.4315 },
  { id: 'dandong', name: 'Dandong', lat: 40.129, lng: 124.394 },
  { id: 'beijing', name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { id: 'shanghai', name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { id: 'changsha', name: 'Changsha', lat: 28.2278, lng: 112.9388 },
  { id: 'shenzhen', name: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
  { id: 'nanchang', name: 'Nanchang', lat: 28.682, lng: 115.8579 },
  { id: 'fuzhou', name: 'Fuzhou', lat: 26.0745, lng: 119.2965 },
  { id: 'xiamen', name: 'Xiamen', lat: 24.4798, lng: 118.0894 },
  { id: 'hong-kong', name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { id: 'macau', name: 'Macau', lat: 22.1987, lng: 113.5439 },
  { id: 'guangzhou', name: 'Guangzhou', lat: 23.1291, lng: 113.2644 },
  { id: 'hailar', name: 'Hailar', lat: 49.2116, lng: 119.7658 },
  { id: 'los-angeles', name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { id: 'orlando', name: 'Orlando', lat: 28.5383, lng: -81.3792 },
  { id: 'washington-dc', name: 'Washington, D.C.', lat: 38.9072, lng: -77.0369 },
  { id: 'columbus', name: 'Columbus', lat: 39.9612, lng: -82.9988 },
  { id: 'pittsburgh', name: 'Pittsburgh', lat: 40.4406, lng: -79.9959 },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { id: 'kamakura', name: 'Kamakura', lat: 35.3192, lng: 139.5467 },
];

/** Matches the equirectangular world map in public/assets/world.svg. */
export function pinPercent(place: Place): { left: number; top: number } {
  return {
    left: ((place.lng + 180) / 360) * 100,
    top: ((90 - place.lat) / 180) * 100,
  };
}

/**
 * Nearby cities land on the same pixel of a world map. Nudge those dots
 * apart, in percent of map width, so each one can be hovered.
 */
export function separatePins(list: Place[], minWidthPercent = 1.6): { place: Place; left: number; top: number }[] {
  const placed = list.map((place) => ({ place, ...pinPercent(place) }));
  for (let pass = 0; pass < 40; pass += 1) {
    let moved = false;
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        if (!a || !b) continue;
        let dx = b.left - a.left;
        let dy = (b.top - a.top) * 0.5;
        let dist = Math.hypot(dx, dy);
        if (dist >= minWidthPercent) continue;
        if (dist < 1e-6) {
          const angle = (i + 1) * 1.7 + (j + 1);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          dist = 1;
        }
        const push = (minWidthPercent - dist) / 2 + 0.02;
        a.left -= (dx / dist) * push;
        a.top -= ((dy / dist) * push) / 0.5;
        b.left += (dx / dist) * push;
        b.top += ((dy / dist) * push) / 0.5;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return placed;
}
