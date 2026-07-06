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

// Eigener Handel bewegt den Markt: Kaeufe verteuern, Verkaeufe druecken den
// Preis. Verhindert, dass man unbegrenzt zum selben Kurs handeln kann.
export function applyTradeImpact(
  state: MarketState, cityId: string, goodId: string,
  units: number, dir: 'buy' | 'sell',
): void {
  const perUnit = dir === 'buy' ? 1.012 : 0.988;
  state[cityId][goodId] = Math.min(2, Math.max(0.4, state[cityId][goodId] * perUnit ** units));
}

export function getPrice(
  state: MarketState, cityId: string, goodId: string,
  privileges: string[] = [],
): number {
  const good = GOODS.find((g) => g.id === goodId)!;
  const city = CITIES.find((c) => c.id === cityId)!;
  let mod = city.priceMod[goodId] ?? 1;
  if (
    privileges.includes('monopol_tirol') && cityId === 'innsbruck' &&
    ['erz', 'kupfer', 'silber'].includes(goodId)
  ) {
    mod *= 0.8;
  }
  return Math.max(1, Math.round(good.basePrice * mod * state[cityId][goodId]));
}
