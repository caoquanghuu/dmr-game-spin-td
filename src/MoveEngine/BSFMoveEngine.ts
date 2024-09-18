import { BaseEngine } from './BaseEngine';
import map from '../GameScene/Map/mapMatrix.json';
import { PointData } from 'pixi.js';
import { AppConstants } from 'src/GameScene/Constants';
import { GameMap } from 'src/GameScene/Map/Map';
import { BSFMove, BSFNextMove } from 'src/Type';
export class BSFMoveEngine {
    private _mapMatrix: any;
    private _headPoint: PointData;
    private _bsfMove: BSFMove;

    constructor() {
        this._mapMatrix = GameMap.mapMatrix;
        this._headPoint = { x: 14, y: 0 };

        this._bsfMove = this._bfs(this._headPoint);
    }

    get bsfNextMove(): BSFNextMove {
        const nextMove: BSFNextMove = { directions: this._bsfMove.directions.shift(), path: this._bsfMove.path.shift() };
        return nextMove;
    }

    private _bfs(headPoint: PointData): BSFMove {
        const queue = [headPoint];
        const visited = new Set();
        const parent = {};
        const directionPath: PointData[] = [];
        const path: PointData[] = [];
        const directions = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
        ];

        visited.add(`${headPoint.x},${headPoint.y}`);

        while (queue.length > 0) {
            const current = queue.shift();
            if (this._mapMatrix[current.x][current.y] === 3) {
                let temp = current;
                while (temp) {
                    path.push(temp);
                    const oldTemp = { x: temp.x, y: temp.y };
                    temp = parent[`${temp.x},${temp.y}`];
                    if (temp) {
                        const direction = {
                            x: oldTemp.x - temp.x,
                            y: oldTemp.y - temp.y,
                        };
                        directionPath.push(direction);
                    }
                }
                return { directions: directionPath.reverse(), path: path.reverse() };
            }


            directions.forEach((dir) => {
                const next = {
                    x: current.x + dir.x,
                    y: current.y + dir.y
                };


                if (
                    next.x >= 0 &&
                    next.x < 30 &&
                    next.y >= 0 &&
                    next.y <= 16 &&
                    !visited.has(`${next.x},${next.y}`)
                ) {
                    if (this._mapMatrix[next.x][next.y] != 1) return;
                    queue.push(next);
                    visited.add(`${next.x},${next.y}`);
                    parent[`${next.x},${next.y}`] = current;
                }
            });
        }
    }
}