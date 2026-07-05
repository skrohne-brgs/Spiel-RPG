import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY, MANAGER_WAGE } from '../constants';
import { getGood } from '../data/goods';
import { buildingForCity, BuildingDef } from '../data/buildings';
import { getCity } from '../data/cities';
import { getState, cargoTotal, saveGame } from '../state';

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

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);

    this.dynamicButtons = [];
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
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
    if (!def) {
      this.info.setText('In dieser Stadt gibt es derzeit\nkeine Manufaktur zu erwerben.');
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

    // Manager
    const hired = s.managers[s.cityId] === true;
    this.addButton(
      GAME_WIDTH / 2, 525,
      hired ? 'Manager entlassen' : `Manager anstellen (${MANAGER_WAGE} fl./Monat)`,
      () => {
        const st = getState();
        st.managers[st.cityId] = !(st.managers[st.cityId] === true);
        saveGame();
        this.rebuild();
      },
    );
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
    const inputLines = def.inputs.map((i) =>
      `Eingelagert: ${owned.input[i.good] ?? 0}× ${getGood(i.good).name}` +
      ` (im Wagen: ${s.cargo[i.good] ?? 0})`,
    );
    const hired = s.managers[s.cityId] === true;
    const managerLine = hired
      ? 'Manager: angestellt – bestückt die Manufaktur aus dem Stadtlager\nund räumt Fertigware dorthin zurück.'
      : 'Kein Manager: Du musst selbst einlagern und abholen.' +
        (s.warehouses[s.cityId] ? '' : '\n(Ein Manager braucht zudem ein Lager in dieser Stadt.)');
    this.info.setText(
      `${def.name} (${TIER_NAMES[def.tier]}, in deinem Besitz)\n${def.description}\n\n` +
      `${recipe}\nUnterhalt: ${def.upkeep} fl./Monat\n\n` +
      `${inputLines.join('\n')}${inputLines.length ? '\n' : ''}` +
      `Fertig zur Abholung: ${owned.output}× ${getGood(def.outputGood).name}` +
      ` (Wagen frei: ${WAGON_CAPACITY - cargoTotal(s)})\n\n${managerLine}`,
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
