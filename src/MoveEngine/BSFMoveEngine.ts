import { PointData } from 'pixi.js';
import { GameMap } from '../GameScene/Map/Map';
import { BSFMove, BSFNextMove, Direction } from '../Type';
import { AppConstants } from '../GameScene/Constants';
export class BSFMoveEngine {
    private _mapMatrix: any;
    private _bsfMove: BSFMove;
    private _targetValue: number;
    private _getHeadPointPosition: Function;

    constructor(getHeadPointPosition: Function, targetValue: number) {
        this._mapMatrix = GameMap.mapMatrix;
        this._targetValue = targetValue;
        this._getHeadPointPosition = getHeadPointPosition;
    }

    set targetValue(val: number) {
        this._targetValue = val;
    }

    set headPoint(headPoint: PointData) {
        this.headPoint = headPoint;
    }

    get bsfNextMove(): BSFNextMove {
        if (!this._bsfMove) return;
        const direction = this._bsfMove.directions.shift();
        if (direction === undefined) return undefined;
        const nextPath = this._bsfMove.path.splice(1, 1);
        let nextDirection: Direction;
        if (direction.x === 0 && direction.y === -1) nextDirection = Direction.UP;
        if (direction.x === 0 && direction.y === 1) nextDirection = Direction.DOWN;
        if (direction.x === 1 && direction.y === 0) nextDirection = Direction.RIGHT;
        if (direction.x === -1 && direction.y === 0) nextDirection = Direction.LEFT;
        if (direction.x === 1 && direction.y === 1) nextDirection = Direction.DOWN_RIGHT;
        if (direction.x === 1 && direction.y === -1) nextDirection = Direction.UP_RIGHT;
        if (direction.x === -1 && direction.y === -1) nextDirection = Direction.UP_LEFT;
        if (direction.x === -1 && direction.y === 1) nextDirection = Direction.DOWN_LEFT;

        return { directions: nextDirection, path: { x: nextPath[0].x, y: nextPath[0].y} };
    }

    private _bfs(): BSFMove | null {
        const headPoint = this._getHeadPointPosition();
        if (!headPoint) return null;

        const queue: PointData[] = [headPoint];
        const visited: Set<string> = new Set();
        const parent: { [key: string]: PointData | null } = {};
        const directionPath: PointData[] = [];
        const path: PointData[] = [];
        const directions: PointData[] = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            {x: 1 , y: 1},
            {x: -1, y: 1},
            { x: 1, y: -1},
            {x: -1, y: -1}
        ];

        visited.add(`${headPoint.x},${headPoint.y}`);
        parent[`${headPoint.x},${headPoint.y}`] = null;

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (this._mapMatrix[current.x][current.y] === this._targetValue) {
                let temp = current;
                while (temp !== null) {
                    path.push(temp);
                    const oldTemp = { x: temp.x, y: temp.y };
                    temp = parent[`${temp.x},${temp.y}`];
                    if (temp !== null) {
                        const direction = {
                            x: oldTemp.x - temp.x,
                            y: oldTemp.y - temp.y,
                        };
                        directionPath.push(direction);
                    }
                }
                return { directions: directionPath.reverse(), path: path.reverse() };
            }

            for (const dir of directions) {
                const next: PointData = { x: current.x + dir.x, y: current.y + dir.y };

                if (
                    next.x >= 0 &&
                    next.x < 30 &&
                    next.y >= 0 &&
                    next.y < 16 &&
                    !visited.has(`${next.x},${next.y}`)
                ) {
                    if (this._checkNextMove(next)) {
                        queue.push(next);
                        visited.add(`${next.x},${next.y}`);
                        parent[`${next.x},${next.y}`] = current;
                    }
                   
                }
            }
        }
        return null;
    }

    // public calculateBfsDistance(): number {
    //     const headPoint = this._getHeadPointPosition();
    //     if (!headPoint) return -1;

    //     const queue: { point: PointData, steps: number }[] = [{ point: headPoint, steps: 0 }];
    //     const visited: Set<string> = new Set();
    //     const directions: PointData[] = [
    //         { x: 0, y: -1 },
    //         { x: 1, y: 0 },
    //         { x: 0, y: 1 },
    //         { x: -1, y: 0 },
    //     ];

    //     visited.add(`${headPoint.x},${headPoint.y}`);

    //     while (queue.length > 0) {
    //         const { point, steps } = queue.shift()!;

    //         if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.nuclearBase) {
    //             return steps;
    //         }

    //         for (const dir of directions) {
    //             const next: PointData = { x: point.x + dir.x, y: point.y + dir.y };

    //             const isPositionAvailable: boolean = this._checkNextMove(next);

    //             if (
    //                 isPositionAvailable &&
    //                 next.x >= 0 &&
    //                 next.x < 30 &&
    //                 next.y >= 0 &&
    //                 next.y < 16 &&
    //                 !visited.has(`${next.x},${next.y}`)
    //             ) {
    //                 queue.push({ point: next, steps: steps + 1 });
    //                 visited.add(`${next.x},${next.y}`);
    //             }
    //         }
    //     }

    //     return -1;
    // }

    private _checkNextMove(point: PointData): boolean {
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.environment) return false;
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.tower) return false;
        if (this._mapMatrix[point.x][point.y] === AppConstants.matrixMapValue.availableTowerBuild) return false;

        return true;
    }

    public update() {
        this._bsfMove = this._bfs();
    }
}