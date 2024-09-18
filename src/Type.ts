import { PointData } from 'pixi.js';

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
    CRYSTAL_MAIDEN = 'crystal-maiden',
    MIRANA = 'mirana',
    TINKER = 'laser-tower-1'
}

export enum EnemiesType {
    TANK1 = 'tank-1',
    TANK2 = 'tank2',
    TANK3 = 'tank3'

}

export enum EffectType {
    SLOW,
    STUN
}

export enum BulletType {
    LASER = 'laser',
    ROCKET = 'rocket'

}

export type BSFMove = {
    directions: PointData[],
    path: PointData[]
};

export type BSFNextMove = {
    directions: Direction,
    path: PointData
};