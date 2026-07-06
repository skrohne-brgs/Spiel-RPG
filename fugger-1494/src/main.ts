import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { MainMenuScene } from './scenes/MainMenuScene';
import { MapScene } from './scenes/MapScene';
import { MarketScene } from './scenes/MarketScene';
import { KontorScene } from './scenes/KontorScene';
import { LagerScene } from './scenes/LagerScene';
import { FuhrparkScene } from './scenes/FuhrparkScene';
import { ManagerScene } from './scenes/ManagerScene';
import { BankScene } from './scenes/BankScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1408',
  parent: 'game-container',
  scene: [MainMenuScene, MapScene, MarketScene, KontorScene, LagerScene, FuhrparkScene, ManagerScene, BankScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);
