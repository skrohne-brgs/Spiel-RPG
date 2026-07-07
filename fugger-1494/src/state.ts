import {
  START_GOLD, START_YEAR, START_MONTH, MONTH_NAMES, WAGON_CAPACITY,
  WAREHOUSE_STEP, WAREHOUSE_UPKEEP_PER_STEP, MANAGER_WAGE, CARTER_WAGE,
} from './constants';
import { MarketState, createMarket, advanceMarket, getPrice, applyTradeImpact } from './sim/market';
import { getBuilding, buildingForCity } from './data/buildings';
import { getCity } from './data/cities';
import { getGood } from './data/goods';
import type { GameEvent } from './sim/events';
import { GivenLoan, LoanOffer, processBank, rollOffers } from './sim/bank';
import { Rival, createRivals, runRivals } from './sim/politics';
import { FamilyState, createFamily, checkFamily } from './sim/family';

export interface BuildingState {
  input: Record<string, number>; // eingelagerte Rohstoffe je Ware
  output: number; // fertige, abholbare Ware
}

export interface WarehouseState {
  capacity: number;
  stock: Record<string, number>;
}

// Route eines Fuhrwerks: 2–4 Stationen mit eigenem Lager, die im Kreis
// abgefahren werden. An jeder Station wird alles abgeladen und die dort
// eingestellte Ware geladen. Direkt verbundene Städte kosten einen Monat
// Fahrt, alle anderen zwei.
export interface RouteStop {
  cityId: string;
  load: string | null; // Ware, die hier geladen wird
}

export interface WagonRoute {
  stops: RouteStop[];
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
  transit: { to: string; monthsLeft: number } | null; // längere Fahrten
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
  loans: GivenLoan[]; // an Fürsten vergebene Kredite
  bankOffers: LoanOffer[]; // aktuelle Kreditgesuche (monatlich neu)
  debt: number; // eigenes Darlehen bei der Wechselstube
  reputation: number; // Ansehen bei Fürsten und Zünften (0..100)
  privileges: string[]; // erworbene Privilegien
  rivals: Rival[]; // konkurrierende Handelshäuser
  family: FamilyState; // Nebenschauplatz: Ehe und Kinder
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
    loans: [],
    bankOffers: rollOffers(START_GOLD),
    debt: 0,
    reputation: 10,
    privileges: [],
    rivals: createRivals(),
    family: createFamily(),
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
    for (const w of state.wagons) {
      w.transit ??= null;
      const legacy = w.route as unknown as
        { a?: string; b?: string; goodAB?: string | null; goodBA?: string | null } | null;
      if (legacy && legacy.a && legacy.b) {
        w.route = {
          stops: [
            { cityId: legacy.a, load: legacy.goodAB ?? null },
            { cityId: legacy.b, load: legacy.goodBA ?? null },
          ],
        };
      }
    }
    state.loans ??= [];
    state.bankOffers ??= [];
    state.debt ??= 0;
    state.reputation ??= 10;
    state.privileges ??= [];
    state.rivals ??= createRivals();
    state.family ??= createFamily();
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
  sum += Object.entries(s.managers)
    .filter(([cityId, hired]) => hired && !(cityId === 'augsburg' && s.family.spouse))
    .length * MANAGER_WAGE;
  sum += s.wagons.filter((w) => w.route && w.route.stops.length >= 2).length * CARTER_WAGE;
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
  events.push(...processBank(s));
  events.push(...runRivals(s));
  events.push(...checkFamily(s));
  const upkeep = monthlyUpkeep(s);
  const wasSolvent = s.gold >= 0;
  s.gold -= upkeep;
  if (wasSolvent && s.gold < 0) {
    events.push({
      title: 'Leere Kassen!',
      portrait: 'p_kasse',
      text: `Unterhalt und Löhne (${upkeep} fl.) übersteigen dein Vermögen.\nDu machst Schulden – verkaufe Waren, um wieder\nflüssig zu werden.`,
    });
  }
  s.bankOffers = rollOffers(Math.max(0, s.gold), s.privileges.includes('kaiserbankier'));
  saveGame();
  return events;
}

