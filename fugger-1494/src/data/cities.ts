// Preis-Modifikatoren: <1 = Ware ist hier billig (Erzeuger), >1 = teuer (Nachfrage).
export interface CityDef {
  id: string;
  name: string;
  x: number; // Position auf der Europakarte (Spielkoordinaten)
  y: number;
  connections: string[]; // direkt erreichbare Städte
  priceMod: Record<string, number>;
}

export const CITIES: CityDef[] = [
  {
    id: 'augsburg',
    name: 'Augsburg',
    x: 620, y: 380,
    connections: ['innsbruck', 'venedig', 'antwerpen', 'wien', 'krakau'],
    priceMod: { tuch: 0.8, wolle: 0.9, gewuerze: 1.3, waffen: 1.1, arznei: 1.2 },
  },
  {
    id: 'innsbruck',
    name: 'Innsbruck',
    x: 640, y: 460,
    connections: ['augsburg', 'venedig', 'wien'],
    priceMod: { silber: 0.6, kupfer: 0.65, erz: 0.7, wein: 1.2, tuch: 1.2 },
  },
  {
    id: 'venedig',
    name: 'Venedig',
    x: 700, y: 540,
    connections: ['innsbruck', 'augsburg', 'rom', 'lissabon'],
    priceMod: { gewuerze: 0.7, wein: 0.85, silber: 1.25, kupfer: 1.2, branntwein: 1.1 },
  },
  {
    id: 'rom',
    name: 'Rom',
    x: 660, y: 640,
    connections: ['venedig'],
    priceMod: { silber: 1.35, tuch: 1.2, salz: 1.15, waffen: 1.25, glas: 1.15, arznei: 1.2 },
  },
  {
    id: 'wien',
    name: 'Wien',
    x: 800, y: 400,
    connections: ['augsburg', 'krakau', 'innsbruck'],
    priceMod: { wein: 0.75, salz: 0.9, gewuerze: 1.25, waffen: 1.2, schmuck: 1.25 },
  },
  {
    id: 'krakau',
    name: 'Krakau',
    x: 880, y: 300,
    connections: ['wien', 'augsburg'],
    priceMod: { salz: 0.65, kupfer: 0.8, erz: 0.7, tuch: 1.3, wein: 1.25, glas: 1.3, arznei: 1.25, schmuck: 1.2 },
  },
  {
    id: 'antwerpen',
    name: 'Antwerpen',
    x: 440, y: 220,
    connections: ['augsburg', 'lissabon'],
    priceMod: { wolle: 0.7, tuch: 0.9, kupfer: 1.3, gewuerze: 1.15, glas: 1.25, branntwein: 1.2, schmuck: 1.2 },
  },
  {
    id: 'lissabon',
    name: 'Lissabon',
    x: 150, y: 600,
    connections: ['antwerpen', 'venedig'],
    priceMod: { gewuerze: 0.55, salz: 0.8, silber: 1.3, tuch: 1.25, waffen: 1.2, branntwein: 1.25 },
  },
];

// Fernstrecken dauern zwei Monate (lange Land- bzw. Seewege), alle anderen
// direkten Verbindungen einen. Schlüssel: beide Stadt-IDs alphabetisch verbunden.
const LONG_ROUTES = new Set<string>([
  'augsburg|krakau', // Fernlandweg über Nürnberg/Prag zu den Bergwerken
  'lissabon|venedig', // Seeweg der venezianischen Galeeren durch Gibraltar
]);

function routeKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

// Reisedauer in Monaten zwischen zwei direkt verbundenen Städten.
export function travelMonths(a: string, b: string): number {
  return LONG_ROUTES.has(routeKey(a, b)) ? 2 : 1;
}

export function isLongRoute(a: string, b: string): boolean {
  return LONG_ROUTES.has(routeKey(a, b));
}

export function getCity(id: string): CityDef {
  const c = CITIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unbekannte Stadt: ${id}`);
  return c;
}
