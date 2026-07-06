import {
  START_GOLD, START_YEAR, START_MONTH, MONTH_NAMES, WAGON_CAPACITY,
  WAREHOUSE_STEP, WAREHOUSE_UPKEEP_PER_STEP, MANAGER_WAGE, CARTER_WAGE,
} from './constants';
import { MarketState, createMarket, advanceMarket, getPrice } from './sim/market';
import { getBuilding, buildingForCity } from './data/buildings';
import { getGood } from './data/goods';
import type { GameEvent } from './sim/events';

export interface BuildingState {
  input: Record<string, number>; // eingelagerte Rohstoffe je Ware
  output: number; // fertige, abholbare Ware
}

export interface WarehouseState {
  capacity: number;
  stock: Record<string, number>;
}

// Route eines Fuhrwerks: pendelt zwischen a und b (müssen direkt verbunden
// sein und dem Spieler gehörende Lager haben). Lädt in a die Hinfracht,
// in b die Rückfracht (jeweils optional).
export interface WagonRoute {
  a: string;
  b: string;
  goodAB: string | null;
  goodBA: string | null;
}

// Handelsauftrag eines Managers: kauft unter/verkauft über dem Preislimit.
export interface TradeOrder {
  goodId: string;
  limit: number; // Preisgrenze in Gulden
  qty: number; // maximale Einheiten pro Monat
}

export interface ManagerOrders {
  buy: TradeOrder | null;
  sell: TradeOrder | null;
}

export interface WagonState {
  cityId: string;
  cargo: Record<string, number>;
  route: WagonRoute | null;
}

export interface GameState {
  gold: number;
  year: number;
  month: number; // 0-basiert
  cityId: string;
  cargo: Record<string, number>; // Wagen des Spielers
  market: MarketState;
  milestones: string[]; // bereits ausgelöste Meilenstein-IDs
  flags: Record<string, boolean>; // dauerhafte Effekte (z.B. Landfriede)
  buildings: Record<string, BuildingState>; // gekaufte Manufakturen
  warehouses: Record<string, WarehouseState>; // Lager je Stadt
  managers: Record<string, boolean>; // Manager je Stadt
  managerOrders: Record<string, ManagerOrders>; // Handelsaufträge je Stadt
  wagons: WagonState[]; // zusätzliche Fuhrwerke (Spielerwagen ist s.cargo)
}

const SAVE_KEY = 'fugger1494-save';

let state: GameState | null = null;

export function newGame(): GameState {
  state = {
    gold: START_GOLD,
    year: START_YEAR,
    month: START_MONTH,
    cityId: 'augsburg',
    cargo: {},
    market: createMarket(),
    milestones: [],
    flags: {},
    buildings: {},
    warehouses: {},
    managers: {},
    managerOrders: {},
    wagons: [],
  };
  saveGame();
  return state;
}

