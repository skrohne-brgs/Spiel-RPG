// Preis-Modifikatoren: <1 = Ware ist hier billig (Erzeuger), >1 = teuer (Nachfrage).
export interface CityDef {
  id: string;
  name: string;
  x: number; // Position auf der Europakarte (Spielkoordinaten)
  y: number;
  connections: string[]; // erreichbare Städte (1 Monat Reise)
  priceMod: Record<string, number>;
}

export const CITIES: CityDef[] = [
  {
    id: 'augsburg',
    name: 'Augsburg',
    x: 620, y: 380,
    connections: ['innsbruck', 'venedig', 'antwerpen', 'wien'],
    priceMod: { tuch: 0.8, wolle: 0.9, gewuerze: 1.3 },
  },
  {
    id: 'innsbruck',
    name: 'Innsbruck',
    x: 640, y: 460,
    connections: ['augsburg', 'venedig'],
    priceMod: { silber: 0.6, kupfer: 0.65, erz: 0.7, wein: 1.2, tuch: 1.2 },
  },
  {
    id: 'venedig',
    name: 'Venedig',
    x: 700, y: 540,
    connections: ['innsbruck', 'augsburg', 'rom'],
    priceMod: { gewuerze: 0.7, wein: 0.85, silber: 1.25, kupfer: 1.2 },
  },
  {
    id: 'rom',
    name: 'Rom',
    x: 660, y: 640,
    connections: ['venedig'],
    priceMod: { silber: 1.35, tuch: 1.2, salz: 1.15 },
  },
  {
    id: 'wien',
    name: 'Wien',
    x: 800, y: 400,
    connections: ['augsburg', 'krakau'],
    priceMod: { wein: 0.75, salz: 0.9, gewuerze: 1.25 },
  },
  {
    id: 'krakau',
    name: 'Krakau',
    x: 880, y: 300,
    connections: ['wien'],
    priceMod: { salz: 0.65, kupfer: 0.8, erz: 0.7, tuch: 1.3, wein: 1.25 },
  },
  {
    id: 'antwerpen',
    name: 'Antwerpen',
    x: 440, y: 220,
    connections: ['augsburg', 'lissabon'],
    priceMod: { wolle: 0.7, tuch: 0.9, kupfer: 1.3, gewuerze: 1.15 },
  },
  {
    id: 'lissabon',
    name: 'Lissabon',
    x: 150, y: 600,
    connections: ['antwerpen'],
    priceMod: { gewuerze: 0.55, salz: 0.8, silber: 1.3, tuch: 1.25 },
  },
];

export function getCity(id: string): CityDef {
  const c = CITIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unbekannte Stadt: ${id}`);
  return c;
}
