import { PointData } from 'pixi.js';
import { GameMap } from '../GameScene/Map/Map';
import { BSFMove, BSFNextMove, Direction } from '../Type';
export class BSFMoveEngine {
    private _mapMatrix: any;
    private _headPoint: PointData;
    private _bsfMove: BSFMove;

    constructor() {
        this._mapMatrix = GameMap.mapMatrix;
        this._headPoint = { x: 14, y: 0 };

        this._bsfMove = this._bfs(this._headPoint);
    }

    get bsfNextMove(): BSFNextMove | undefined {
        const direction = this._bsfMove.directions.shift();
        if (direction === undefined) return undefined;
        const nextPath = this._bsfMove.path.splice(1, 1);
        let nextDirection: Direction;
        if (direction.x === 0 && direction.y === -1) nextDirection = Direction.UP;
        if (direction.x === 0 && direction.y === 1) nextDirection = Direction.DOWN;
        if (direction.x === 1 && direction.y === 0) nextDirection = Direction.RIGHT;
        if (direction.x === -1 && direction.y === 0) nextDirection = Direction.LEFT;
        return { directions: nextDirection, path: { x: nextPath[0].x * 32, y: nextPath[0].y * 32 } };
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

                // console.log(next);
                const isPositionAvailable: boolean = this._checkNextMove(next);


                if (
                    isPositionAvailable &&
                    next.x > 0 &&
                    next.x < 30 &&
                    next.y > 0 &&
                    next.y < 16 &&
                    !visited.has(`${next.x},${next.y}`)
                ) {
                    queue.push(next);
                    visited.add(`${next.x},${next.y}`);
                    parent[`${next.x},${next.y}`] = current;
                }
            });
        }
    }

    private _checkNextMove(point: PointData): boolean {
        if (this._mapMatrix[point.x][point.y] === 2) return false;
        if (this._mapMatrix[point.x][point.y] === 0) return false;
        return true;
    }
}