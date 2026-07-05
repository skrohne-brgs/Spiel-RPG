// Manufakturen in drei Stufen:
//   Stufe 1 (fördern):    keine Eingangsware, z.B. Salzbergwerk
//   Stufe 2 (veredeln):   eine Eingangsware, z.B. Wolle -> Tuch
//   Stufe 3 (kombinieren): mehrere Eingangswaren, z.B. Silber + Glas -> Schmuck
export interface BuildingInput {
  good: string;
  qty: number; // Einheiten pro Fertigware
}

export interface BuildingDef {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  cityId: string; // nur in dieser Stadt kaufbar
  cost: number;
  upkeep: number; // Gulden Unterhalt pro Monat
  inputs: BuildingInput[]; // leer = fördert ohne Rohstoff
  outputGood: string;
  ratePerMonth: number; // maximale Fertigwaren pro Monat
  description: string;
}

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'salzbergwerk',
    name: 'Salzbergwerk',
    tier: 1,
    cityId: 'krakau',
    cost: 700,
    upkeep: 12,
    inputs: [],
    outputGood: 'salz',
    ratePerMonth: 5,
    description: 'Fördert Salz aus den Stollen von Wieliczka – ganz ohne Rohstoff.',
  },
  {
    id: 'weberei',
    name: 'Tuchweberei',
    tier: 2,
    cityId: 'augsburg',
    cost: 600,
    upkeep: 10,
    inputs: [{ good: 'wolle', qty: 1 }],
    outputGood: 'tuch',
    ratePerMonth: 4,
    description: 'Webt eingelagerte Wolle zu feinem Augsburger Tuch.',
  },
  {
    id: 'schmelze',
    name: 'Schmelzhütte',
    tier: 2,
    cityId: 'innsbruck',
    cost: 900,
    upkeep: 15,
    inputs: [{ good: 'erz', qty: 2 }],
    outputGood: 'kupfer',
    ratePerMonth: 3,
    description: 'Verhüttet Tiroler Erz zu barrenweise Kupfer.',
  },
  {
    id: 'glashuette',
    name: 'Glashütte',
    tier: 2,
    cityId: 'venedig',
    cost: 1000,
    upkeep: 15,
    inputs: [{ good: 'salz', qty: 2 }],
    outputGood: 'glas',
    ratePerMonth: 3,
    description: 'Bläst nach Muranoer Art edles Glas – Salz dient als Flussmittel.',
  },
  {
    id: 'brennerei',
    name: 'Brennerei',
    tier: 2,
    cityId: 'wien',
    cost: 800,
    upkeep: 12,
    inputs: [{ good: 'wein', qty: 2 }],
    outputGood: 'branntwein',
    ratePerMonth: 3,
    description: 'Brennt Wiener Wein zu gefragtem Branntwein.',
  },
  {
    id: 'waffenschmiede',
    name: 'Waffenschmiede',
    tier: 2,
    cityId: 'antwerpen',
    cost: 1200,
    upkeep: 18,
    inputs: [{ good: 'kupfer', qty: 1 }],
    outputGood: 'waffen',
    ratePerMonth: 3,
    description: 'Schmiedet aus Kupfer und Stahl Waffen für die Heere Europas.',
  },
  {
    id: 'goldschmiede',
    name: 'Goldschmiede',
    tier: 3,
    cityId: 'rom',
    cost: 2000,
    upkeep: 25,
    inputs: [{ good: 'silber', qty: 1 }, { good: 'glas', qty: 2 }],
    outputGood: 'schmuck',
    ratePerMonth: 2,
    description: 'Fasst Muranoglas in getriebenes Silber – Geschmeide für Kardinäle und Fürsten.',
  },
  {
    id: 'apotheke',
    name: 'Hof-Apotheke',
    tier: 3,
    cityId: 'lissabon',
    cost: 1800,
    upkeep: 22,
    inputs: [{ good: 'gewuerze', qty: 1 }, { good: 'branntwein', qty: 1 }],
    outputGood: 'arznei',
    ratePerMonth: 2,
    description: 'Destilliert aus Gewürzen und Branntwein kostbare Arzneien und Theriak.',
  },
];

export function buildingForCity(cityId: string): BuildingDef | undefined {
  return BUILDINGS.find((b) => b.cityId === cityId);
}

export function getBuilding(id: string): BuildingDef {
  const b = BUILDINGS.find((b) => b.id === id);
  if (!b) throw new Error(`Unbekanntes Gebäude: ${id}`);
  return b;
}
