export interface SkillTreeNode {
  nodeId: string;      // unique ID like "elendil_leadership_2"
  skillId: string;     // maps to SKILL_DEFS key (or new capstone)
  toLevel: number;     // what level the skill reaches after unlock
  tier: number;        // visual row 0-3
  col: number;         // visual column 0-4
  requires: string[];  // nodeIds that must be unlocked first
  heroOnly?: string;   // hero id restriction
}

export interface HeroSkillTree {
  heroId: string;
  nodes: SkillTreeNode[];
}

// ── Elendil's tree (Leadership / Balance) ─────────────────────────────────────
const elendilTree: HeroSkillTree = {
  heroId: 'elendil',
  nodes: [
    { nodeId: 'e_leadership_1',  skillId: 'leadership',       toLevel: 1, tier: 0, col: 2, requires: [] },
    { nodeId: 'e_leadership_2',  skillId: 'leadership',       toLevel: 2, tier: 1, col: 1, requires: ['e_leadership_1'] },
    { nodeId: 'e_tactics_1',     skillId: 'tactics',          toLevel: 1, tier: 1, col: 2, requires: ['e_leadership_1'] },
    { nodeId: 'e_sorcery_1',     skillId: 'sorcery',          toLevel: 1, tier: 1, col: 3, requires: ['e_leadership_1'] },
    { nodeId: 'e_leadership_3',  skillId: 'leadership',       toLevel: 3, tier: 2, col: 0, requires: ['e_leadership_2'] },
    { nodeId: 'e_tactics_2',     skillId: 'tactics',          toLevel: 2, tier: 2, col: 1, requires: ['e_tactics_1'] },
    { nodeId: 'e_sorcery_2',     skillId: 'sorcery',          toLevel: 2, tier: 2, col: 3, requires: ['e_sorcery_1'] },
    { nodeId: 'e_resistance_1',  skillId: 'resistance',       toLevel: 1, tier: 2, col: 4, requires: ['e_sorcery_1'] },
    { nodeId: 'e_einigende',     skillId: 'einigende_stimme', toLevel: 1, tier: 3, col: 0, requires: ['e_leadership_3', 'e_tactics_2'] },
    { nodeId: 'e_tactics_3',     skillId: 'tactics',          toLevel: 3, tier: 3, col: 1, requires: ['e_tactics_2'] },
    { nodeId: 'e_sorcery_3',     skillId: 'sorcery',          toLevel: 3, tier: 3, col: 3, requires: ['e_sorcery_2'] },
  ],
};

// ── Isildur's tree (Offense / Aggression) ────────────────────────────────────
const isildurTree: HeroSkillTree = {
  heroId: 'isildur',
  nodes: [
    { nodeId: 'i_offense_1',   skillId: 'offense',   toLevel: 1, tier: 0, col: 2, requires: [] },
    { nodeId: 'i_offense_2',   skillId: 'offense',   toLevel: 2, tier: 1, col: 1, requires: ['i_offense_1'] },
    { nodeId: 'i_archery_1',   skillId: 'archery',   toLevel: 1, tier: 1, col: 2, requires: ['i_offense_1'] },
    { nodeId: 'i_logistics_1', skillId: 'logistics', toLevel: 1, tier: 1, col: 3, requires: ['i_offense_1'] },
    { nodeId: 'i_offense_3',   skillId: 'offense',   toLevel: 3, tier: 2, col: 0, requires: ['i_offense_2'] },
    { nodeId: 'i_archery_2',   skillId: 'archery',   toLevel: 2, tier: 2, col: 1, requires: ['i_archery_1'] },
    { nodeId: 'i_logistics_2', skillId: 'logistics', toLevel: 2, tier: 2, col: 3, requires: ['i_logistics_1'] },
    { nodeId: 'i_tactics_1',   skillId: 'tactics',   toLevel: 1, tier: 2, col: 4, requires: ['i_logistics_1'] },
    { nodeId: 'i_kriegswut',   skillId: 'kriegswut', toLevel: 1, tier: 3, col: 0, requires: ['i_offense_3'] },
    { nodeId: 'i_archery_3',   skillId: 'archery',   toLevel: 3, tier: 3, col: 1, requires: ['i_archery_2'] },
    { nodeId: 'i_logistics_3', skillId: 'logistics', toLevel: 3, tier: 3, col: 3, requires: ['i_logistics_2'] },
  ],
};

// ── Anárion's tree (Defense / Magic) ─────────────────────────────────────────
const anarionTree: HeroSkillTree = {
  heroId: 'anarion',
  nodes: [
    { nodeId: 'a_resistance_1', skillId: 'resistance',  toLevel: 1, tier: 0, col: 2, requires: [] },
    { nodeId: 'a_resistance_2', skillId: 'resistance',  toLevel: 2, tier: 1, col: 1, requires: ['a_resistance_1'] },
    { nodeId: 'a_sorcery_1',    skillId: 'sorcery',     toLevel: 1, tier: 1, col: 2, requires: ['a_resistance_1'] },
    { nodeId: 'a_leadership_1', skillId: 'leadership',  toLevel: 1, tier: 1, col: 3, requires: ['a_resistance_1'] },
    { nodeId: 'a_resistance_3', skillId: 'resistance',  toLevel: 3, tier: 2, col: 0, requires: ['a_resistance_2'] },
    { nodeId: 'a_sorcery_2',    skillId: 'sorcery',     toLevel: 2, tier: 2, col: 1, requires: ['a_sorcery_1'] },
    { nodeId: 'a_leadership_2', skillId: 'leadership',  toLevel: 2, tier: 2, col: 3, requires: ['a_leadership_1'] },
    { nodeId: 'a_tactics_1',    skillId: 'tactics',     toLevel: 1, tier: 2, col: 4, requires: ['a_leadership_1'] },
    { nodeId: 'a_eisenschild',  skillId: 'eisenschild', toLevel: 1, tier: 3, col: 0, requires: ['a_resistance_3'] },
    { nodeId: 'a_sorcery_3',    skillId: 'sorcery',     toLevel: 3, tier: 3, col: 1, requires: ['a_sorcery_2'] },
    { nodeId: 'a_leadership_3', skillId: 'leadership',  toLevel: 3, tier: 3, col: 3, requires: ['a_leadership_2'] },
  ],
};

export const HERO_SKILL_TREES: HeroSkillTree[] = [elendilTree, isildurTree, anarionTree];

export function getHeroSkillTree(heroId: string): HeroSkillTree | undefined {
  return HERO_SKILL_TREES.find(t => t.heroId === heroId);
}
