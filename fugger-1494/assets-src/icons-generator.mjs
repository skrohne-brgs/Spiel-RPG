import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';

const OUT = '/home/user/Spiel-RPG/fugger-1494/src/assets';
mkdirSync(OUT + '/cities', { recursive: true });

// Gemeinsame Farbwelt
// Mauern: helle Töne, Dächer: kräftige Akzente, Kontur: dunkles Braun
const K = '#3a2a14'; // Kontur

const svgs = {
  // ——— Städte (viewBox 64x64, Boden bei y=60) ———
  'cities/augsburg': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="10" y="30" width="14" height="30" fill="#e8ddc4"/>
      <rect x="40" y="30" width="14" height="30" fill="#e8ddc4"/>
      <path d="M10 30 L17 22 L24 30 Z" fill="#8a2f1f"/>
      <path d="M40 30 L47 22 L54 30 Z" fill="#8a2f1f"/>
      <rect x="22" y="24" width="20" height="36" fill="#f0e6cc"/>
      <path d="M22 24 L26 16 L32 12 L38 16 L42 24 Z" fill="#e8ddc4"/>
      <circle cx="32" cy="10" r="4" fill="#4e7d5b"/>
      <path d="M31 6 L33 6 L32 2 Z" fill="#c9a227"/>
      <rect x="28" y="46" width="8" height="14" fill="#6b5636"/>
      <rect x="26" y="30" width="5" height="7" fill="#5a7d8a"/>
      <rect x="33" y="30" width="5" height="7" fill="#5a7d8a"/>
      <rect x="13" y="36" width="4" height="6" fill="#5a7d8a"/>
      <rect x="46" y="36" width="4" height="6" fill="#5a7d8a"/>
    </g>`,
  'cities/innsbruck': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <path d="M2 60 L14 34 L26 60 Z" fill="#b8c4c9"/>
      <path d="M11 41 L14 34 L17 41 L14 44 Z" fill="#f0f4f5" stroke="none"/>
      <path d="M38 60 L50 30 L62 60 Z" fill="#b8c4c9"/>
      <path d="M46 40 L50 30 L54 40 L50 44 Z" fill="#f0f4f5" stroke="none"/>
      <rect x="18" y="34" width="28" height="26" fill="#f0e6cc"/>
      <path d="M16 34 L32 24 L48 34 Z" fill="#8a2f1f"/>
      <path d="M22 44 L32 38 L42 44 Z" fill="#c9a227"/>
      <rect x="24" y="44" width="16" height="5" fill="#e8ddc4"/>
      <rect x="28" y="52" width="8" height="8" fill="#6b5636"/>
      <rect x="20" y="38" width="4" height="4" fill="#5a7d8a"/>
      <rect x="40" y="38" width="4" height="4" fill="#5a7d8a"/>
    </g>`,
  'cities/venedig': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="0" y="56" width="64" height="8" fill="#5a7d8a" stroke="none"/>
      <rect x="24" y="14" width="12" height="42" fill="#b05a3c"/>
      <rect x="25" y="22" width="10" height="3" fill="#f0e6cc" stroke="none"/>
      <path d="M22 14 L30 4 L38 14 Z" fill="#4e7d5b"/>
      <rect x="38" y="38" width="20" height="18" fill="#f0e6cc"/>
      <path d="M38 38 Q48 26 58 38 Z" fill="#b8c4c9"/>
      <rect x="6" y="42" width="16" height="14" fill="#e8ddc4"/>
      <path d="M6 42 L14 36 L22 42 Z" fill="#8a2f1f"/>
      <rect x="44" y="44" width="4" height="6" fill="#5a7d8a"/>
      <rect x="51" y="44" width="4" height="6" fill="#5a7d8a"/>
    </g>`,
  'cities/rom': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="8" y="44" width="48" height="16" fill="#f0e6cc"/>
      <rect x="12" y="47" width="5" height="10" fill="#d9c69a"/>
      <rect x="21" y="47" width="5" height="10" fill="#d9c69a"/>
      <rect x="38" y="47" width="5" height="10" fill="#d9c69a"/>
      <rect x="47" y="47" width="5" height="10" fill="#d9c69a"/>
      <rect x="26" y="34" width="12" height="12" fill="#e8ddc4"/>
      <path d="M20 34 Q32 12 44 34 Z" fill="#b8c4c9"/>
      <rect x="30" y="8" width="4" height="8" fill="#e8ddc4"/>
      <path d="M29 8 L35 8 L32 2 Z" fill="#c9a227"/>
      <rect x="29" y="49" width="6" height="8" fill="#6b5636"/>
    </g>`,
  'cities/wien': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="8" y="38" width="40" height="22" fill="#f0e6cc"/>
      <path d="M6 38 L28 26 L50 38 Z" fill="#c9a227"/>
      <path d="M10 36 l6 -3 l6 3 l-6 3 Z" fill="#4e7d5b" stroke="none"/>
      <path d="M24 33 l6 -3 l6 3 l-6 3 Z" fill="#8a2f1f" stroke="none"/>
      <rect x="42" y="14" width="10" height="46" fill="#e8ddc4"/>
      <path d="M40 14 L47 0 L54 14 Z" fill="#6b5636"/>
      <rect x="44" y="24" width="6" height="8" fill="#5a7d8a"/>
      <rect x="16" y="48" width="8" height="12" fill="#6b5636"/>
      <rect x="14" y="42" width="5" height="5" fill="#5a7d8a"/>
      <rect x="28" y="42" width="5" height="5" fill="#5a7d8a"/>
    </g>`,
  'cities/krakau': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="6" y="40" width="52" height="20" fill="#b05a3c"/>
      <path d="M6 40 h6 v-5 h6 v5 h6 v-5 h6 v5 h6 v-5 h6 v5 h6 v-5 h6 v5 h4" fill="#b05a3c"/>
      <rect x="24" y="16" width="16" height="30" fill="#c96a48"/>
      <path d="M22 16 L32 4 L42 16 Z" fill="#4e7d5b"/>
      <rect x="28" y="26" width="8" height="6" fill="#f0e6cc"/>
      <rect x="28" y="48" width="8" height="12" fill="#6b5636"/>
      <rect x="12" y="46" width="5" height="6" fill="#f0e6cc"/>
      <rect x="47" y="46" width="5" height="6" fill="#f0e6cc"/>
    </g>`,
  'cities/antwerpen': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="14" y="26" width="24" height="34" fill="#c96a48"/>
      <path d="M14 26 h4 v-4 h4 v-4 h4 v-4 h4 v4 h4 v4 h4 v4" fill="#c96a48"/>
      <rect x="20" y="32" width="5" height="6" fill="#f0e6cc"/>
      <rect x="28" y="32" width="5" height="6" fill="#f0e6cc"/>
      <rect x="20" y="42" width="5" height="6" fill="#f0e6cc"/>
      <rect x="28" y="42" width="5" height="6" fill="#f0e6cc"/>
      <rect x="23" y="52" width="8" height="8" fill="#6b5636"/>
      <path d="M42 60 V34 L56 44 H42" fill="none"/>
      <path d="M42 34 L56 44" stroke-width="2.4"/>
      <rect x="40" y="56" width="18" height="4" fill="#6b5636"/>
      <path d="M56 44 v6" stroke-width="1.6"/>
      <rect x="53" y="50" width="6" height="5" fill="#c9a227"/>
    </g>`,
  'cities/lissabon': `
    <g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
      <rect x="0" y="56" width="64" height="8" fill="#5a7d8a" stroke="none"/>
      <rect x="18" y="20" width="20" height="36" fill="#f0e6cc"/>
      <path d="M18 20 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v4" fill="#f0e6cc"/>
      <circle cx="15" cy="38" r="5" fill="#e8ddc4"/>
      <circle cx="41" cy="38" r="5" fill="#e8ddc4"/>
      <rect x="24" y="30" width="8" height="8" fill="#5a7d8a"/>
      <rect x="25" y="46" width="6" height="10" fill="#6b5636"/>
      <path d="M46 56 q6 -2 12 0 l-2 4 h-8 Z" fill="#8a6a3f"/>
      <path d="M52 56 v-12" stroke-width="1.8"/>
      <path d="M52 45 q6 3 0 9" fill="#e8ddc4"/>
    </g>`,

  // ——— Icons (viewBox 32x32) ———
  'icon_building': `
    <g stroke="${K}" stroke-width="1.4" stroke-linejoin="round">
      <rect x="5" y="14" width="22" height="14" fill="#e8ddc4"/>
      <path d="M3 14 L16 4 L29 14 Z" fill="#8a2f1f"/>
      <rect x="13" y="19" width="6" height="9" fill="#6b5636"/>
      <path d="M9 14 v14 M23 14 v14" stroke="#8a6a3f" stroke-width="1"/>
      <rect x="14" y="8" width="4" height="4" fill="#f0e6cc"/>
    </g>`,
  'icon_manager': `
    <g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
      <circle cx="16" cy="10" r="5" fill="#e8c49a"/>
      <path d="M9 10 a7 7 0 0 1 14 0 l2 -1 l-3 -5 h-12 l-3 5 Z" fill="#1f4d8a"/>
      <path d="M8 30 v-8 a8 7 0 0 1 16 0 v8 Z" fill="#4e7d5b"/>
    </g>`,
  'icon_wagon': `
    <g stroke="${K}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M4 18 q12 -14 24 0 v4 h-24 Z" fill="#e8ddc4"/>
      <path d="M8 15 v7 M14 12.5 v9.5 M20 12.5 v9.5 M26 15 v7" stroke="#8a6a3f" stroke-width="1"/>
      <rect x="3" y="21" width="26" height="3" fill="#6b5636"/>
      <circle cx="10" cy="27" r="4" fill="#8a6a3f"/>
      <circle cx="22" cy="27" r="4" fill="#8a6a3f"/>
    </g>`,
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, body] of Object.entries(svgs)) {
  const size = name.startsWith('cities/') ? 64 : 32;
  const scale = 2; // 2x rastern für scharfe Kanten
  const px = size * scale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${size} ${size}">${body}</svg>`;
  const page = await browser.newPage({ viewport: { width: px, height: px } });
  await page.setContent(
    `<style>*{margin:0}body{background:transparent}</style>${svg}`,
  );
  const el = page.locator('svg');
  await el.screenshot({ path: `${OUT}/${name}.png`, omitBackground: true });
  await page.close();
  console.log('ok', name);
}
await browser.close();
