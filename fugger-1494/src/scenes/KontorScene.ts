import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WAGON_CAPACITY } from '../constants';
import { GOODS } from '../data/goods';
import { buildingForCity, BuildingDef } from '../data/buildings';
import { getCity } from '../data/cities';
import { getState, cargoTotal, saveGame } from '../state';

// Kontor: Manufaktur der Stadt kaufen bzw. Rohstoffe einlagern
// und Fertigwaren in den Wagen holen.
export class KontorScene extends Phaser.Scene {
  private info!: Phaser.GameObjects.Text;

  constructor() {
    super('KontorScene');
  }

  create(): void {
    const s = getState();
    const city = getCity(s.cityId);
    const def = buildingForCity(s.cityId);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.uiPanel);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 480, COLORS.parchment)
      .setStrokeStyle(4, COLORS.gold);

    this.add.text(GAME_WIDTH / 2, 150, `Kontor zu ${city.name}`, {
      fontFamily: 'Georgia, serif', fontSize: '30px', color: '#3a2a14', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.info = this.add.text(GAME_WIDTH / 2, 320, '', {
      fontFamily: 'Georgia, serif', fontSize: '21px', color: '#3a2a14',
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    if (def) {
      this.buildActions(def);
    }
    this.makeButton(GAME_WIDTH / 2, GAME_HEIGHT - 160, 'Zurück zum Markt', () =>
      this.scene.start('MarketScene'),
    );
    this.refresh();
  }

  private buildActions(def: BuildingDef): void {
    const s = getState();
    if (!s.buildings[def.id]) {
      this.makeButton(GAME_WIDTH / 2, 480, `${def.name} kaufen (${def.cost} fl.)`, () => {
        const st = getState();
        if (st.gold < def.cost || st.buildings[def.id]) return;
        st.gold -= def.cost;
        st.buildings[def.id] = { input: 0, output: 0 };
        saveGame();
        this.scene.restart();
      });
      return;
    }

    const inputName = GOODS.find((g) => g.id === def.inputGood)!.name;
    const outputName = GOODS.find((g) => g.id === def.outputGood)!.name;
    this.makeButton(GAME_WIDTH / 2 - 170, 480, `${inputName} einlagern`, () => {
      const st = getState();
      const b = st.buildings[def.id];
      const held = st.cargo[def.inputGood] ?? 0;
      if (held <= 0) return;
      b.input += held;
      st.cargo[def.inputGood] = 0;
      saveGame();
      this.refresh();
    });
    this.makeButton(GAME_WIDTH / 2 + 170, 480, `${outputName} abholen`, () => {
      const st = getState();
      const b = st.buildings[def.id];
      const space = WAGON_CAPACITY - cargoTotal(st);
      const take = Math.min(b.output, space);
      if (take <= 0) return;
      b.output -= take;
      st.cargo[def.outputGood] = (st.cargo[def.outputGood] ?? 0) + take;
      saveGame();
      this.refresh();
    });
  }

  private refresh(): void {
    const s = getState();
    const def = buildingForCity(s.cityId);
    if (!def) {
      this.info.setText('In dieser Stadt gibt es derzeit\nkeine Manufaktur zu erwerben.');
      return;
    }
    const inputName = GOODS.find((g) => g.id === def.inputGood)!.name;
    const outputName = GOODS.find((g) => g.id === def.outputGood)!.name;
    const owned = s.buildings[def.id];
    if (!owned) {
      this.info.setText(
        `${def.name}\n${def.description}\n\n` +
        `Verarbeitet ${def.inputPerOutput}× ${inputName} zu 1× ${outputName},\n` +
        `bis zu ${def.ratePerMonth}× ${outputName} im Monat.\n\n` +
        `Dein Gold: ${s.gold} fl.`,
      );
      return;
    }
    this.info.setText(
      `${def.name} (in deinem Besitz)\n${def.description}\n\n` +
      `Eingelagert: ${owned.input}× ${inputName}\n` +
      `Fertig zur Abholung: ${owned.output}× ${outputName}\n\n` +
      `Im Wagen: ${s.cargo[def.inputGood] ?? 0}× ${inputName}, ` +
      `${s.cargo[def.outputGood] ?? 0}× ${outputName} ` +
      `(frei: ${WAGON_CAPACITY - cargoTotal(s)})`,
    );
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '21px',
      color: '#e8d9b0', backgroundColor: '#6b5636',
      padding: { x: 18, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setBackgroundColor('#8a2f1f'));
    btn.on('pointerout', () => btn.setBackgroundColor('#6b5636'));
    btn.on('pointerdown', onClick);
  }
}
