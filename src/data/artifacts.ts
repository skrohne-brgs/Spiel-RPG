export interface ArtifactDef {
  id: string;
  name: string;
  description: string;
  tileX: number;
  tileY: number;
  bonuses: { attack?: number; defense?: number; knowledge?: number; maxMana?: number; spellPower?: number };
  icon: string;
}

export const ARTIFACTS: ArtifactDef[] = [
  {
    id: 'narsil_shard', name: 'Scherbe von Narsil', icon: '🗡',
    description: '+3 Angriff. Die zerbrochene Klinge Elendils – noch immer gefährlich.',
    tileX: 8, tileY: 6, bonuses: { attack: 3 },
  },
  {
    id: 'ring_barahir', name: 'Ring von Barahir', icon: '💍',
    description: '+2 Verteidigung. Symbol von Barahirs Eid an Finrod Felagund.',
    tileX: 14, tileY: 9, bonuses: { defense: 2 },
  },
  {
    id: 'elendilmir', name: 'Elendilmir', icon: '⭐',
    description: '+20 Mana. Der Stern von Andúnië – ein weißer Edelstein Elendils.',
    tileX: 13, tileY: 4, bonuses: { maxMana: 20 },
  },
  {
    id: 'mithril_armor', name: 'Mithril-Rüstung', icon: '🛡',
    description: '+3 Verteidigung und +1 Zauberstärke. Aus Erebors Mithril geschmiedet.',
    tileX: 6, tileY: 11, bonuses: { defense: 3, spellPower: 1 },
  },
  {
    id: 'white_tree_fruit', name: 'Frucht des Weißen Baumes', icon: '🌿',
    description: '+2 Angriff, +2 Verteidigung. Isildur rettete diesen Samen vor Saurons Flammen – Symbol Gondors.',
    tileX: 0, tileY: 0, bonuses: { attack: 2, defense: 2 },
  },
  {
    id: 'rhun_scepter', name: 'Zepter des Rhûn-Königs', icon: '⚜',
    description: '+2 Angriff, +2 Zauberstärke. Das Herrschaftszeichen über die Ostlande – bindet die Loyalität der Stämme.',
    tileX: 0, tileY: 0, bonuses: { attack: 2, spellPower: 2 },
  },
];
