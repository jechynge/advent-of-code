export const GRID_CARDINAL_COORDINATES = ['top', 'right', 'bottom', 'left'];

export default class Grid {
    constructor(width, height, initialValue, options) {
        this.width = width;
        this.height = height;

        this.offsetX = options?.offsetX ?? 0;
        this.offsetY = options?.offsetY ?? 0;

        this.initialValue = typeof initialValue === 'function' ? initialValue() : initialValue;

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

    // It is not recommended to call this directly!
    _setCell(coordinates, value, overwriteNonInitialValue = true) {
        const [x, y] = this.getOffsetCoordinates(coordinates);

        const _initialValue = typeof this.initialValue === 'function' ? this.initialValue() : this.initialValue;

        if(overwriteNonInitialValue || this.grid[y][x] === _initialValue) {
            this.grid[y][x] = typeof value === 'function' ? value(coordinates) : value;
        }
    }

    setCell(coordinates, value, overwriteNonInitialValue = true) {
        if(!this.isValidCell(coordinates)) {
            throw new Error(`Cell coordinates [${coordinates.join(', ')}] are invalid! ${this.validDimensions}`);
        }

        this._setCell(coordinates, value, overwriteNonInitialValue);
    }

    // Range coordinates are inclusive!
    setRange(from, to, value, overwriteNonInitialValue = true) {
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
                this._setCell([x, y], value, overwriteNonInitialValue);
            }
        }
    }

    setManhattanRadius(center, radius, value, overwriteNonInitialValue = true) {
        const { coordinates, boundaries } = Grid.GetManhattanBoundary(center, radius);

        coordinates.forEach((coordinate, i) => {
            if(!this.isValidCell(coordinate)) {
                throw new Error(`${GRID_CARDINAL_COORDINATES[i]}-most coordinate [${coordinate.join(', ')}] is invalid! ${this.validDimensions}`);
            }
        });

        const [ top, right, bottom, left ] = boundaries;

        const startY = top;
        const endY = bottom;

        for(let y = startY; y <= endY; y++) {

            const startX = left + Math.abs(center[1] - y);
            const endX = right - Math.abs(center[1] - y);

            for(let x = startX; x <= endX; x++) {
                this._setCell([x, y], value, overwriteNonInitialValue);
            }
        }
    }

    getRow(y) {
        const offsetY = y - this.offsetY;

        if(offsetY < 0 || offsetY > this.grid.length - 1) {
            throw new Error(`Row at ${y} is out of bounds! ${this.validDimensions}`);
        }

        return this.grid[offsetY];
    }

    getColumn(x) {
        const offsetX = x - this.offsetX;

        if(offsetX < 0 || offsetX > this.grid[0].length - 1) {
            throw new Error(`Column at ${x} is out of bounds! ${this.validDimensions}`);
        }

        return this.grid.map(row => row[offsetX]);
    }

    print(emptyCellValue = '.') {

        // const generateColumn = (div, mod) => this.grid[0].reduce((accum, value, i) => {
        //     const rem = Math.ceil((i + this.offsetX) / div);
        //     return rem % mod === 0 ? accum + rem.toString() : ' '
        // }, '');

        // const tens = generateColumn(100, 10);
        const fives = this.grid[0].reduce((accum, value, i) => {
            const x = Math.abs(i + this.offsetX);
            return x % 5 === 0 ? accum + (x % 10).toString() : accum + ' '
        }, '');

        const tens = this.grid[0].reduce((accum, value, i) => {
            const x = Math.abs(i + this.offsetX);
            return Math.abs(x) >= 10 && x % 5 === 0 ? accum + Math.floor(x / 10).toString() : accum + ' '
        }, '');

        const padR = `${this.height + this.offsetY}`.length;
        const padL = this.offsetY < 0 ? padR + 1 : padR;

        console.log(''.padEnd(padL), tens);
        console.log(''.padEnd(padL), fives);
        
        this.grid.forEach((row, i) => {
            const columnNumber = (i + this.offsetY).toString().padEnd(padR + 1).padStart(padL)
            console.log(columnNumber, row.map(cell => cell ?? emptyCellValue).join(''))
        });
    }

    static GetManhattanDistance(from, to) {
        return Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1]);
    }

    static AreCoordinatesEqual(coord1, coord2) {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }

    static GetManhattanBoundary(center, radius) {
        const top = center[1] - radius;
        const right = center[0] + radius; 
        const bottom = center[1] + radius;
        const left = center[0] - radius;

        const topCoordinate = [center[0], top];

        const rightCoordinate = [right, center[1]];

        const bottomCoordinate = [center[0], bottom];

        const leftCoordinate = [left, center[1]];

        return {
            boundaries: [ top, right, bottom, left ],
            coordinates: [ topCoordinate, rightCoordinate, bottomCoordinate, leftCoordinate ]
        }
    }
}