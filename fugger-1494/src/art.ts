import Phaser from 'phaser';
import erzPng from './assets/goods/erz.png';
import salzPng from './assets/goods/salz.png';
import weinPng from './assets/goods/wein.png';
import wollePng from './assets/goods/wolle.png';
import tuchPng from './assets/goods/tuch.png';
import kupferPng from './assets/goods/kupfer.png';
import branntweinPng from './assets/goods/branntwein.png';
import glasPng from './assets/goods/glas.png';
import waffenPng from './assets/goods/waffen.png';
import silberPng from './assets/goods/silber.png';
import gewuerzePng from './assets/goods/gewuerze.png';
import arzneiPng from './assets/goods/arznei.png';
import schmuckPng from './assets/goods/schmuck.png';
import pFuerst from './assets/portraits/p_fuerst.png';
import pKaiser from './assets/portraits/p_kaiser.png';
import pRaubritter from './assets/portraits/p_raubritter.png';
import pMarkt from './assets/portraits/p_markt.png';
import pPartner from './assets/portraits/p_partner.png';
import pKind from './assets/portraits/p_kind.png';
import pGold from './assets/portraits/p_gold.png';
import pKasse from './assets/portraits/p_kasse.png';
import pSchiff from './assets/portraits/p_schiff.png';
import wappenPng from './assets/wappen.png';

// Alle kleinen Kunst-Assets (Waren-Icons, Porträts, Wappen) zentral
// registrieren; mehrfach aufrufbar dank exists-Prüfung.
const ART: Record<string, string> = {
  good_erz: erzPng, good_salz: salzPng, good_wein: weinPng,
  good_wolle: wollePng, good_tuch: tuchPng, good_kupfer: kupferPng,
  good_branntwein: branntweinPng, good_glas: glasPng, good_waffen: waffenPng,
  good_silber: silberPng, good_gewuerze: gewuerzePng, good_arznei: arzneiPng,
  good_schmuck: schmuckPng,
  p_fuerst: pFuerst, p_kaiser: pKaiser, p_raubritter: pRaubritter,
  p_markt: pMarkt, p_partner: pPartner, p_kind: pKind,
  p_gold: pGold, p_kasse: pKasse, p_schiff: pSchiff,
  wappen: wappenPng,
};

export function preloadArt(scene: Phaser.Scene): void {
  for (const [key, url] of Object.entries(ART)) {
    if (!scene.textures.exists(key)) scene.load.image(key, url);
  }
}
