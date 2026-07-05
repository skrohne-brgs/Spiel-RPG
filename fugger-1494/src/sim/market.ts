import { CITIES } from '../data/cities';
import { GOODS } from '../data/goods';

// Marktzustand: pro Stadt und Ware ein Schwankungsfaktor um den Basispreis.
// Der Faktor macht jeden Monat einen kleinen Random Walk und wird sanft
// zur Mitte zurückgezogen, damit Preise nicht dauerhaft entgleiten.
export type MarketState = Record<string, Record<string, number>>;

export function createMarket(): MarketState {
  const state: MarketState = {};
  for (const city of CITIES) {
    state[city.id] = {};
    for (const good of GOODS) {
      state[city.id][good.id] = 1 + (Math.random() - 0.5) * good.volatility;
    }
  }
  return state;
}

export function advanceMarket(state: MarketState): void {
  for (const city of CITIES) {
    for (const good of GOODS) {
      const current = state[city.id][good.id];
      const drift = (Math.random() - 0.5) * 2 * good.volatility;
      const pullToCenter = (1 - current) * 0.25;
      state[city.id][good.id] = Math.min(2, Math.max(0.4, current + drift + pullToCenter));
    }
  }
}

export function getPrice(state: MarketState, cityId: string, goodId: string): number {
  const good = GOODS.find((g) => g.id === goodId)!;
  const city = CITIES.find((c) => c.id === cityId)!;
  const mod = city.priceMod[goodId] ?? 1;
  return Math.max(1, Math.round(good.basePrice * mod * state[cityId][goodId]));
}
