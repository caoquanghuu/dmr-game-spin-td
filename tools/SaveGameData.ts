import { PointData } from 'pixi.js';
import { SaveGameData, TowerType } from 'src/Type';

export function saveGame(data: SaveGameData) {
    const gameData = {
        wave:data.wave,
        gold: data.gold,
        towers: data.towers.map(tower => tower),
        soundOption: data.soundOption,
        nuclearBaseHp: data.nuclearBaseHp
    };
    const dataString = JSON.stringify(gameData);
    localStorage.setItem('gameData_key', dataString);
}

// load data when player chose play previous game
export function loadGame() {
    const savedData = localStorage.getItem('gameData_key');
    if (savedData) {
        const gameData: SaveGameData = JSON.parse(savedData);
        return { wave: gameData.wave, gold: gameData.gold, towers: gameData.towers, nuclearBaseHp: gameData.nuclearBaseHp, soundOption: gameData.soundOption };
    }
}

export function clearData() {
    localStorage.clear();
}