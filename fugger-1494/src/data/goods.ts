export interface GoodDef {
  id: string;
  name: string;
  basePrice: number; // Gulden pro Einheit
  volatility: number; // wie stark der Preis pro Monat schwankt (0..1)
}

export const GOODS: GoodDef[] = [
  { id: 'erz', name: 'Erz', basePrice: 6, volatility: 0.08 },
  { id: 'salz', name: 'Salz', basePrice: 12, volatility: 0.10 },
  { id: 'wein', name: 'Wein', basePrice: 18, volatility: 0.15 },
  { id: 'wolle', name: 'Wolle', basePrice: 15, volatility: 0.12 },
  { id: 'tuch', name: 'Tuch', basePrice: 40, volatility: 0.12 },
  { id: 'kupfer', name: 'Kupfer', basePrice: 55, volatility: 0.18 },
  { id: 'branntwein', name: 'Branntwein', basePrice: 45, volatility: 0.15 },
  { id: 'glas', name: 'Glas', basePrice: 70, volatility: 0.15 },
  { id: 'waffen', name: 'Waffen', basePrice: 95, volatility: 0.15 },
  { id: 'silber', name: 'Silber', basePrice: 90, volatility: 0.20 },
  { id: 'gewuerze', name: 'Gewürze', basePrice: 120, volatility: 0.25 },
  { id: 'arznei', name: 'Arznei', basePrice: 240, volatility: 0.12 },
  { id: 'schmuck', name: 'Schmuck', basePrice: 280, volatility: 0.12 },
];

export function getGood(id: string): GoodDef {
  const g = GOODS.find((g) => g.id === id);
  if (!g) throw new Error(`Unbekannte Ware: ${id}`);
  return g;
}
