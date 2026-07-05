import { START_GOLD, START_YEAR, START_MONTH, MONTH_NAMES } from './constants';
import { MarketState, createMarket, advanceMarket } from './sim/market';

export interface GameState {
  gold: number;
  year: number;
  month: number; // 0-basiert
  cityId: string;
  cargo: Record<string, number>;
  market: MarketState;
}

let state: GameState | null = null;

export function newGame(): GameState {
  state = {
    gold: START_GOLD,
    year: START_YEAR,
    month: START_MONTH,
    cityId: 'augsburg',
    cargo: {},
    market: createMarket(),
  };
  return state;
}

export function getState(): GameState {
  if (!state) throw new Error('Spiel wurde nicht gestartet');
  return state;
}

export function cargoTotal(s: GameState): number {
  return Object.values(s.cargo).reduce((a, b) => a + b, 0);
}

export function dateLabel(s: GameState): string {
  return `${MONTH_NAMES[s.month]} ${s.year}`;
}

// Ein Monat vergeht: Reise oder Warten.
export function endTurn(s: GameState): void {
  s.month += 1;
  if (s.month >= 12) {
    s.month = 0;
    s.year += 1;
  }
  advanceMarket(s.market);
}
