export const GRID_CARDINAL_COORDINATES = ['top', 'right', 'bottom', 'left'];

export default class Grid {
    constructor(width, height, initialValue, options) {
        this.width = width;
        this.height = height;

        this.offsetX = options?.offsetX ?? 0;
        this.offsetY = options?.offsetY ?? 0;

        this.initialValue = initialValue;

        this.validDimensions = `[${this.offsetX} <= X <= ${this.width - 1 + this.offsetX}] | [${this.offsetY} <= Y <= ${this.height - 1 + this.offsetY}]`;

        this.grid = new Array(this.height)
            .fill(undefined)
            .map(() => new Array(this.width).fill(this.initialValue));
    }

    // Providing a negative value removes `offset` rows from the bottom and "scrolls" the grid upwards, with the top rows moving to the bottom
    // A positive will do the opposite - pruning `offset` rows from the top and "scrolling" the grid downwards
    translateY(offset) {

        if(offset === 0) {
            return;
        }

        const missingRows = new Array(Math.abs(offset))
            .fill(undefined)
            .map(() => new Array(this.width).fill(this.initialValue));

        if(offset < 0) {
            this.grid.splice(offset);

            this.grid = missingRows.concat(this.grid);
        } else {
            this.grid.splice(0,offset);

            this.grid = this.grid.concat(missingRows);
        }

        this.offsetY += offset;

        this.validDimensions = `[${this.offsetX} <= X <= ${this.width - 1 + this.offsetX}] | [${this.offsetY} <= Y <= ${this.height - 1 + this.offsetY}]`;
    }

    // todo bounds checking?
    calculateRowFromBottom(offsetFromBottom) {
        return this.height - 1 - offsetFromBottom + this.offsetY;
    }

    calculateDistanceToBottom(y) {
        return this.height - 1 - y - this.offsetY;
    }

    getOffsetCoordinates(coordinates) {
        return Grid.Transform2DCoordinate(coordinates, [-this.offsetX, -this.offsetY]);
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

        if(overwriteNonInitialValue || this.grid[y][x] === this.initialValue) {
            this.grid[y][x] = value;
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

    setShape(shapeOrigin, shapeLayout, value, overwriteNonInitialValue = true) {
        const shapeCoordinates = Grid.GetShapeCoordinates(shapeOrigin, shapeLayout);

        shapeCoordinates.forEach((coordinate) => {
            if(!this.isValidCell(coordinate)) {
                throw new Error(`Shape coordinate [${coordinate.join(', ')}] is invalid! ${this.validDimensions}`);
            }
        });

        shapeCoordinates.forEach(coordinates => {
            this._setCell(coordinates, value, overwriteNonInitialValue);
        });
    }

    getRow(y) {
        const offsetY = y - this.offsetY;

        if(offsetY < 0 || offsetY >= this.height) {
            throw new Error(`Row at ${y} is out of bounds! ${this.validDimensions}`);
        }

        return this.grid[offsetY];
    }

    getColumn(x) {
        const offsetX = x - this.offsetX;

        if(offsetX < 0 || offsetX >= this.width) {
            throw new Error(`Column at ${x} is out of bounds! ${this.validDimensions}`);
        }

        return this.grid.map(row => row[offsetX]);
    }

    print(emptyCellValue = '.', trimY = 0) {
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
        
        this.grid.slice(trimY).forEach((row, i) => {
            const columnNumber = (i + trimY + this.offsetY).toString().padEnd(padR + 1).padStart(padL)
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

    static Transform2DCoordinate(coordinate, ...transforms) {
        return transforms.reduce((coordinate, transform) => {
            return [coordinate[0] + transform[0], coordinate[1] + transform[1]];
        }, coordinate);
    }

    static GetShapeCoordinates(shapeOrigin, shapeLayout, ...transforms) {
        return shapeLayout.reduce((coordinates, row, y) => {
            const rowCoordinates = row.map(x => Grid.Transform2DCoordinate(shapeOrigin, [x,y], ...transforms));
            return [...coordinates, ...rowCoordinates];
        }, []);
    }
}