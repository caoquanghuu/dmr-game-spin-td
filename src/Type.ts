/* eslint-disable no-unused-vars */
import { AnimatedSprite, Container, PointData } from 'pixi.js';
import { Tower } from '../src/ObjectsPool/Tower/Tower';
import { Enemies } from '../src/ObjectsPool/Enemies/Enemies';
import { Bullet } from '../src/ObjectsPool/Bullet';

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    STAND
}

export enum MoveType {
    NONE,
    ANGLE,
    DIRECTION
}

// the arena with circle, position x,y and r
export interface EffectArena {
    x: number,
    y: number,
    r: number
}

export enum TowerType {
    crystal_maiden = 'crystal_maiden',
    mirana = 'mirana',
    tinker = 'tinker',
    clockwerk = 'clockwerk',
}

export enum EnemiesType {
    tank_1 = 'tank_1',
    tank_2 = 'tank_2',
    tank_3 = 'tank_3'

}

export enum EffectType {
    SLOW,
    STUN,
    BLAST
}

export enum BulletType {
    laser = 'laser',
    missile = 'missile',
    ice = 'ice',
    lightning = 'lightning'

}

export type BSFMove = {
    directions: PointData[],
    path: PointData[]
};

export type BSFNextMove = {
    directions: Direction,
    path: PointData
};

export type FireBulletOption = {
    position: PointData,
    target: PointData,
    towerType: TowerType,
    dame: number,
    speed: number,
    effectType?: EffectType
};

export type Circle = {
    position: PointData,
    radius: number
};

export type TowerInformation = {
    level: number,
    towerType: TowerType,
    speed: number,
    dame: number,
    goldUpgrade: number,
    towerId: number
};

export interface CreateEnemiesOption {
    name: string,
    HP: number,
    speed: number,
    dame: number,
    eneCount?: number
}

export type GetTowerFromPoolFn = (towerType: TowerType) => Tower;
export type GetEnemiesFromPoolFn = () => Enemies;
export type GetBulletFromPoolFn = (bulletType: BulletType) => Bullet;
export type ReturnTowerToPoolFn = (tower: Tower) => void;
export type ReturnEnemiesToPoolFn = (enemy: Enemies) => void;
export type ReturnBulletToPoolFn = (bullet: Bullet) => void;
export type GetObjectFromGameSceneFn = () => {towers: Tower[], bullets: Bullet[], enemies: Enemies[]};
export type AddToBoardFn= (board: Container) => void;
export type RemoveFromBoardFb = (board: Container) => void;
export type GetPlayerGoldFn = () => number;
export type GetExplosionFromPoolFn = () => AnimatedSprite;
export type ReturnExplosionToPoolFn = (ex: AnimatedSprite) => void;