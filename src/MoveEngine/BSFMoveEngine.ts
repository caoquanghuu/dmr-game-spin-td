import { PointData } from 'pixi.js';
import { BSFMove, BSFNextMove, Direction, GetHeadPointPositionFn, GetMatrixMapFn } from '../Type';
import { AppConstants } from '../GameScene/Constants';
export class BSFMoveEngine {
    private _getMatrixMapCb: GetMatrixMapFn;
    private _bsfMove: BSFMove;
    private _targetValue: number;
    private _isEne: boolean = false;
    private _getHeadPointPosition: GetHeadPointPositionFn;

    constructor(getHeadPointPosition: GetHeadPointPositionFn, targetValue: number, getMatrixMap: GetMatrixMapFn) {
        this._getMatrixMapCb = getMatrixMap;
        this._targetValue = targetValue;
        this._getHeadPointPosition = getHeadPointPosition;
    }

    set targetValue(val: number) {
        this._targetValue = val;
    }

    set headPoint(headPoint: PointData) {
        this.headPoint = headPoint;
    }

    get isEne(): boolean {
        return this._isEne;
    }

    set isEne(isEne: boolean) {
        this._isEne = isEne;
    }

    get bsfNextMove(): BSFNextMove {
        this._updateBfs();
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

        return { directions: nextDirection, path: { x: nextPath[0].x, y: nextPath[0].y } };
    }

    private _bfs(isAvoidUnits: boolean): BSFMove | null {
        const headPoint = this._getHeadPointPosition();

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
            { x: 1, y: 1 },
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: -1, y: -1 }
        ];

        visited.add(`${headPoint.x},${headPoint.y}`);
        parent[`${headPoint.x},${headPoint.y}`] = null;

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (this._getMatrixMapCb()[current.x][current.y] === this._targetValue) {
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
                    if (this._checkNextMove(next, isAvoidUnits)) {
                        queue.push(next);
                        visited.add(`${next.x},${next.y}`);
                        parent[`${next.x},${next.y}`] = current;
                    }

                }
            }
        }
        return null;
    }

    private _checkNextMove(point: PointData, isAvoidUnits: boolean): boolean {
        if (this._getMatrixMapCb()[point.x][point.y] === AppConstants.matrixMapValue.environment) return false;
        if (this._getMatrixMapCb()[point.x][point.y] === AppConstants.matrixMapValue.tower) return false;
        if (this._getMatrixMapCb()[point.x][point.y] === AppConstants.matrixMapValue.availableTowerBuild) return false;
        if (this._getMatrixMapCb()[point.x][point.y] === AppConstants.matrixMapValue.changeDirectionPoint) return false;
        if (isAvoidUnits) {
            if (this._isEne) {
                if (this._getMatrixMapCb()[point.x][point.y] === AppConstants.matrixMapValue.enemy) return false;
            } else {
                if (this._getMatrixMapCb()[point.x][point.y] === AppConstants.matrixMapValue.ally) return false;
            }


        }

        // if passed all conditional
        return true;
    }

    private _updateBfs(): void {
        // try move by avoid units
        let bsfMove: BSFMove = this._bfs(true);
        // in case cant not move by avoid other units
        if (!bsfMove) bsfMove = this._bfs(false);
        this._bsfMove = bsfMove;
    }
}