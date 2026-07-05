// Manufakturen: veredeln jeden Monat Rohstoffe zu Fertigwaren.
export interface BuildingDef {
  id: string;
  name: string;
  cityId: string; // nur in dieser Stadt kaufbar
  cost: number;
  inputGood: string;
  outputGood: string;
  inputPerOutput: number; // Rohstoff-Einheiten pro Fertigware
  ratePerMonth: number; // maximale Fertigwaren pro Monat
  description: string;
}

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'weberei',
    name: 'Tuchweberei',
    cityId: 'augsburg',
    cost: 600,
    inputGood: 'wolle',
    outputGood: 'tuch',
    inputPerOutput: 1,
    ratePerMonth: 4,
    description: 'Webt eingelagerte Wolle zu feinem Augsburger Tuch.',
  },
  {
    id: 'schmelze',
    name: 'Schmelzhütte',
    cityId: 'innsbruck',
    cost: 900,
    inputGood: 'erz',
    outputGood: 'kupfer',
    inputPerOutput: 2,
    ratePerMonth: 3,
    description: 'Verhüttet Tiroler Erz zu barrenweise Kupfer.',
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
