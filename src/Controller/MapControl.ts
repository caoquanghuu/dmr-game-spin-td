// class handle position on objects
export class MapControl {
    private grid: Map<string, any[]> = new Map();
    private cellSize: number;


    constructor(cellSize: number) {
        this.cellSize = cellSize;
    }

    // convert position to cell
    private _getCellIndex(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    // add object to map
    public addObject(obj: any, x: number, y: number): void {
        const index = this._getCellIndex(x, y);
        if (!this.grid.has(index)) {
            this.grid.set(index, []);
        }
        this.grid.get(index)!.push(obj);
    }

    //  get objects nearby
    public getObjectsInNearbyCells(x: number, y: number): any[] {
        const nearbyObjects: any[] = [];
        const index = this._getCellIndex(x, y);

        const [cellX, cellY] = index.split(',').map(Number);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const neighborIndex = `${cellX + dx},${cellY + dy}`;
                if (this.grid.has(neighborIndex)) {
                    nearbyObjects.push(...this.grid.get(neighborIndex)!);
                }
            }
        }
        return nearbyObjects;
    }

    public clear(): void {
        this.grid.clear();
    }
}