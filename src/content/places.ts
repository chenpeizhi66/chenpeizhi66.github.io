export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  note: string;
};

/** Study locations. Add traveled cities here; lat/lng are decimal degrees. */
export const places: Place[] = [
  {
    id: 'dalian',
    name: 'Dalian',
    lat: 38.914,
    lng: 121.6147,
    note: 'B.S., Dalian University of Technology, 2022.',
  },
  {
    id: 'pittsburgh',
    name: 'Pittsburgh',
    lat: 40.4406,
    lng: -79.9959,
    note: 'M.S., Carnegie Mellon University, 2024.',
  },
];

/** Matches the equirectangular world map in public/assets/world.svg. */
export function pinPercent(place: Place): { left: number; top: number } {
  return {
    left: ((place.lng + 180) / 360) * 100,
    top: ((90 - place.lat) / 180) * 100,
  };
}
