import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { AdventureMap } from './scenes/AdventureMap';
import { CombatScene } from './scenes/CombatScene';
import { DialogScene } from './scenes/DialogScene';
import { VictoryScene } from './scenes/VictoryScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0d0d1a',
  parent: 'game-container',
  scene: [Boot, MainMenu, AdventureMap, CombatScene, DialogScene, VictoryScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
