import { PointData } from 'pixi.js';
import { GameMap } from '../GameScene/Map/Map';
import { BSFMove, BSFNextMove, Direction } from '../Type';
import { AppConstants } from '../GameScene/Constants';
export class BSFMoveEngine {
    private _mapMatrix: any;
    private _bsfMove: BSFMove = { directions: [], path: [] };
    private _targetValue: number = 3;

    constructor() {
        this._mapMatrix = GameMap.mapMatrix;
    }

    set targetValue(vl: number) {
        this._targetValue = vl;
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
        return { directions: nextDirection, path: { x: nextPath[0].x * AppConstants.matrixSize, y: nextPath[0].y * AppConstants.matrixSize } };
    }

    private _bfs(point: PointData): BSFMove {
        const headPoint = { x: Math.round((point.x - AppConstants.matrixSize / 2) / AppConstants.matrixSize), y:  Math.round((point.y - AppConstants.matrixSize / 2) / AppConstants.matrixSize) };
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
            if (this._mapMatrix[current.x][current.y] === this._targetValue) {
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

    public reset() {
        this._bsfMove = { directions: [], path: [] };
    }

    private _checkNextMove(point: PointData): boolean {
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.environment) return false;
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.tower) return false;
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.unit) return false;
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.availableTowerBuild) return false;
        return true;
    }

    public update(headPoint: PointData) {
        if (!headPoint) return;
        const move = this._bfs(headPoint);
        if (move) {
            this._bsfMove = move;
        }
    }
}