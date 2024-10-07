/* eslint-disable no-unused-vars */
import { AnimatedSprite, Container, PointData, Sprite } from 'pixi.js';
import { Tower } from '../src/ObjectsPool/Tower/Tower';
import { Tank } from './ObjectsPool/Enemies/Tank';
import { Bullet } from '../src/ObjectsPool/Bullet';
import { ControlUnit } from './ObjectsPool/ControlUnit/ControlUnit';

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    STAND,
    UP_LEFT,
    UP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT
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
    barack = 'barack'
}

export enum EnemiesType {
    tank_1 = 'tank_1',
    tank_2 = 'tank_2',
    tank_3 = 'tank_3'

}

export enum EffectType {
    SLOW = 'slow',
    STUN = 'stun',
    BLAST = 'blast'
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
    dame: number,
    speed: number,
    isEneBullet: boolean,
    towerType?: TowerType,
    effectType?: EffectType,
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

export type MinMax = {
    min: number,
    max: number
};

export type FireTime = {
    fireTimeConst: number,
    fireTimeCount: number
};

export interface CreateEnemiesOption {
    name: string,
    HP: number,
    speed: number,
    dame: number,
    eneCount?: number
}

export enum FlyUnitType {
    helicopter = 'helicopter'
}

export enum AllyTanksType {
    sovietTank = 'sovietTank'
}

export type GetTowerFromPoolFn = (towerType: TowerType) => Tower;
export type GetEnemiesFromPoolFn = () => Tank;
export type GetBulletFromPoolFn = (bulletType: BulletType) => Bullet;
export type ReturnTowerToPoolFn = (tower: Tower) => void;
export type ReturnEnemiesToPoolFn = (enemy: Tank) => void;
export type ReturnBulletToPoolFn = (bullet: Bullet) => void;
export type GetObjectFromGameSceneFn = () => {towers: Tower[], bullets: Bullet[], enemies: Tank[], allies: Tank[], units: ControlUnit[]};
export type AddToBoardFn= (board: Container) => void;
export type RemoveFromBoardFb = (board: Container) => void;
export type GetPlayerGoldFn = () => number;
export type GetExplosionFromPoolFn = (exType: string) => AnimatedSprite;
export type ReturnExplosionToPoolFn = (ex: AnimatedSprite, exType: string) => void;
export type GetTowerBasesFn = (position: PointData[]) => Sprite[];
export type GetUnitFromPoolFn = (unitType: FlyUnitType) => ControlUnit;
export type ReturnUnitToPoolFn = (unit: ControlUnit) => void;
export type GetMatrixMapFn = () => number[][];
export type SetMatrixMapFn = (row: number, colum: number, value: number) => void;