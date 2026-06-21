import type { MissionData } from '../types';
import { MAP_TILES, ENEMY_ENCOUNTERS, RESOURCES, STORY_TRIGGERS } from './mapData';
import { CITIES } from './cities';

export const CAMPAIGN: MissionData[] = [

  // ── Mission 0: Eriador ───────────────────────────────────────────────────────
  {
    id: 'eriador',
    title: 'Eriador',
    subtitle: 'Die Ankunft der Überlebenden',
    description: 'Saurons Truppen streifen durch Eriador. Befreie das Land und erreiche die Grenze zu Mordor.',
    mapTiles: MAP_TILES,
    enemies: ENEMY_ENCOUNTERS,
    resources: RESOURCES,
    storyTriggers: STORY_TRIGGERS,
    cities: CITIES.map(c => ({
      id: c.id, name: c.name, description: c.description,
      tileX: c.tileX, tileY: c.tileY,
      recruitOptions: c.recruitOptions,
    })),
    victoryTile: { x: 17, y: 10 },
    startTile: { x: 5, y: 2 },
    victoryEventId: 'mordor_border',
    introEventId: 'intro',
    victoryCondition: { type: 'reach' },
    loreItems: [
      { id: 'lore_eriador_edain', title: 'Stein der Edain',  text: '', tileX: 3, tileY: 6  },
      { id: 'lore_eriador_road',  title: 'Alter Wegstein',   text: '', tileX: 7, tileY: 10 },
    ],
    sideObjectives: [
      {
        id: 'eriador_all_enemies', type: 'defeat_all_enemies',
        description: 'Besiege alle feindlichen Patrouillen in Eriador',
        goldReward: 350,
      },
      {
        id: 'eriador_forest_ambush', type: 'defeat_enemy', enemyId: 'forest_ambush',
        description: 'Vernichte den Hinterhalt im Wald',
        unitReward: { unitId: 'numenorean_warrior', count: 5 },
      },
    ],
  },

  // ── Mission 1: Gondors Gründung ──────────────────────────────────────────────
  {
    id: 'gondor',
    title: "Gondors Gründung",
    subtitle: 'Die weiße Stadt des Südens',
    description: 'Finde die Frucht des Weißen Baumes – das heilige Symbol Gondors – und sicher so das Erbe Númenors.',
    mapTiles: [
      [1,1,1,0,0,0,0,0,0,2,2,2,0,0,0,1,1,7,1,1],
      [1,1,0,0,0,5,0,0,2,2,2,0,0,0,0,1,1,5,1,1],
      [1,0,0,0,5,5,0,0,2,2,0,0,0,0,1,1,1,7,1,1],
      [3,1,0,0,5,0,0,0,2,0,0,0,0,0,5,1,1,5,1,1],
      [3,3,0,5,5,0,0,0,0,0,0,0,0,5,5,0,1,0,1,1],
      [3,3,0,5,0,0,0,0,0,0,0,0,5,5,0,0,0,0,1,1],
      [3,3,0,5,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,1],
      [3,0,0,5,0,0,0,0,0,7,5,5,0,0,0,0,0,0,0,1],
      [3,0,0,0,5,0,0,0,5,5,0,0,0,0,0,0,0,0,1,1],
      [3,0,0,0,5,0,0,5,5,0,0,0,0,0,0,0,0,1,1,1],
      [3,0,4,0,5,5,5,5,0,0,0,0,0,0,0,0,1,1,1,1],
      [3,0,0,0,0,5,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
      [3,0,0,4,0,5,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
      [3,0,0,0,0,7,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
      [3,3,3,0,0,5,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    ],
    enemies: [
      {
        id: 'gondor_patrol_1', name: 'Ork-Grenzwache',
        stacks: [{ unitId: 'orc_soldier', count: 10 }],
        defeated: false, tileX: 6, tileY: 11,
      },
      {
        id: 'gondor_ambush', name: 'Hinterhalt am Fluss',
        stacks: [{ unitId: 'orc_archer', count: 8 }, { unitId: 'orc_soldier', count: 6 }],
        defeated: false, tileX: 4, tileY: 8,
      },
      {
        id: 'gondor_warg', name: 'Warg-Streitmacht',
        stacks: [{ unitId: 'orc_warg_rider', count: 7 }],
        defeated: false, tileX: 9, tileY: 5,
      },
      {
        id: 'gondor_troll', name: 'Troll-Wächter',
        stacks: [{ unitId: 'troll', count: 1 }, { unitId: 'orc_soldier', count: 10 }],
        defeated: false, tileX: 12, tileY: 3,
      },
      {
        id: 'gondor_nazgul', name: 'Nazgûl-Vorbote',
        stacks: [{ unitId: 'nazgul', count: 1 }, { unitId: 'orc_warg_rider', count: 4 }],
        defeated: false, tileX: 15, tileY: 6,
      },
      {
        id: 'gondor_osgiliath', name: 'Verteidiger Osgiliahs',
        stacks: [{ unitId: 'orc_soldier', count: 15 }, { unitId: 'orc_archer', count: 8 }],
        defeated: false, tileX: 9, tileY: 9,
      },
    ],
    resources: [
      { id: 'g1_gold_1', type: 'gold', tileX: 3, tileY: 12, collected: false, goldValue: 200 },
      { id: 'g1_gold_2', type: 'gold', tileX: 6, tileY: 9,  collected: false, goldValue: 250 },
      { id: 'g1_gold_3', type: 'gold', tileX: 11, tileY: 6, collected: false, goldValue: 300 },
      { id: 'g1_gold_4', type: 'gold', tileX: 14, tileY: 4, collected: false, goldValue: 175 },
      { id: 'g1_art_1', type: 'artifact', tileX: 7,  tileY: 10, collected: false, artifactId: 'narsil_shard'     },
      { id: 'g1_art_2', type: 'artifact', tileX: 13, tileY: 7,  collected: false, artifactId: 'elendilmir'       },
      { id: 'g1_victory', type: 'artifact', tileX: 13, tileY: 2, collected: false, artifactId: 'white_tree_fruit' },
    ],
    storyTriggers: {
      '5,13': 'gondor_intro',
      '9,7':  'ancient_road',
    },
    cities: [
      {
        id: 'pelargir', name: 'Pelargir', description: 'Ältester Hafen Gondors am Anduin.',
        tileX: 5, tileY: 13,
        recruitOptions: [
          { unitId: 'numenorean_warrior', cost: 50, available: 20 },
          { unitId: 'numenorean_archer',  cost: 70, available: 12 },
        ],
      },
      {
        id: 'osgiliath', name: 'Osgiliath', description: 'Hauptstadt Gondors an beiden Ufern des Anduin.',
        tileX: 9, tileY: 7,
        recruitOptions: [
          { unitId: 'numenorean_warrior', cost: 50, available: 15 },
          { unitId: 'dunedain_ranger',    cost: 90, available: 8  },
        ],
      },
      {
        id: 'minas_anor', name: 'Minas Anor', description: 'Die Turm der Sonne – Festung Gondors.',
        tileX: 17, tileY: 2,
        recruitOptions: [
          { unitId: 'elven_warrior',   cost: 120, available: 8  },
          { unitId: 'elven_cavalry',   cost: 180, available: 4  },
          { unitId: 'dunedain_ranger', cost: 90,  available: 6  },
        ],
      },
    ],
    victoryTile: { x: 13, y: 2 },
    startTile: { x: 5, y: 13 },
    victoryEventId: 'gondor_complete',
    introEventId: 'gondor_intro',
    victoryCondition: { type: 'artifact', artifactId: 'white_tree_fruit' },
    loreItems: [
      { id: 'lore_gondor_anduin', title: 'Marmorinschrift', text: '', tileX: 3,  tileY: 9 },
      { id: 'lore_gondor_camp',   title: 'Gondors Erstes Lager', text: '', tileX: 11, tileY: 4 },
    ],
    sideObjectives: [
      {
        id: 'gondor_collect_gold', type: 'collect_all_gold',
        description: 'Sichere alle Goldvorräte auf dem Weg nach Gondor',
        unitReward: { unitId: 'numenorean_warrior', count: 6 },
      },
      {
        id: 'gondor_defeat_nazgul', type: 'defeat_enemy', enemyId: 'gondor_nazgul',
        description: 'Verjage den Nazgûl-Vorboten aus Gondors Grenzen',
        goldReward: 300,
      },
    ],
  },

  // ── Mission 2: Der Bergpass / Moria ──────────────────────────────────────────
  {
    id: 'moria',
    title: 'Der Bergpass',
    subtitle: 'Durch die Tiefen Morias',
    description: 'Besiege den Ausgangs-Wächter und führe dein Heer durch die gefährlichen Bergpässe Morias ans Tageslicht.',
    mapTiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1],
      [1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1],
      [1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,0,1,1,1,1],
      [1,1,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,1,1,1],
      [1,0,0,1,1,4,4,4,0,1,4,4,4,0,1,1,0,0,1,1],
      [0,0,1,1,4,4,4,4,4,0,4,4,4,4,0,0,1,1,1,1],
      [0,7,5,4,4,4,4,4,4,5,4,4,4,4,5,5,5,0,1,1],
      [0,0,1,1,4,4,4,4,4,0,4,4,4,4,0,0,1,1,1,1],
      [1,0,0,1,1,4,4,4,0,1,4,4,4,0,1,1,0,0,1,1],
      [1,1,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,1,1,1],
      [1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,0,1,1,1,1],
      [1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1],
      [1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    enemies: [
      {
        id: 'moria_gate', name: 'Eingangs-Wächter',
        stacks: [{ unitId: 'cave_troll', count: 1 }, { unitId: 'orc_soldier', count: 8 }],
        defeated: false, tileX: 4, tileY: 7,
      },
      {
        id: 'moria_depths', name: 'Tiefen-Patrouille',
        stacks: [{ unitId: 'orc_soldier', count: 12 }, { unitId: 'orc_archer', count: 6 }],
        defeated: false, tileX: 9, tileY: 6,
      },
      {
        id: 'moria_troll_pack', name: 'Troll-Rudel',
        stacks: [{ unitId: 'cave_troll', count: 2 }],
        defeated: false, tileX: 7, tileY: 8,
      },
      {
        id: 'moria_nazgul', name: 'Schatten der Tiefe',
        stacks: [{ unitId: 'nazgul', count: 1 }, { unitId: 'orc_warg_rider', count: 5 }],
        defeated: false, tileX: 13, tileY: 5,
      },
      {
        id: 'moria_exit', name: 'Ausgangs-Wächter',
        stacks: [{ unitId: 'cave_troll', count: 1 }, { unitId: 'orc_archer', count: 10 }],
        defeated: false, tileX: 14, tileY: 7,
      },
    ],
    resources: [
      { id: 'g2_gold_1', type: 'gold', tileX: 5,  tileY: 6, collected: false, goldValue: 300 },
      { id: 'g2_gold_2', type: 'gold', tileX: 9,  tileY: 8, collected: false, goldValue: 250 },
      { id: 'g2_gold_3', type: 'gold', tileX: 12, tileY: 6, collected: false, goldValue: 200 },
      { id: 'g2_art_1', type: 'artifact', tileX: 8,  tileY: 7, collected: false, artifactId: 'ring_barahir'  },
      { id: 'g2_art_2', type: 'artifact', tileX: 10, tileY: 7, collected: false, artifactId: 'mithril_armor' },
    ],
    storyTriggers: {
      '1,7':  'moria_intro',
      '9,7':  'eregion',
      '17,7': 'moria_complete',
    },
    cities: [
      {
        id: 'caradhras_camp', name: 'Caradhras-Lager', description: 'Vorgeschobenes Lager am Eingang der Bergpässe.',
        tileX: 1, tileY: 7,
        recruitOptions: [
          { unitId: 'numenorean_warrior', cost: 50,  available: 18 },
          { unitId: 'dunedain_ranger',    cost: 90,  available: 10 },
          { unitId: 'elven_warrior',      cost: 120, available: 6  },
        ],
      },
    ],
    victoryTile: { x: 17, y: 7 },
    startTile: { x: 1, y: 7 },
    victoryEventId: 'moria_complete',
    introEventId: 'moria_intro',
    victoryCondition: { type: 'boss_then_reach', enemyId: 'moria_exit' },
    phaseOneEventId: 'moria_boss_defeated',
    loreItems: [
      { id: 'lore_moria_khazad', title: 'Zwerg-Inschrift',       text: '', tileX: 5, tileY: 5 },
      { id: 'lore_moria_scroll', title: 'Verlorenes Tagebuch',   text: '', tileX: 9, tileY: 8 },
    ],
    sideObjectives: [
      {
        id: 'moria_discover_lore', type: 'discover_all_lore',
        description: 'Entziffere alle Inschriften in Morias Tiefen',
        goldReward: 400,
      },
      {
        id: 'moria_troll_pack', type: 'defeat_enemy', enemyId: 'moria_troll_pack',
        description: 'Vernichte das Troll-Rudel im Herzen Morias',
        unitReward: { unitId: 'elven_warrior', count: 4 },
      },
    ],
  },

  // ── Mission 3: Die Ostlande / Rhûn ───────────────────────────────────────────
  {
    id: 'rhun',
    title: 'Die Ostlande',
    subtitle: 'Die Zitadelle von Rhûn',
    description: 'Finde das Zepter des Rhûn-Königs und marschiere dann zur Zitadelle, um Saurons Griff auf die Ostlande zu brechen.',
    mapTiles: [
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,7,6,3],
      [2,2,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,5,6,3],
      [0,2,0,0,0,5,5,0,0,0,0,0,6,6,6,6,5,6,7,3],
      [0,0,0,0,5,5,0,0,0,0,0,6,6,6,6,5,5,0,6,3],
      [0,0,0,5,5,0,0,0,0,0,6,6,6,6,5,5,0,0,0,3],
      [0,0,5,5,0,0,0,0,0,6,6,6,6,5,5,0,0,0,0,3],
      [0,5,5,0,0,0,4,0,6,6,6,6,5,5,0,0,0,0,0,3],
      [7,5,0,0,0,0,0,0,6,6,5,5,0,0,0,0,0,0,0,3],
      [0,5,5,0,0,0,4,0,6,6,6,5,5,0,0,0,0,0,0,3],
      [0,0,5,5,0,0,0,0,6,6,5,5,0,0,0,0,0,0,0,3],
      [0,0,0,5,5,0,0,6,6,5,5,0,0,0,0,0,0,0,0,3],
      [0,0,0,0,5,5,6,6,5,5,0,0,0,0,0,0,0,0,0,3],
      [2,0,0,0,0,6,6,5,0,0,0,0,0,0,0,0,0,0,0,3],
      [2,2,0,0,6,6,5,0,0,0,0,0,0,0,0,0,0,0,3,3],
      [2,2,2,6,6,5,0,0,0,0,0,0,0,0,0,0,0,3,3,3],
    ],
    enemies: [
      {
        id: 'rhun_patrol_1', name: 'Rhûn-Grenzpatrouille',
        stacks: [{ unitId: 'easterling_warrior', count: 10 }],
        defeated: false, tileX: 5, tileY: 9,
      },
      {
        id: 'rhun_riders', name: 'Rhûn-Reiterstaffel',
        stacks: [{ unitId: 'easterling_rider', count: 8 }],
        defeated: false, tileX: 8, tileY: 6,
      },
      {
        id: 'rhun_force', name: 'Ost-Streitmacht',
        stacks: [{ unitId: 'easterling_warrior', count: 12 }, { unitId: 'easterling_rider', count: 5 }],
        defeated: false, tileX: 12, tileY: 4,
      },
      {
        id: 'rhun_troll', name: 'Bergtroll-Wächter',
        stacks: [{ unitId: 'cave_troll', count: 1 }, { unitId: 'easterling_warrior', count: 8 }],
        defeated: false, tileX: 14, tileY: 2,
      },
      {
        id: 'rhun_commander', name: 'Rhûn-Kommandant',
        stacks: [{ unitId: 'easterling_rider', count: 10 }, { unitId: 'easterling_warrior', count: 8 }],
        defeated: false, tileX: 16, tileY: 1,
      },
    ],
    resources: [
      { id: 'g3_gold_1', type: 'gold', tileX: 4,  tileY: 6,  collected: false, goldValue: 250 },
      { id: 'g3_gold_2', type: 'gold', tileX: 9,  tileY: 10, collected: false, goldValue: 300 },
      { id: 'g3_gold_3', type: 'gold', tileX: 14, tileY: 5,  collected: false, goldValue: 350 },
      { id: 'g3_art_1', type: 'artifact', tileX: 6,  tileY: 12, collected: false, artifactId: 'narsil_shard' },
      { id: 'g3_art_2', type: 'artifact', tileX: 15, tileY: 3,  collected: false, artifactId: 'elendilmir'   },
      { id: 'g3_victory', type: 'artifact', tileX: 16, tileY: 0, collected: false, artifactId: 'rhun_scepter'  },
    ],
    storyTriggers: {
      '0,7':  'rhun_intro',
      '6,6':  'wasteland_signs',
      '18,2': 'rhun_complete',
    },
    cities: [
      {
        id: 'allianz_lager', name: 'Verbündeten-Lager', description: 'Befestigtes Lager der Allianz an der Grenze zu Rhûn.',
        tileX: 0, tileY: 7,
        recruitOptions: [
          { unitId: 'numenorean_warrior', cost: 50,  available: 20 },
          { unitId: 'elven_warrior',      cost: 120, available: 10 },
          { unitId: 'elven_cavalry',      cost: 180, available: 6  },
        ],
      },
      {
        id: 'rhun_citadel', name: 'Rhûn-Zitadelle', description: 'Die gefürchtete Festung der Easterlings.',
        tileX: 18, tileY: 2,
        recruitOptions: [
          { unitId: 'dunedain_ranger', cost: 90, available: 8 },
        ],
      },
    ],
    victoryTile: { x: 18, y: 2 },
    startTile: { x: 0, y: 7 },
    victoryEventId: 'rhun_complete',
    introEventId: 'rhun_intro',
    victoryCondition: { type: 'artifact_then_reach', artifactId: 'rhun_scepter' },
    phaseOneEventId: 'rhun_artifact_found',
    loreItems: [
      { id: 'lore_rhun_steppe',    title: 'Fremdartige Inschrift', text: '', tileX: 2,  tileY: 4 },
      { id: 'lore_rhun_wasteland', title: 'Zerbrochene Figur',     text: '', tileX: 10, tileY: 8 },
    ],
    sideObjectives: [
      {
        id: 'rhun_defeat_commander', type: 'defeat_enemy', enemyId: 'rhun_commander',
        description: 'Besiege den Rhûn-Kommandanten und breche den Führungswillen',
        goldReward: 500,
      },
      {
        id: 'rhun_all_enemies', type: 'defeat_all_enemies',
        description: 'Befreie die gesamten Ostlande von Saurons Truppen',
        unitReward: { unitId: 'elven_cavalry', count: 3 },
      },
    ],
  },

  // ── Mission 4: Die Letzte Allianz / Barad-dûr ────────────────────────────────
  {
    id: 'mordor',
    title: 'Die Letzte Allianz',
    subtitle: 'Barad-dûr muss fallen',
    description: 'Besiege Saurons mächtigen Leutnant und stürme dann Barad-dûr, um Saurons Herrschaft für immer zu beenden.',
    mapTiles: [
      [1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1],
      [1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1],
      [1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,5,6,1,1,1,1],
      [6,6,6,6,6,6,6,6,6,6,6,6,6,5,5,6,6,7,6,1],
      [6,6,6,6,6,6,6,6,6,6,6,6,5,5,6,6,6,1,1,1],
      [6,6,6,6,6,6,6,6,6,6,6,5,5,6,6,6,1,1,1,1],
      [6,6,6,6,6,6,6,6,6,6,5,5,6,6,6,1,1,1,1,1],
      [6,6,6,6,6,6,6,6,6,5,5,6,6,6,1,1,1,1,1,1],
      [6,6,6,6,6,6,6,6,5,5,6,6,6,1,1,1,1,1,1,1],
      [6,6,6,6,6,6,6,5,5,6,6,6,1,1,1,1,1,1,1,1],
      [6,7,5,5,5,5,5,5,6,6,6,1,1,1,1,1,1,1,1,1],
      [6,6,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1,1,1,1],
      [1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,6,6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    enemies: [
      {
        id: 'mordor_patrol_1', name: 'Mordor-Grenzwache',
        stacks: [{ unitId: 'orc_soldier', count: 15 }, { unitId: 'orc_warg_rider', count: 6 }],
        defeated: false, tileX: 5, tileY: 11,
      },
      {
        id: 'mordor_nazgul_1', name: 'Erster Nazgûl',
        stacks: [{ unitId: 'nazgul', count: 1 }, { unitId: 'orc_soldier', count: 12 }],
        defeated: false, tileX: 8, tileY: 9,
      },
      {
        id: 'mordor_troll_pack', name: 'Troll-Horde',
        stacks: [{ unitId: 'troll', count: 2 }, { unitId: 'cave_troll', count: 1 }],
        defeated: false, tileX: 10, tileY: 7,
      },
      {
        id: 'mordor_nazgul_2', name: 'Zweiter Nazgûl',
        stacks: [{ unitId: 'nazgul', count: 2 }, { unitId: 'orc_warg_rider', count: 8 }],
        defeated: false, tileX: 12, tileY: 5,
      },
      {
        id: 'mordor_lieutenant', name: 'Saurons Leutnant',
        stacks: [{ unitId: 'saurons_lieutenant', count: 1 }, { unitId: 'orc_soldier', count: 20 }],
        defeated: false, tileX: 15, tileY: 4,
      },
    ],
    resources: [
      { id: 'g4_gold_1', type: 'gold', tileX: 4,  tileY: 10, collected: false, goldValue: 400 },
      { id: 'g4_gold_2', type: 'gold', tileX: 8,  tileY: 8,  collected: false, goldValue: 350 },
      { id: 'g4_gold_3', type: 'gold', tileX: 11, tileY: 6,  collected: false, goldValue: 500 },
      { id: 'g4_art_1', type: 'artifact', tileX: 6,  tileY: 11, collected: false, artifactId: 'ring_barahir'  },
      { id: 'g4_art_2', type: 'artifact', tileX: 13, tileY: 5,  collected: false, artifactId: 'mithril_armor' },
    ],
    storyTriggers: {
      '1,11': 'mordor_siege_intro',
      '9,8':  'wasteland_signs',
      '17,4': 'baradur_victory',
    },
    cities: [
      {
        id: 'morannon_camp', name: 'Morannon-Lager', description: 'Lager der Letzten Allianz vor dem Schwarzen Tor.',
        tileX: 1, tileY: 11,
        recruitOptions: [
          { unitId: 'numenorean_warrior', cost: 50,  available: 25 },
          { unitId: 'elven_warrior',      cost: 120, available: 15 },
          { unitId: 'elven_cavalry',      cost: 180, available: 8  },
          { unitId: 'dunedain_ranger',    cost: 90,  available: 12 },
        ],
      },
    ],
    victoryTile: { x: 17, y: 4 },
    startTile: { x: 1, y: 11 },
    victoryEventId: 'baradur_victory',
    introEventId: 'mordor_siege_intro',
    victoryCondition: { type: 'boss_then_reach', enemyId: 'mordor_lieutenant' },
    phaseOneEventId: 'mordor_boss_defeated',
    loreItems: [
      { id: 'lore_mordor_edict',    title: 'Schwarzes Edikt',    text: '', tileX: 6,  tileY: 10 },
      { id: 'lore_mordor_elbereth', title: 'Elfische Inschrift', text: '', tileX: 11, tileY: 7  },
    ],
    sideObjectives: [
      {
        id: 'mordor_collect_gold', type: 'collect_all_gold',
        description: 'Sichere alle Goldvorräte für die Allianz',
        unitReward: { unitId: 'elven_cavalry', count: 4 },
      },
      {
        id: 'mordor_defeat_both_nazgul', type: 'defeat_enemy', enemyId: 'mordor_nazgul_2',
        description: 'Besiege beide Nazgûl-Schwadronen und schwäche Saurons Griff',
        goldReward: 600,
      },
    ],
  },
];
