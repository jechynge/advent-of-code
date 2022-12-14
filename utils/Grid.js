export default class Grid {
    constructor(width, height, initialValue, options) {
        this.width = width;
        this.height = height;

        this.offsetX = options?.offsetX ?? 0;
        this.offsetY = options?.offsetY ?? 0;

        this.validDimensions = `X => [${this.offsetX},${this.width + this.offsetX}] | Y => [${this.offsetY},${this.height + this.offsetY}]`;

        this.grid = new Array(height)
            .fill(undefined)
            .map(() => new Array(width).fill(typeof initialValue === 'function' ? initialValue() : initialValue));
    }

    getOffsetCoordinates(coordinates) {
        return [
            coordinates[0] - this.offsetX,
            coordinates[1] - this.offsetY
        ];
    }

    isValidCell(coordinates) {
        const [x, y] = this.getOffsetCoordinates(coordinates);

        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getCell(coordinates) {
        if(!this.isValidCell(coordinates)) {
            return null;
        }

        const [x, y] = this.getOffsetCoordinates(coordinates);

        return this.grid[y][x];
    }

    setCell(coordinates, value) {
        if(!this.isValidCell(coordinates)) {
            throw new Error(`Cell coordinates [${coordinates.join(', ')}] are invalid! ${this.validDimensions}`);
        }

        const [x, y] = this.getOffsetCoordinates(coordinates);

        this.grid[y][x] = value;
    }

    // Range coordinates are inclusive!
    setRange(from, to, value) {
        if(!this.isValidCell(from)) {
            throw new Error(`"from" coordinates [${from.join(', ')}] are invalid! ${this.validDimensions}`);
        }

        if(!this.isValidCell(to)) {
            throw new Error(`"to" coordinates [${to.join(', ')}] are invalid! ${this.validDimensions}`);
        }

        const startX = Math.min(from[0], to[0]);
        const startY = Math.min(from[1], to[1]);
        const endX = Math.max(from[0], to[0]);
        const endY = Math.max(from[1], to[1]);

        for(let x = startX; x <= endX; x++) {
            for(let y = startY; y <= endY; y++) {
                const [_x, _y] = this.getOffsetCoordinates([x, y]);

                this.grid[_y][_x] = typeof value === 'function' ? value([x, y]) : value;
            }
        }
    }

    getRow(y) {
        const [, offsetY] = this.getOffsetCoordinates(coordinates);
        return this.grid[offsetY];
    }

    getColumn(x) {
        const [offsetX] = this.getOffsetCoordinates(coordinates);
        return this.grid.map(row => row[offsetX]);
    }

    print(emptyCellValue = '.') {
        const padLength = `${this.height + this.offsetY}`.length;
        this.grid.forEach((row, i) => console.log(i.toString().padEnd(padLength + 1), row.map(cell => cell ?? emptyCellValue).join('')));
    }

    static GetManhattanDistance(start, end) {
        return Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1]);
    }

    static AreCoordinatesEqual(coord1, coord2) {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }
}