import { chromium } from 'playwright-core';

const OUT = '/home/user/Spiel-RPG/fugger-1494/src/assets';
const K = '#1f1608'; // dunkle Kontur
// gedeckte Innenraum-Palette, damit das Pergament-Panel davor leuchtet
const WALL = '#3c2f1c';
const WOOD = '#4a3a24';
const WOOD2 = '#584732';
const LIGHT = '#8a6a3f';

const svgs = {
  // Marktplatz: Giebelhäuser, Stände mit Markisen, Fässer
  bg_markt: `
    <rect width="1280" height="720" fill="#2b2214"/>
    <rect width="1280" height="260" fill="#3a3222"/>
    <g fill="${WALL}" stroke="${K}" stroke-width="3">
      <path d="M40 260 v-120 l70 -60 l70 60 v120 Z"/>
      <path d="M220 260 v-100 l60 -50 l60 50 v100 Z"/>
      <path d="M380 260 v-140 l80 -70 l80 70 v140 Z"/>
      <path d="M580 260 v-90 l55 -45 l55 45 v90 Z"/>
      <path d="M730 260 v-130 l75 -60 l75 60 v130 Z"/>
      <path d="M920 260 v-100 l60 -50 l60 50 v100 Z"/>
      <path d="M1080 260 v-125 l70 -60 l70 60 v125 Z"/>
    </g>
    <g fill="#5c4a2e" opacity="0.8">
      <rect x="85" y="170" width="22" height="30"/><rect x="255" y="185" width="20" height="26"/>
      <rect x="430" y="150" width="24" height="32"/><rect x="612" y="195" width="18" height="24"/>
      <rect x="775" y="160" width="22" height="30"/><rect x="955" y="185" width="20" height="26"/>
      <rect x="1122" y="165" width="22" height="30"/>
    </g>
    <rect y="260" width="1280" height="460" fill="#33291a"/>
    <g stroke="#241c10" stroke-width="2" fill="none" opacity="0.6">
      <path d="M0 320 q160 -14 320 0 t320 0 t320 0 t320 0"/>
      <path d="M0 420 q160 -18 320 0 t320 0 t320 0 t320 0"/>
      <path d="M0 540 q160 -22 320 0 t320 0 t320 0 t320 0"/>
      <path d="M0 660 q160 -24 320 0 t320 0 t320 0 t320 0"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <rect x="60" y="340" width="240" height="16" fill="${WOOD}"/>
      <path d="M50 340 l30 -70 h180 l30 70 Z" fill="#6e2f22"/>
      <path d="M50 340 h240" stroke="#8a3a2a" stroke-width="10"/>
      <rect x="80" y="356" width="14" height="90" fill="${WOOD}"/>
      <rect x="266" y="356" width="14" height="90" fill="${WOOD}"/>
      <rect x="1000, " y="0" width="0" height="0" fill="none"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <rect x="980" y="360" width="220" height="16" fill="${WOOD}"/>
      <path d="M970 360 l28 -64 h164 l28 64 Z" fill="#2f4a33"/>
      <rect x="1000" y="376" width="14" height="84" fill="${WOOD}"/>
      <rect x="1166" y="376" width="14" height="84" fill="${WOOD}"/>
    </g>
    <g stroke="${K}" stroke-width="2.5">
      <ellipse cx="420" cy="640" rx="42" ry="14" fill="${WOOD2}"/>
      <rect x="378" y="560" width="84" height="80" fill="${WOOD2}"/>
      <ellipse cx="420" cy="560" rx="42" ry="14" fill="${LIGHT}"/>
      <path d="M378 585 h84 M378 615 h84" stroke-width="2"/>
      <rect x="850" y="590" width="60" height="50" fill="${WOOD}"/>
      <rect x="860" y="580" width="60" height="50" fill="${WOOD2}"/>
    </g>`,

  // Kontor: Holzvertäfelung, Butzenfenster, Pult mit Buch
  bg_kontor: `
    <rect width="1280" height="720" fill="#33281a"/>
    <g stroke="#241c10" stroke-width="3">
      <path d="M0 90 h1280 M0 720 h1280" fill="none"/>
      <rect x="0" y="0" width="1280" height="90" fill="#2b2214"/>
    </g>
    <g stroke="#241c10" stroke-width="2" opacity="0.7">
      <path d="M120 90 v540 M340 90 v540 M560 90 v540 M780 90 v540 M1000 90 v540 M1220 90 v540"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <rect x="160" y="150" width="150" height="200" fill="#241f16"/>
      <g stroke-width="2" stroke="#4a3d28">
        <circle cx="197" cy="188" r="16" fill="#5a6a58" opacity="0.5"/>
        <circle cx="235" cy="188" r="16" fill="#5a6a58" opacity="0.5"/>
        <circle cx="273" cy="188" r="16" fill="#5a6a58" opacity="0.55"/>
        <circle cx="197" cy="226" r="16" fill="#5a6a58" opacity="0.55"/>
        <circle cx="235" cy="226" r="16" fill="#6a7a64" opacity="0.6"/>
        <circle cx="273" cy="226" r="16" fill="#5a6a58" opacity="0.5"/>
        <circle cx="197" cy="264" r="16" fill="#5a6a58" opacity="0.5"/>
        <circle cx="235" cy="264" r="16" fill="#5a6a58" opacity="0.55"/>
        <circle cx="273" cy="264" r="16" fill="#5a6a58" opacity="0.5"/>
        <circle cx="216" cy="302" r="16" fill="#5a6a58" opacity="0.5"/>
        <circle cx="254" cy="302" r="16" fill="#5a6a58" opacity="0.5"/>
      </g>
    </g>
    <g stroke="${K}" stroke-width="3">
      <rect x="950" y="140" width="240" height="180" fill="${WOOD}"/>
      <path d="M950 185 h240 M950 230 h240 M950 275 h240" stroke-width="2.5"/>
      <rect x="965" y="150" width="26" height="30" fill="#6e2f22"/>
      <rect x="998" y="150" width="26" height="30" fill="#2f4a33"/>
      <rect x="1031" y="152" width="22" height="28" fill="#8a6a3f"/>
      <rect x="965" y="196" width="60" height="28" fill="#5c4a2e"/>
      <circle cx="1140" cy="205" r="14" fill="#c9a227" opacity="0.5"/>
      <rect x="965" y="241" width="30" height="28" fill="#6e2f22"/>
      <rect x="1002" y="241" width="30" height="28" fill="#5c4a2e"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <path d="M520 480 l180 0 l30 60 l-240 0 Z" fill="${WOOD2}"/>
      <rect x="545" y="540" width="18" height="120" fill="${WOOD}"/>
      <rect x="655" y="540" width="18" height="120" fill="${WOOD}"/>
      <path d="M560 470 q40 -14 80 0 q-40 8 -80 0" fill="#d9c69a" opacity="0.8"/>
      <path d="M700 462 l26 -20 l4 6 l-24 20 Z" fill="#d9c69a" opacity="0.7"/>
    </g>
    <circle cx="760" cy="452" r="7" fill="#c9a227" opacity="0.8"/>
    <rect x="754" y="459" width="12" height="22" fill="#b8ab8a" opacity="0.6"/>`,

  // Lagerhalle: Balken, Fässer, Säcke, Kisten
  bg_lager: `
    <rect width="1280" height="720" fill="#2e2416"/>
    <g stroke="#1f1608" stroke-width="4" opacity="0.9">
      <path d="M0 130 L640 40 L1280 130" fill="none"/>
      <path d="M120 720 V150 M420 720 V95 M860 720 V95 M1160 720 V150" stroke="${WOOD}" stroke-width="26"/>
      <path d="M120 250 L420 200 M860 200 L1160 250" stroke="${WOOD}" stroke-width="14"/>
    </g>
    <path d="M560 40 l60 0 l0 680 l-60 0 Z" fill="#c9a227" opacity="0.06"/>
    <g stroke="${K}" stroke-width="3">
      <ellipse cx="230" cy="640" rx="52" ry="16" fill="#3f321f"/>
      <rect x="178" y="540" width="104" height="100" fill="${WOOD2}"/>
      <ellipse cx="230" cy="540" rx="52" ry="16" fill="${LIGHT}"/>
      <path d="M178 570 h104 M178 610 h104" stroke-width="2.5"/>
      <ellipse cx="330" cy="660" rx="44" ry="13" fill="#3f321f"/>
      <rect x="286" y="580" width="88" height="80" fill="${WOOD2}"/>
      <ellipse cx="330" cy="580" rx="44" ry="13" fill="${LIGHT}"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <path d="M950 660 q10 -70 55 -70 q45 0 55 70 Z" fill="#6b5636"/>
      <path d="M1050 660 q8 -56 44 -56 q36 0 44 56 Z" fill="#5c4a2e"/>
      <path d="M985 596 q20 -14 40 0" fill="none" stroke-width="4"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <rect x="620" y="560" width="110" height="100" fill="${WOOD}"/>
      <rect x="640" y="480" width="110" height="80" fill="${WOOD2}"/>
      <path d="M620 610 h110 M640 520 h110" stroke-width="2"/>
    </g>
    <g stroke="${K}" stroke-width="2.5">
      <path d="M500 130 v60" stroke-width="3"/>
      <path d="M470 190 h60 l-8 26 h-44 Z" fill="${LIGHT}"/>
    </g>`,

  // Wechselstube: Steinwand, Bogenfenster, Tisch mit Münzen und Waage
  bg_bank: `
    <rect width="1280" height="720" fill="#2f281c"/>
    <g stroke="#241e12" stroke-width="2" opacity="0.7" fill="none">
      <path d="M0 160 h1280 M0 260 h1280 M0 360 h1280 M0 460 h1280"/>
      <path d="M160 160 v100 M480 160 v100 M800 160 v100 M1120 160 v100
               M320 260 v100 M640 260 v100 M960 260 v100
               M160 360 v100 M480 360 v100 M800 360 v100 M1120 360 v100"/>
    </g>
    <g stroke="${K}" stroke-width="4">
      <path d="M180 300 v-90 a70 70 0 0 1 140 0 v90 Z" fill="#1f2a30"/>
      <path d="M960 300 v-90 a70 70 0 0 1 140 0 v90 Z" fill="#1f2a30"/>
      <path d="M250 210 v90 M1030 210 v90" stroke-width="3"/>
    </g>
    <path d="M200 300 l100 420 h-160 Z" fill="#c9a227" opacity="0.05"/>
    <g stroke="${K}" stroke-width="3">
      <rect x="440" y="520" width="400" height="26" fill="${WOOD2}"/>
      <rect x="470" y="546" width="22" height="150" fill="${WOOD}"/>
      <rect x="788" y="546" width="22" height="150" fill="${WOOD}"/>
      <ellipse cx="540" cy="512" rx="26" ry="8" fill="#c9a227" opacity="0.7"/>
      <ellipse cx="540" cy="504" rx="26" ry="8" fill="#d9b23c" opacity="0.7"/>
      <ellipse cx="596" cy="512" rx="20" ry="7" fill="#c9a227" opacity="0.7"/>
      <path d="M700 452 v46 M670 470 a30 12 0 0 0 60 0 M670 470 l30 -18 l30 18" fill="none" stroke-width="3"/>
      <ellipse cx="670" cy="472" rx="14" ry="5" fill="#b8ab8a"/>
      <ellipse cx="730" cy="472" rx="14" ry="5" fill="#b8ab8a"/>
      <rect x="760" y="488" width="56" height="32" fill="#4a3d28"/>
      <path d="M760 488 a28 14 0 0 1 56 0" fill="#5c4a2e"/>
    </g>`,

  // Fuhrhof: Scheunentor, Wagen-Silhouette, Heu, Rad
  bg_fuhrpark: `
    <rect width="1280" height="720" fill="#2b2214"/>
    <rect width="1280" height="300" fill="#3b3226"/>
    <circle cx="1050" cy="90" r="36" fill="#d9c69a" opacity="0.18"/>
    <rect y="300" width="1280" height="420" fill="#33291a"/>
    <g stroke="${K}" stroke-width="4">
      <rect x="80" y="120" width="420" height="380" fill="${WOOD}"/>
      <path d="M80 120 L290 30 L500 120 Z" fill="#5c4a2e"/>
      <rect x="180" y="220" width="220" height="280" fill="#241c10"/>
      <path d="M180 220 L400 500 M400 220 L180 500" stroke="${WOOD2}" stroke-width="10"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <path d="M700 430 q60 -60 180 -50 l40 50 v60 h-220 Z" fill="#4f4030"/>
      <path d="M720 420 v70 M780 400 v90 M840 396 v94 M900 410 v80" stroke-width="2.5" stroke="#241c10"/>
      <circle cx="760" cy="510" r="34" fill="#3a2e1c"/>
      <circle cx="880" cy="510" r="34" fill="#3a2e1c"/>
      <circle cx="760" cy="510" r="8" fill="${LIGHT}"/>
      <circle cx="880" cy="510" r="8" fill="${LIGHT}"/>
    </g>
    <g stroke="${K}" stroke-width="3">
      <path d="M1020 560 q40 -60 120 -40 q40 20 20 40 Z" fill="#8a7440" opacity="0.85"/>
      <circle cx="1120" cy="620" r="46" fill="none" stroke-width="7" stroke="${WOOD2}"/>
      <path d="M1120 574 v92 M1074 620 h92 M1088 588 l64 64 M1152 588 l-64 64" stroke-width="4" stroke="${WOOD2}"/>
    </g>
    <g stroke="#241c10" stroke-width="3">
      <path d="M0 560 h80 M0 600 h80 M40 540 v80" />
      <path d="M560 620 h140 M560 660 h140 M595 600 v80 M665 600 v80"/>
    </g>`,

  // Studierzimmer (Chronik): Bücherwand, Globus, Kerze
  bg_chronik: `
    <rect width="1280" height="720" fill="#2e2517"/>
    <g stroke="${K}" stroke-width="3">
      <rect x="60" y="80" width="360" height="560" fill="${WOOD}"/>
      <path d="M60 200 h360 M60 320 h360 M60 440 h360 M60 560 h360" stroke-width="4"/>
      <g stroke-width="2">
        <rect x="80" y="120" width="24" height="76" fill="#6e2f22"/>
        <rect x="108" y="128" width="20" height="68" fill="#2f4a33"/>
        <rect x="132" y="122" width="26" height="74" fill="#8a6a3f"/>
        <rect x="162" y="130" width="18" height="66" fill="#5c4a2e"/>
        <rect x="184" y="120" width="24" height="76" fill="#3d5166"/>
        <rect x="212" y="126" width="22" height="70" fill="#6e2f22"/>
        <rect x="238" y="132" width="18" height="64" fill="#8a6a3f"/>
        <rect x="260" y="122" width="26" height="74" fill="#2f4a33"/>
        <rect x="290" y="128" width="20" height="68" fill="#5c4a2e"/>
        <rect x="314" y="120" width="24" height="76" fill="#6e2f22"/>
        <rect x="342" y="130" width="20" height="66" fill="#3d5166"/>
        <rect x="366" y="124" width="24" height="72" fill="#8a6a3f"/>
        <rect x="84" y="244" width="22" height="72" fill="#3d5166"/>
        <rect x="110" y="250" width="26" height="66" fill="#8a6a3f"/>
        <rect x="140" y="242" width="18" height="74" fill="#6e2f22"/>
        <rect x="162" y="252" width="24" height="64" fill="#2f4a33"/>
        <rect x="190" y="244" width="20" height="72" fill="#5c4a2e"/>
        <rect x="214" y="248" width="26" height="68" fill="#3d5166"/>
        <rect x="244" y="242" width="20" height="74" fill="#8a6a3f"/>
        <rect x="268" y="252" width="24" height="64" fill="#6e2f22"/>
        <rect x="296" y="246" width="18" height="70" fill="#2f4a33"/>
        <rect x="318" y="242" width="26" height="74" fill="#5c4a2e"/>
        <rect x="348" y="250" width="20" height="66" fill="#8a6a3f"/>
        <rect x="372" y="244" width="18" height="72" fill="#3d5166"/>
        <rect x="86" y="366" width="24" height="70" fill="#8a6a3f"/>
        <rect x="114" y="372" width="20" height="64" fill="#6e2f22"/>
        <rect x="138" y="364" width="26" height="72" fill="#5c4a2e"/>
        <rect x="168" y="370" width="18" height="66" fill="#2f4a33"/>
        <rect x="190" y="366" width="24" height="70" fill="#3d5166"/>
        <rect x="218" y="372" width="22" height="64" fill="#8a6a3f"/>
        <rect x="244" y="364" width="18" height="72" fill="#6e2f22"/>
        <rect x="266" y="370" width="26" height="66" fill="#5c4a2e"/>
        <rect x="296" y="366" width="20" height="70" fill="#2f4a33"/>
        <rect x="320" y="372" width="24" height="64" fill="#8a6a3f"/>
        <rect x="348" y="364" width="20" height="72" fill="#3d5166"/>
        <rect x="372" y="368" width="18" height="68" fill="#6e2f22"/>
      </g>
    </g>
    <g stroke="${K}" stroke-width="3">
      <circle cx="1080" cy="440" r="70" fill="#3d5166" opacity="0.85"/>
      <path d="M1080 370 a70 70 0 0 1 0 140 a35 70 0 0 0 0 -140 M1010 440 h140" fill="none" stroke-width="2.5"/>
      <path d="M1035 385 q45 -18 90 0 M1035 495 q45 18 90 0" fill="none" stroke-width="2"/>
      <path d="M1080 510 v60 M1050 570 h60" stroke-width="5"/>
    </g>
    <g stroke="${K}" stroke-width="2.5">
      <rect x="880" y="560" width="14" height="46" fill="#b8ab8a"/>
      <ellipse cx="887" cy="608" rx="26" ry="8" fill="${LIGHT}"/>
      <circle cx="887" cy="550" r="8" fill="#c9a227" opacity="0.8"/>
    </g>`,
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, body] of Object.entries(svgs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">${body}</svg>`;
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(`<style>*{margin:0}</style>${svg}`);
  await page.locator('svg').screenshot({ path: `${OUT}/${name}.png` });
  await page.close();
  console.log('ok', name);
}
await browser.close();
