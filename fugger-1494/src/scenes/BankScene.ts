import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { getCity } from '../data/cities';
import { DEBT_RATE, DEBT_STEP, riskLabel } from '../sim/bank';
import { getState, saveGame } from '../state';
import { sfxCoins } from '../audio/sfx';

const MAX_DEBT = 3000;

// Wechselstube: Kredite an Fürsten vergeben (Zinsgewinn, Ausfallrisiko)
// und eigene Darlehen aufnehmen bzw. tilgen.
export class BankScene extends Phaser.Scene {
  constructor() {
    super('BankScene');
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);
    const style = { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#3a2a14' };

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 200, GAME_HEIGHT - 60, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 60,
      `Wechselstube zu ${city.name} — ${s.gold} Gulden` +
      (s.debt > 0 ? ` — Schulden: ${s.debt} fl.` : ''), {
        fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3a2a14', fontStyle: 'bold',
      }).setOrigin(0.5, 0);

    // Kreditgesuche
    this.add.text(160, 120, 'Kreditgesuche', { ...style, fontSize: '21px', fontStyle: 'bold' });
    if (s.bankOffers.length === 0) {
      this.add.text(160, 155, 'Derzeit bittet kein Fürst um Geld. Neue Gesuche treffen monatlich ein.', style);
    }
    s.bankOffers.forEach((offer, i) => {
      const y = 155 + i * 62;
      this.add.text(160, y,
        `Der ${offer.name} erbittet ${offer.amount} fl. für ${offer.months} Monate.\n` +
        `Rückzahlung: ${offer.repayment} fl. — Ausfallrisiko: ${riskLabel(offer.riskPct)}`, style);
      if (s.gold >= offer.amount) {
        this.makeButton(1000, y + 12, 'Gewähren', () => {
          const st = getState();
          if (st.gold < offer.amount) return;
          st.gold -= offer.amount;
          st.loans.push({
            name: offer.name,
            amount: offer.amount,
            repayment: offer.repayment,
            monthsLeft: offer.months,
            riskPct: offer.riskPct,
          });
          st.bankOffers.splice(st.bankOffers.indexOf(offer), 1);
          st.flags.kreditVergeben = true;
          sfxCoins();
          saveGame();
          this.scene.restart();
        });
      } else {
        this.add.text(1000, y + 12, 'zu teuer', { ...style, color: '#8a2f1f' }).setOrigin(0.5, 0);
      }
    });

    // Laufende Kredite
    this.add.text(160, 300, 'Verliehenes Geld', { ...style, fontSize: '21px', fontStyle: 'bold' });
    if (s.loans.length === 0) {
      this.add.text(160, 335, 'Du hast derzeit kein Geld verliehen.', style);
    }
    s.loans.slice(0, 4).forEach((loan, i) => {
      this.add.text(160, 335 + i * 34,
        `${loan.name}: ${loan.amount} fl. verliehen — ${loan.repayment} fl. fällig in ` +
        `${loan.monthsLeft} Mon. — Risiko: ${riskLabel(loan.riskPct)}`, style);
    });

    // Eigenes Darlehen
    this.add.text(160, 500, 'Eigenes Darlehen', { ...style, fontSize: '21px', fontStyle: 'bold' });
    this.add.text(160, 535,
      s.debt > 0
        ? `Du schuldest der Wechselstube ${s.debt} fl. (${DEBT_RATE * 100} % Zins je Monat).`
        : `Die Wechselstube leiht dir Geld in Schritten von ${DEBT_STEP} fl. (${DEBT_RATE * 100} % Zins je Monat, max. ${MAX_DEBT} fl.).`,
      style);
    if (s.debt + DEBT_STEP <= MAX_DEBT) {
      this.makeButton(380, 590, `Aufnehmen +${DEBT_STEP} fl.`, () => {
        const st = getState();
        if (st.debt + DEBT_STEP > MAX_DEBT) return;
        st.debt += DEBT_STEP;
        st.gold += DEBT_STEP;
        sfxCoins();
        saveGame();
        this.scene.restart();
      });
    }
    if (s.debt > 0 && s.gold > 0) {
      this.makeButton(640, 590, 'Tilgen', () => {
        const st = getState();
        const pay = Math.min(st.gold, st.debt);
        if (pay <= 0) return;
        st.gold -= pay;
        st.debt -= pay;
        sfxCoins();
        saveGame();
        this.scene.restart();
      });
    }

    this.makeButton(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'Zurück zum Markt', () =>
      this.scene.start('MarketScene'),
    );
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '18px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 12, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
  }
}