// Manufakturen veredeln eingelagerte Rohstoffe (bzw. fördern ohne Rohstoff).
// Bei mehreren Eingangswaren begrenzt die knappste Ware die Produktion.
function produce(s: GameState): void {
  for (const [id, b] of Object.entries(s.buildings)) {
    const def = getBuilding(id);
    let units = def.ratePerMonth;
    if (id === 'salzbergwerk' && s.privileges.includes('salzregal')) units += 2;
    for (const inp of def.inputs) {
      units = Math.min(units, Math.floor((b.input[inp.good] ?? 0) / inp.qty));
    }
    for (const inp of def.inputs) {
      b.input[inp.good] = (b.input[inp.good] ?? 0) - units * inp.qty;
    }
    b.output += units;
    // Fertigware wandert direkt ins Stadtlager, soweit dort Platz ist.
    const wh = s.warehouses[def.cityId];
    if (wh && b.output > 0) {
      const move = Math.min(b.output, wh.capacity - stockTotal(wh));
      if (move > 0) {
        b.output -= move;
        wh.stock[def.outputGood] = (wh.stock[def.outputGood] ?? 0) + move;
      }
    }
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
      const price = getPrice(s.market, cityId, goodId, s.privileges);
      if (price >= limit) {
        const n = Math.min(qty, wh.stock[goodId] ?? 0);
        wh.stock[goodId] = (wh.stock[goodId] ?? 0) - n;
        s.gold += n * price;
        if (n > 0) applyTradeImpact(s.market, cityId, goodId, n, 'sell');
      }
    }
    if (orders?.buy) {
      const { goodId, limit, qty } = orders.buy;
      const price = getPrice(s.market, cityId, goodId, s.privileges);
      if (price <= limit && s.gold > 0) {
        const space2 = wh.capacity - stockTotal(wh);
        const n = Math.min(qty, space2, Math.floor(s.gold / price));
        wh.stock[goodId] = (wh.stock[goodId] ?? 0) + n;
        s.gold -= n * price;
        if (n > 0) applyTradeImpact(s.market, cityId, goodId, n, 'buy');
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

// Fuhrwerke mit Ringroute: an jeder Station alles abladen, die dortige
// Ware laden und zur nächsten Station ziehen (verbunden: 1 Monat,
// sonst 2 – der zweite Monat läuft über den Transit-Zähler).
function runWagons(s: GameState): void {
  for (const w of s.wagons) {
    if (!w.route || w.route.stops.length < 2) continue;

    if (w.transit) {
      w.transit.monthsLeft -= 1;
      if (w.transit.monthsLeft <= 0) {
        w.cityId = w.transit.to;
        w.transit = null;
      }
      continue;
    }

    const stops = w.route.stops;
    const idx = stops.findIndex((st) => st.cityId === w.cityId);
    if (idx === -1) {
      // Nicht auf der Route (z.B. gerade geändert): zur ersten Station.
      travelTo(w, stops[0].cityId);
      continue;
    }

    const wh = s.warehouses[w.cityId];
    if (wh) {
      // Alles abladen, soweit das Lager Platz hat.
      for (const [goodId, n] of Object.entries(w.cargo)) {
        if (n <= 0) continue;
        const move = Math.min(n, wh.capacity - stockTotal(wh));
        w.cargo[goodId] = n - move;
        wh.stock[goodId] = (wh.stock[goodId] ?? 0) + move;
      }
      // Die hier eingestellte Ware laden.
      const loadGood = stops[idx].load;
      if (loadGood) {
        const take = Math.min(WAGON_CAPACITY - wagonLoad(w), wh.stock[loadGood] ?? 0);
        wh.stock[loadGood] = (wh.stock[loadGood] ?? 0) - take;
        w.cargo[loadGood] = (w.cargo[loadGood] ?? 0) + take;
      }
    }
    travelTo(w, stops[(idx + 1) % stops.length].cityId);
  }
}

// Bewegt ein Fuhrwerk Richtung Ziel: direkte Verbindung = sofort da
// (ein Monat), sonst bleibt es einen Monat länger unterwegs.
function travelTo(w: WagonState, to: string): void {
  if (getCityConnections(w.cityId).includes(to)) {
    w.cityId = to;
  } else {
    w.transit = { to, monthsLeft: 1 };
  }
}

function getCityConnections(cityId: string): string[] {
  try {
    return getCity(cityId).connections;
  } catch {
    return [];
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
