import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const OUT = '/home/user/Spiel-RPG/fugger-1494/src/assets';
mkdirSync(OUT + '/goods', { recursive: true });
mkdirSync(OUT + '/portraits', { recursive: true });

const K = '#3a2a14';

const svgs = {
  // ——— Waren (viewBox 32x32) ———
  'goods/erz': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M6 24 L11 14 L17 17 L14 25 Z" fill="#8f8f8f"/>
    <path d="M15 22 L21 12 L27 18 L24 26 Z" fill="#a8a8a8"/>
    <path d="M18 16 l3 -2 l2 3" stroke="#e8e8e8" fill="none"/>
  </g>`,
  'goods/salz': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M8 26 L16 8 L24 26 Z" fill="#f5f2e8"/>
    <path d="M13 20 l3 -5 l3 5" stroke="#c9c2ae" fill="none"/>
    <path d="M10 26 l2 -4 M22 26 l-2 -4" stroke="#c9c2ae"/>
  </g>`,
  'goods/wein': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <circle cx="13" cy="16" r="4" fill="#7b2d43"/>
    <circle cx="19" cy="16" r="4" fill="#8a3550"/>
    <circle cx="16" cy="21" r="4" fill="#6b2438"/>
    <circle cx="11" cy="22" r="3.4" fill="#8a3550"/>
    <circle cx="21" cy="22" r="3.4" fill="#7b2d43"/>
    <path d="M16 12 q0 -5 4 -7" fill="none" stroke-width="1.6"/>
    <path d="M20 6 q4 0 5 3 q-4 1 -5 -3" fill="#4e7d5b"/>
  </g>`,
  'goods/wolle': `<g stroke="${K}" stroke-width="1.3">
    <circle cx="16" cy="17" r="9" fill="#f0ece0"/>
    <path d="M9 15 q3 -3 6 0 q3 3 6 0 M10 20 q3 -3 6 0 q3 3 6 0" fill="none" stroke="#c9c2ae"/>
    <circle cx="16" cy="17" r="9" fill="none"/>
  </g>`,
  'goods/tuch': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <rect x="6" y="12" width="20" height="5" rx="2" fill="#8a2f1f"/>
    <rect x="6" y="17" width="20" height="5" rx="2" fill="#a63c28"/>
    <rect x="6" y="22" width="20" height="4" rx="2" fill="#8a2f1f"/>
    <path d="M6 14 q-3 5 0 10" fill="none"/>
  </g>`,
  'goods/kupfer': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M7 20 h8 l2 5 h-12 Z" fill="#c96a3c"/>
    <path d="M17 20 h8 l2 5 h-12 Z" fill="#b85a30"/>
    <path d="M12 13 h8 l2 5 h-12 Z" fill="#d97d4a"/>
  </g>`,
  'goods/branntwein': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M13 6 h6 v5 q5 3 5 9 a8 6 0 0 1 -16 0 q0 -6 5 -9 Z" fill="#c9dade"/>
    <path d="M10 21 a7 5 0 0 0 12 0 q-2 -3 -6 -3 q-4 0 -6 3" fill="#b8742c" stroke="none"/>
    <rect x="12" y="4" width="8" height="3" fill="#6b5636"/>
  </g>`,
  'goods/glas': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M10 6 h12 l-2 8 q-1 4 -4 4 q-3 0 -4 -4 Z" fill="#9fc4bc"/>
    <path d="M16 18 v6" stroke-width="1.6"/>
    <path d="M11 26 h10" stroke-width="1.6"/>
    <path d="M13 8 l1 5" stroke="#e6f2ee"/>
  </g>`,
  'goods/waffen': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M8 24 L22 8 l3 1 l-1 3 L10 26 Z" fill="#b8c4c9"/>
    <path d="M24 24 L10 8 L7 9 l1 3 L22 26 Z" fill="#cfd8db"/>
    <rect x="13" y="23" width="6" height="3" fill="#8a6a3f"/>
  </g>`,
  'goods/silber': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M7 20 h8 l2 5 h-12 Z" fill="#c4ccd1"/>
    <path d="M17 20 h8 l2 5 h-12 Z" fill="#aeb8be"/>
    <path d="M12 13 h8 l2 5 h-12 Z" fill="#d8dee2"/>
  </g>`,
  'goods/gewuerze': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M8 14 q8 -6 16 0 v9 q-8 5 -16 0 Z" fill="#b8742c"/>
    <path d="M8 14 q8 5 16 0" fill="none"/>
    <circle cx="13" cy="20" r="1.2" fill="#6b3a1f" stroke="none"/>
    <circle cx="18" cy="22" r="1.2" fill="#6b3a1f" stroke="none"/>
    <circle cx="21" cy="19" r="1.2" fill="#6b3a1f" stroke="none"/>
  </g>`,
  'goods/arznei': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M9 15 h14 l-2 9 h-10 Z" fill="#e8ddc4"/>
    <path d="M9 15 a7 4 0 0 1 14 0" fill="#d9c69a"/>
    <path d="M20 8 l4 -4 l2 2 l-4 4" fill="#8a6a3f"/>
  </g>`,
  'goods/schmuck': `<g stroke="${K}" stroke-width="1.3" stroke-linejoin="round">
    <path d="M8 12 q8 10 16 0" fill="none" stroke="#c9a227" stroke-width="2.2"/>
    <circle cx="16" cy="19" r="3.4" fill="#c9a227"/>
    <path d="M16 16 l2 3 l-2 3 l-2 -3 Z" fill="#7b2d43"/>
  </g>`,

  // ——— Porträts (viewBox 64x64, Büste) ———
  'portraits/p_fuerst': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#d9c69a"/>
    <path d="M12 58 q4 -16 20 -16 q16 0 20 16" fill="#7b2d43"/>
    <path d="M16 52 q6 -8 16 -8 q10 0 16 8 l-4 6 h-24 Z" fill="#8a6a3f"/>
    <circle cx="32" cy="28" r="10" fill="#e8c49a"/>
    <path d="M22 24 a10 10 0 0 1 20 0 l2 -2 l-4 -8 h-16 l-4 8 Z" fill="#4a3d28"/>
    <path d="M24 46 q8 4 16 0" stroke="#c9a227" stroke-width="2.4" fill="none"/>
  </g>`,
  'portraits/p_kaiser': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#c9b58a"/>
    <path d="M12 58 q4 -16 20 -16 q16 0 20 16" fill="#5c3a6b"/>
    <circle cx="32" cy="30" r="10" fill="#e8c49a"/>
    <path d="M22 22 h20 l-2 -7 l-4 3 l-4 -5 l-4 5 l-4 -3 Z" fill="#c9a227"/>
    <circle cx="32" cy="13" r="1.8" fill="#7b2d43"/>
    <path d="M26 36 q6 5 12 0 q-2 6 -6 6 q-4 0 -6 -6" fill="#b8b0a0" stroke="none"/>
    <circle cx="45" cy="52" r="5" fill="#c9a227"/>
    <path d="M45 45 v4 M43 49 h4" stroke-width="1.4"/>
  </g>`,
  'portraits/p_raubritter': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#8a8f8a"/>
    <path d="M12 58 q4 -14 20 -14 q16 0 20 14" fill="#4a4f4a"/>
    <path d="M22 30 a10 12 0 0 1 20 0 v6 h-20 Z" fill="#b8c4c9"/>
    <path d="M22 28 h20" stroke-width="2"/>
    <rect x="26" y="24" width="4" height="3" fill="${K}" stroke="none"/>
    <rect x="34" y="24" width="4" height="3" fill="${K}" stroke="none"/>
    <path d="M32 14 v-6 l4 2" fill="none" stroke="#8a2f1f" stroke-width="2"/>
  </g>`,
  'portraits/p_markt': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#d9c69a"/>
    <path d="M12 58 q4 -15 20 -15 q16 0 20 15" fill="#4e7d5b"/>
    <circle cx="32" cy="29" r="10" fill="#e8c49a"/>
    <path d="M20 22 q12 -8 24 0 l-2 3 q-10 -6 -20 0 Z" fill="#4a3d28"/>
    <path d="M18 50 h8 M22 50 v-4 M20 46 h4" stroke-width="1.4"/>
    <circle cx="45" cy="50" r="4" fill="#c9a227"/>
  </g>`,
  'portraits/p_partner': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#d9bfae"/>
    <path d="M12 58 q4 -15 20 -15 q16 0 20 15" fill="#8a3550"/>
    <path d="M24 44 q8 5 16 0 v6 h-16 Z" fill="#e8ddc4"/>
    <circle cx="32" cy="29" r="10" fill="#e8c49a"/>
    <path d="M22 26 a10 10 0 0 1 20 0 q3 -1 2 -5 q4 8 -2 12 q1 -4 -2 -5 a10 12 0 0 0 -16 0 q-3 1 -2 5 q-6 -4 -2 -12 q-1 4 2 5" fill="#8a6a3f"/>
    <path d="M28 20 q4 -3 8 0" fill="none" stroke="#c9a227"/>
  </g>`,
  'portraits/p_kind': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#d9c69a"/>
    <path d="M16 40 a16 14 0 0 1 32 0 a16 16 0 0 1 -32 0" fill="#e8ddc4"/>
    <circle cx="32" cy="30" r="9" fill="#e8c49a"/>
    <path d="M20 36 q-2 10 6 14 M44 36 q2 10 -6 14" fill="none" stroke="#c9b58a"/>
    <circle cx="29" cy="29" r="1" fill="${K}" stroke="none"/>
    <circle cx="35" cy="29" r="1" fill="${K}" stroke="none"/>
    <path d="M29 33 q3 2 6 0" fill="none"/>
    <path d="M32 20 q2 -3 4 -1" fill="none"/>
  </g>`,
  'portraits/p_gold': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#d9c69a"/>
    <ellipse cx="24" cy="46" rx="9" ry="4" fill="#c9a227"/>
    <ellipse cx="24" cy="42" rx="9" ry="4" fill="#d9b23c"/>
    <ellipse cx="40" cy="46" rx="9" ry="4" fill="#c9a227"/>
    <ellipse cx="40" cy="42" rx="9" ry="4" fill="#d9b23c"/>
    <ellipse cx="32" cy="36" rx="9" ry="4" fill="#c9a227"/>
    <circle cx="32" cy="22" r="8" fill="#d9b23c"/>
    <path d="M32 17 v10 M28 20 q4 -3 8 0" fill="none" stroke-width="1.4"/>
  </g>`,
  'portraits/p_kasse': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#b8ab8a"/>
    <path d="M20 30 q-4 18 12 18 q16 0 12 -18 q-6 4 -12 4 q-6 0 -12 -4" fill="#8a6a3f"/>
    <path d="M20 30 q12 8 24 0 l-3 -6 h-18 Z" fill="#6b5636"/>
    <path d="M26 22 q6 -4 12 0" fill="none" stroke-width="2"/>
    <path d="M28 40 l8 4 M36 40 l-8 4" stroke="#3a2a14" stroke-width="1.4"/>
  </g>`,
  'portraits/p_schiff': `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" fill="#9fb8c4"/>
    <path d="M14 42 q18 6 36 0 l-4 8 h-28 Z" fill="#8a6a3f"/>
    <path d="M32 40 v-24" stroke-width="2"/>
    <path d="M32 18 q12 6 0 16 Z" fill="#f0ece0"/>
    <path d="M32 20 q-9 5 0 12 Z" fill="#e8ddc4"/>
    <path d="M12 52 q6 -3 12 0 q6 3 12 0 q6 -3 12 0" fill="none" stroke="#4e6f7c"/>
  </g>`,

  // ——— Wappen (viewBox 64x80) ———
  'wappen': `<g stroke="${K}" stroke-width="2" stroke-linejoin="round">
    <path d="M8 6 h48 v38 q0 16 -24 28 q-24 -12 -24 -28 Z" fill="#1f4d8a"/>
    <path d="M32 6 h24 v38 q0 16 -24 28 Z" fill="#c9a227"/>
    <path d="M32 16 q-3 8 -9 10 q6 2 6 8 q0 5 -4 7 q7 0 7 8 v-33" fill="#c9a227" stroke-width="1.4"/>
    <path d="M32 16 q3 8 9 10 q-6 2 -6 8 q0 5 4 7 q-7 0 -7 8 v-33" fill="#1f4d8a" stroke-width="1.4"/>
  </g>`,
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, body] of Object.entries(svgs)) {
  const isGood = name.startsWith('goods/');
  const isWappen = name === 'wappen';
  const w = isGood ? 32 : 64;
  const h = isWappen ? 80 : w;
  const scale = 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  const page = await browser.newPage({ viewport: { width: w * scale, height: h * scale } });
  await page.setContent(`<style>*{margin:0}body{background:transparent}</style>${svg}`);
  await page.locator('svg').screenshot({ path: `${OUT}/${name}.png`, omitBackground: true });
  await page.close();
  console.log('ok', name);
}
await browser.close();
