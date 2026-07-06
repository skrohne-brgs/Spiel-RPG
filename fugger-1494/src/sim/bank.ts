import Phaser from 'phaser';
import type { GameState } from '../state';
import type { GameEvent } from './events';
import { addReputation } from './politics';

// Kredit, den der Spieler einem Fürsten gewährt hat.
export interface GivenLoan {
  name: string;
  amount: number; // ausgezahlte Summe
  repayment: number; // fällige Rückzahlung am Laufzeitende
  monthsLeft: number;
  riskPct: number; // Ausfallwahrscheinlichkeit bei Fälligkeit (0..100)
}

// Kreditgesuch eines Fürsten (liegt einen Monat lang in der Wechselstube).
export interface LoanOffer {
  name: string;
  amount: number;
  months: number;
  repayment: number;
  riskPct: number;
}

export const DEBT_RATE = 0.02; // eigener Darlehenszins je Monat
export const DEBT_STEP = 500; // Darlehen wird in 500-fl.-Schritten aufgenommen

const PRINCES = [
  'Herzog von Bayern', 'Erzbischof von Salzburg', 'Graf von Tirol',
  'König von Böhmen', 'Herzog von Mailand', 'Markgraf von Brandenburg',
  'Bischof von Brixen', 'König von Polen', 'Herzog von Burgund',
  'Kurfürst von Sachsen', 'Doge von Venedig', 'Bischof von Lüttich',
];

export function riskLabel(riskPct: number): string {
  if (riskPct < 8) return 'gering';
  if (riskPct < 15) return 'mittel';
  return 'hoch';
}

// Monatlich neue Kreditgesuche: 0–2 Stück, skaliert mit dem Firmenwert.
export function rollOffers(companyValue: number, kaiserbankier = false): LoanOffer[] {
  const roll = Math.random();
  const count = roll < 0.2 ? 0 : roll < 0.7 ? 1 : 2;
  const offers: LoanOffer[] = [];
  for (let i = 0; i < count; i++) {
    const base = 300 + Math.random() * 500;
    const scaled = base + companyValue * (0.05 + Math.random() * 0.2);
    const amount = Math.min(kaiserbankier ? 10000 : 6000,
      Math.round(scaled * (kaiserbankier ? 1.5 : 1) / 50) * 50);
    const months = Phaser.Math.RND.pick([6, 9, 12, 18, 24]);
    const interestPct = 12 + Math.random() * 28; // Gesamtzins über die Laufzeit
    const riskPct = Math.round(3 + interestPct * 0.45 + (Math.random() - 0.5) * 4);
    offers.push({
      name: Phaser.Math.RND.pick(PRINCES),
      amount,
      months,
      repayment: Math.round(amount * (1 + interestPct / 100)),
      riskPct: Math.max(2, riskPct - (kaiserbankier ? 4 : 0)),
    });
  }
  return offers;
}

// Laufende Kredite abwickeln: Fälligkeit, Rückzahlung oder Ausfall;
// Zinsen auf das eigene Darlehen.
export function processBank(s: GameState): GameEvent[] {
  const events: GameEvent[] = [];

  for (const loan of [...s.loans]) {
    loan.monthsLeft -= 1;
    if (loan.monthsLeft > 0) continue;
    s.loans.splice(s.loans.indexOf(loan), 1);
    if (Math.random() * 100 < loan.riskPct) {
      events.push({
        title: 'Kreditausfall!',
        text: `Der ${loan.name} ist zahlungsunfähig.\nDein Kredit über ${loan.amount} fl. ist verloren –\ndie erhoffte Rückzahlung von ${loan.repayment} fl. bleibt aus.`,
      });
    } else {
      s.gold += loan.repayment;
      addReputation(s, 3);
      events.push({
        title: 'Kredit zurückgezahlt',
        text: `Der ${loan.name} begleicht seine Schuld:\n${loan.repayment} fl. fließen in deine Kasse\n(${loan.repayment - loan.amount} fl. Zinsgewinn).`,
      });
    }
  }

  if (s.debt > 0) {
    s.debt += Math.ceil(s.debt * DEBT_RATE);
  }

  return events;
}
