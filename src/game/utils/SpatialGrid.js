export class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    _getKey(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    clear() {
        this.cells.clear();
    }

    add(entity) {
        const key = this._getKey(entity.x, entity.y);
        if (!this.cells.has(key)) {
            this.cells.set(key, []);
        }
        this.cells.get(key).push(entity);
    }

    // Get entities in the same cell and neighboring cells
    query(x, y, range) {
        const results = [];
        const cellRange = Math.ceil(range / this.cellSize);
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);

        for (let i = -cellRange; i <= cellRange; i++) {
            for (let j = -cellRange; j <= cellRange; j++) {
                const key = `${cx + i},${cy + j}`;
                if (this.cells.has(key)) {
                    const entities = this.cells.get(key);
                    for (const e of entities) {
                        // Precise distance check
                        if (Math.hypot(e.x - x, e.y - y) <= range) {
                            results.push(e);
                        }
                    }
                }
            }
        }
        return results;
    }
}
