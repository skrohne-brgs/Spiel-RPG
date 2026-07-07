import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY, MANAGER_WAGE } from '../constants';
import { getGood } from '../data/goods';
import { buildingForCity, BuildingDef } from '../data/buildings';
import { getCity } from '../data/cities';
import { getState, cargoTotal, saveGame } from '../state';
import { preloadArt } from '../art';

const TIER_NAMES: Record<number, string> = {
  1: 'Stufe 1 – Förderung',
  2: 'Stufe 2 – Veredelung',
  3: 'Stufe 3 – Kombination',
};

// Kontor: Manufaktur der Stadt kaufen, Rohstoffe einlagern, Fertigwaren
// abholen und den Manager anstellen. Nur in der Stadt des Spielers nutzbar.
export class KontorScene extends Phaser.Scene {
  private info!: Phaser.GameObjects.Text;
  private dynamicButtons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('KontorScene');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);

    this.dynamicButtons = [];
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_kontor');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.22);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 860, 560, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 115, `Kontor zu ${city.name}`, {
      fontFamily: 'Georgia, serif', fontSize: '30px', color: '#3a2a14', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.info = this.add.text(GAME_WIDTH / 2, 285, '', {
      fontFamily: 'Georgia, serif', fontSize: '19px', color: '#3a2a14',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);

    this.makeButton(GAME_WIDTH / 2, GAME_HEIGHT - 130, 'Zurück zum Markt', () =>
      this.scene.start('MarketScene'),
    );
    this.rebuild();
  }

  // Aktions-Knöpfe hängen vom Zustand ab und werden bei Änderungen neu erzeugt.
  private rebuild(): void {
    for (const b of this.dynamicButtons) b.destroy();
    this.dynamicButtons = [];

    const s = getState();
    const def = buildingForCity(s.cityId);
    this.buildManagerButtons();
    if (!def) {
      this.info.setText(
        'In dieser Stadt gibt es keine Manufaktur zu erwerben.\n\n' +
        'Ein Manager kann hier dennoch nützlich sein:\n' +
        'Mit Lager und Handelsaufträgen wird die Stadt\nzum eigenständigen Handelsposten.',
      );
      return;
    }
    const owned = s.buildings[def.id];
    this.refreshInfo(def);

    if (!owned) {
      this.addButton(GAME_WIDTH / 2, 480, `${def.name} kaufen (${def.cost} fl.)`, () => {
        const st = getState();
        if (st.gold < def.cost || st.buildings[def.id]) return;
        st.gold -= def.cost;
        st.buildings[def.id] = { input: {}, output: 0 };
        saveGame();
        this.rebuild();
      });
      return;
    }

    // Einlagern je Eingangsware, Abholen der Fertigware
    const btnY = 470;
    const slots = def.inputs.length + 1;
    def.inputs.forEach((inp, i) => {
      const x = GAME_WIDTH / 2 + (i - (slots - 1) / 2) * 260;
      this.addButton(x, btnY, `${getGood(inp.good).name} einlagern`, () => {
        const st = getState();
        const b = st.buildings[def.id];
        const held = st.cargo[inp.good] ?? 0;
        if (held <= 0) return;
        b.input[inp.good] = (b.input[inp.good] ?? 0) + held;
        st.cargo[inp.good] = 0;
        saveGame();
        this.rebuild();
      });
    });
    const xOut = GAME_WIDTH / 2 + (def.inputs.length - (slots - 1) / 2) * 260;
    this.addButton(xOut, btnY, `${getGood(def.outputGood).name} abholen`, () => {
      const st = getState();
      const b = st.buildings[def.id];
      const take = Math.min(b.output, WAGON_CAPACITY - cargoTotal(st));
      if (take <= 0) return;
      b.output -= take;
      st.cargo[def.outputGood] = (st.cargo[def.outputGood] ?? 0) + take;
      saveGame();
      this.rebuild();
    });
  }

  // Manager anstellen/entlassen und Handelsaufträge – unabhängig davon,
  // ob es in der Stadt eine Manufaktur gibt.
  private buildManagerButtons(): void {
    const s = getState();
    const hired = s.managers[s.cityId] === true;
    this.addButton(
      hired ? GAME_WIDTH / 2 - 150 : GAME_WIDTH / 2, 525,
      hired ? 'Manager entlassen' : `Manager anstellen (${MANAGER_WAGE} fl./Monat)`,
      () => {
        const st = getState();
        st.managers[st.cityId] = !(st.managers[st.cityId] === true);
        saveGame();
        this.rebuild();
      },
    );
    if (hired) {
      this.addButton(GAME_WIDTH / 2 + 170, 525, 'Handelsaufträge…', () =>
        this.scene.start('ManagerScene'),
      );
    }
  }

  private refreshInfo(def: BuildingDef): void {
    const s = getState();
    const owned = s.buildings[def.id];
    const recipe = def.inputs.length === 0
      ? `Fördert ${def.ratePerMonth}× ${getGood(def.outputGood).name} im Monat.`
      : `Verarbeitet ${def.inputs.map((i) => `${i.qty}× ${getGood(i.good).name}`).join(' + ')}` +
        ` zu 1× ${getGood(def.outputGood).name} (max. ${def.ratePerMonth}/Monat).`;

    if (!owned) {
      this.info.setText(
        `${def.name} (${TIER_NAMES[def.tier]})\n${def.description}\n\n${recipe}\n` +
        `Unterhalt: ${def.upkeep} fl./Monat\n\nDein Gold: ${s.gold} fl.`,
      );
      return;
    }
    const wh = s.warehouses[s.cityId];
    const stockOf = (goodId: string) => wh ? (wh.stock[goodId] ?? 0) : 0;
    const inputLines = def.inputs.map((i) =>
      `${getGood(i.good).name}: Manufaktur ${owned.input[i.good] ?? 0}` +
      ` · Wagen ${s.cargo[i.good] ?? 0} · Stadtlager ${stockOf(i.good)}`,
    );
    const outLine =
      `${getGood(def.outputGood).name}: abholbereit ${owned.output}` +
      ` · Stadtlager ${stockOf(def.outputGood)}` +
      ` (Wagen frei: ${WAGON_CAPACITY - cargoTotal(s)})`;
    const hired = s.managers[s.cityId] === true;
    const spouseRuns = hired && s.cityId === 'augsburg' && s.family.spouse;
    const managerLine = spouseRuns
      ? `${s.family.spouse} führt das Kontor persönlich – ohne Lohn.\n` +
        'Rohstoffe kommen per Handelsauftrag vom Markt ins Stadtlager\nund von dort in die Manufaktur.'
      : hired
      ? 'Manager: bestückt die Manufaktur aus dem Stadtlager.\n' +
        'Rohstoffe am Markt einkaufen lassen: über „Handelsaufträge…“\n(Einkauf landet im Stadtlager).'
      : 'Kein Manager: Du musst Rohstoffe selbst einlagern.' +
        (wh ? '' : '\n(Manager und Fertigware-Ablage brauchen ein Lager in dieser Stadt.)');
    const flowLine = wh
      ? 'Fertigware wird automatisch ins Stadtlager geliefert (solange Platz ist).'
      : 'Ohne Stadtlager bleibt Fertigware hier zur Abholung liegen.';
    this.info.setText(
      `${def.name} (${TIER_NAMES[def.tier]}, in deinem Besitz)\n` +
      `${recipe}\nUnterhalt: ${def.upkeep} fl./Monat\n\n` +
      `${inputLines.join('\n')}${inputLines.length ? '\n' : ''}` +
      `${outLine}\n${flowLine}\n\n${managerLine}`,
    );
  }

  private addButton(x: number, y: number, label: string, onClick: () => void): void {
    this.dynamicButtons.push(this.makeButton(x, y, label, onClick));
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '19px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 14, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
    return btn;
  }
}
