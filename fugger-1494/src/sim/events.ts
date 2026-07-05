import Phaser from 'phaser';
import { CITIES } from '../data/cities';
import { GOODS } from '../data/goods';
import type { GameState } from '../state';
import { cargoTotal } from '../state';

export interface GameEvent {
  title: string;
  text: string;
}

// Beim Reisen: Gefahr durch Raubritter auf der Route.
export function rollTravelEvent(s: GameState): GameEvent | null {
  if (Math.random() >= 0.15) return null;

  if (cargoTotal(s) > 0 && Math.random() < 0.6) {
    // Ein Teil der Fracht geht verloren.
    const goodsHeld = Object.entries(s.cargo).filter(([, n]) => n > 0);
    const [goodId, held] = Phaser.Math.RND.pick(goodsHeld);
    const lost = Math.max(1, Math.ceil(held * 0.4));
    s.cargo[goodId] = held - lost;
    const name = GOODS.find((g) => g.id === goodId)!.name;
    return {
      title: 'Raubritter!',
      text: `Wegelagerer überfallen deinen Wagenzug.\nDu verlierst ${lost}× ${name}.`,
    };
  }

  const toll = Math.min(s.gold, Math.max(5, Math.round(s.gold * 0.08)));
  s.gold -= toll;
  return {
    title: 'Wegzoll',
    text: `Ein Raubritter verlangt Geleitgeld.\nDu zahlst ${toll} Gulden, um weiterziehen zu dürfen.`,
  };
}

// Monatlich: Marktereignis in einer zufälligen Stadt.
export function rollMarketEvent(s: GameState): GameEvent | null {
  if (Math.random() >= 0.20) return null;

  const city = Phaser.Math.RND.pick(CITIES);
  const good = Phaser.Math.RND.pick(GOODS);

  if (Math.random() < 0.5) {
    s.market[city.id][good.id] = 1.8;
    return {
      title: `Knappheit in ${city.name}`,
      text: `Missernte und stockende Lieferungen:\n${good.name} ist in ${city.name} plötzlich sehr gefragt.`,
    };
  }
  s.market[city.id][good.id] = 0.5;
  return {
    title: `Schwemme in ${city.name}`,
    text: `Volle Lager drücken den Preis:\n${good.name} ist in ${city.name} kaum noch etwas wert.`,
  };
}