export function getState(): GameState {
  if (!state) throw new Error('Spiel wurde nicht gestartet');
  return state;
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

export function saveGame(): void {
  if (!state) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Speicher voll oder blockiert (z.B. file://-Sandbox) – Spiel läuft weiter.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    state = JSON.parse(raw) as GameState;
    // Ältere Spielstände um neue Felder ergänzen.
    state.milestones ??= [];
    state.flags ??= {};
    state.buildings ??= {};
    for (const [id, b] of Object.entries(state.buildings)) {
      if (typeof (b as { input: unknown }).input === 'number') {
        const def = getBuilding(id);
        const n = (b as unknown as { input: number }).input;
        b.input = def.inputs.length > 0 ? { [def.inputs[0].good]: n } : {};
      }
    }
    state.warehouses ??= {};
    state.managers ??= {};
    state.managerOrders ??= {};
    state.wagons ??= [];
    return state;
  } catch {
    return null;
  }
}

export function cargoTotal(s: GameState): number {
  return Object.values(s.cargo).reduce((a, b) => a + b, 0);
}

export function stockTotal(w: WarehouseState): number {
  return Object.values(w.stock).reduce((a, b) => a + b, 0);
}

export function wagonLoad(w: WagonState): number {
  return Object.values(w.cargo).reduce((a, b) => a + b, 0);
}

export function dateLabel(s: GameState): string {
  return `${MONTH_NAMES[s.month]} ${s.year}`;
}

// Monatliche Fixkosten: Manufakturen, Lager, Manager, Fuhrleute.
export function monthlyUpkeep(s: GameState): number {
  let sum = 0;
  for (const id of Object.keys(s.buildings)) sum += getBuilding(id).upkeep;
  for (const w of Object.values(s.warehouses)) {
    sum += (w.capacity / WAREHOUSE_STEP) * WAREHOUSE_UPKEEP_PER_STEP;
  }
  sum += Object.values(s.managers).filter(Boolean).length * MANAGER_WAGE;
  sum += s.wagons.filter((w) => w.route).length * CARTER_WAGE;
  return sum;
}

// Ein Monat vergeht: Reise oder Warten. Gibt Wirtschafts-Ereignisse zurück.
export function endTurn(s: GameState): GameEvent[] {
  s.month += 1;
  if (s.month >= 12) {
    s.month = 0;
    s.year += 1;
  }
  advanceMarket(s.market);
  runManagers(s);
  produce(s);
  runWagons(s);

  const events: GameEvent[] = [];
  const upkeep = monthlyUpkeep(s);
  const wasSolvent = s.gold >= 0;
  s.gold -= upkeep;
  if (wasSolvent && s.gold < 0) {
    events.push({
      title: 'Leere Kassen!',
      text: `Unterhalt und Löhne (${upkeep} fl.) übersteigen dein Vermögen.\nDu machst Schulden – verkaufe Waren, um wieder\nflüssig zu werden.`,
    });
  }
  saveGame();
  return events;
}

// Manufakturen veredeln eingelagerte Rohstoffe (bzw. fördern ohne Rohstoff).
// Bei mehreren Eingangswaren begrenzt die knappste Ware die Produktion.
function produce(s: GameState): void {
  for (const [id, b] of Object.entries(s.buildings)) {
    const def = getBuilding(id);
    let units = def.ratePerMonth;
    for (const inp of def.inputs) {
      units = Math.min(units, Math.floor((b.input[inp.good] ?? 0) / inp.qty));
    }
    for (const inp of def.inputs) {
      b.input[inp.good] = (b.input[inp.good] ?? 0) - units * inp.qty;
    }
    b.output += units;
  }
}

// Manager: räumt fertige Ware der Manufaktur ins Stadtlager und
// bestückt die Manufaktur aus dem Lager mit Rohstoff für den Monat.
function runManagers(s: GameState): void {
  for (const [cityId, hired] of Object.entries(s.managers)) {
    if (!hired) continue;
    const wh = s.warehouses[cityId];
    if (!wh) continue;

    const def = buildingForCity(cityId);
    const b = def ? s.buildings[def.id] : undefined;
    if (def && b) {
      // Fertigware ins Lager (soweit Platz)
      const space = wh.capacity - stockTotal(wh);
      const move = Math.min(b.output, space);
      b.output -= move;
      wh.stock[def.outputGood] = (wh.stock[def.outputGood] ?? 0) + move;
    }

    // Handelsaufträge am Stadtmarkt ausführen
    const orders = s.managerOrders[cityId];
    if (orders?.sell) {
      const { goodId, limit, qty } = orders.sell;
      const price = getPrice(s.market, cityId, goodId);
      if (price >= limit) {
        const n = Math.min(qty, wh.stock[goodId] ?? 0);
        wh.stock[goodId] = (wh.stock[goodId] ?? 0) - n;
        s.gold += n * price;
      }
    }
    if (orders?.buy) {
      const { goodId, limit, qty } = orders.buy;
      const price = getPrice(s.market, cityId, goodId);
      if (price <= limit && s.gold > 0) {
        const space2 = wh.capacity - stockTotal(wh);
        const n = Math.min(qty, space2, Math.floor(s.gold / price));
        wh.stock[goodId] = (wh.stock[goodId] ?? 0) + n;
        s.gold -= n * price;
      }
    }

    if (!def || !b) continue;

    // Rohstoffe für einen vollen Produktionsmonat nachlegen
    for (const inp of def.inputs) {
      const want = def.ratePerMonth * inp.qty - (b.input[inp.good] ?? 0);
      const take = Math.min(Math.max(want, 0), wh.stock[inp.good] ?? 0);
      wh.stock[inp.good] = (wh.stock[inp.good] ?? 0) - take;
      b.input[inp.good] = (b.input[inp.good] ?? 0) + take;
    }
  }
}

// Fuhrwerke mit Route: am Routenpunkt abladen, Fracht laden, weiterziehen.
function runWagons(s: GameState): void {
  for (const w of s.wagons) {
    if (!w.route) continue;
    const { a, b } = w.route;
    if (w.cityId !== a && w.cityId !== b) {
      // Route wurde unterwegs geändert: erst zum Startpunkt zurückkehren.
      w.cityId = a;
      continue;
    }
    const here = w.cityId;
    const other = here === a ? b : a;
    const wh = s.warehouses[here];
    if (wh) {
      // Alles abladen, soweit das Lager Platz hat.
      for (const [goodId, n] of Object.entries(w.cargo)) {
        if (n <= 0) continue;
        const space = wh.capacity - stockTotal(wh);
        const move = Math.min(n, space);
        w.cargo[goodId] = n - move;
        wh.stock[goodId] = (wh.stock[goodId] ?? 0) + move;
      }
      // Fracht für die Weiterfahrt laden.
      const loadGood = here === a ? w.route.goodAB : w.route.goodBA;
      if (loadGood) {
        const free = WAGON_CAPACITY - wagonLoad(w);
        const take = Math.min(free, wh.stock[loadGood] ?? 0);
        wh.stock[loadGood] = (wh.stock[loadGood] ?? 0) - take;
        w.cargo[loadGood] = (w.cargo[loadGood] ?? 0) + take;
      }
    }
    w.cityId = other; // ein Monat Fahrt
  }
}

// Wert aller Waren eines Bestands zu Basispreisen.
export function stockValue(stock: Record<string, number>): number {
  let v = 0;
  for (const [goodId, n] of Object.entries(stock)) {
    if (n > 0) v += n * getGood(goodId).basePrice;
  }
  return v;
}
