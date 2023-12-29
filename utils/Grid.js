import CloneDeep from 'lodash.clonedeep';
import Range from './Range.js';
import { getLinesFromInput } from './Input.js';
import _ from 'lodash';
import { identity } from './Math.js';

export const GRID_CARDINAL_COORDINATES = ['top', 'right', 'bottom', 'left'];
export const GRID_CARDINAL_TRANSFORMS = [
    [0,-1],
    [1,0],
    [0,1],
    [-1,0]
];

export const GRID_CARDINAL_MOVEMENT_NAMES = [
    'up', 'right', 'down', 'left'
];

export const GRID_CARDINAL_MOVEMENT = {
    U: GRID_CARDINAL_TRANSFORMS[0],
    R: GRID_CARDINAL_TRANSFORMS[1],
    D: GRID_CARDINAL_TRANSFORMS[2],
    L: GRID_CARDINAL_TRANSFORMS[3],
    up: GRID_CARDINAL_TRANSFORMS[0],
    right: GRID_CARDINAL_TRANSFORMS[1],
    down: GRID_CARDINAL_TRANSFORMS[2],
    left: GRID_CARDINAL_TRANSFORMS[3],
    north: GRID_CARDINAL_TRANSFORMS[0],
    east: GRID_CARDINAL_TRANSFORMS[1],
    south: GRID_CARDINAL_TRANSFORMS[2],
    west: GRID_CARDINAL_TRANSFORMS[3]
}

export const GRID_ORTHOGONAL_TRANSFORMS = [
    [0,-1], // up
    [1,-1], // up + right
    [1,0],  // right
    [1,1],  // right + down
    [0,1],  // down
    [-1,1], // down + left
    [-1,0], // left
    [-1,-1] // left + up
];

export const GRID_ORTHOGONAL_MOVEMENT_NAMES = [
    'up', 'up_right', 'right', 'down_right', 'down', 'down_left', 'left', 'up_left'
];

export const GRID_ORTHOGONAL_MOVEMENT = {
    up: GRID_ORTHOGONAL_TRANSFORMS[0],
    up_right: GRID_ORTHOGONAL_TRANSFORMS[1],
    right_up: GRID_ORTHOGONAL_TRANSFORMS[1],
    right: GRID_ORTHOGONAL_TRANSFORMS[2],
    right_down: GRID_ORTHOGONAL_TRANSFORMS[3],
    down_right: GRID_ORTHOGONAL_TRANSFORMS[3],
    down: GRID_ORTHOGONAL_TRANSFORMS[4],
    down_left: GRID_ORTHOGONAL_TRANSFORMS[5],
    left_down: GRID_ORTHOGONAL_TRANSFORMS[5],
    left: GRID_ORTHOGONAL_TRANSFORMS[6],
    left_up: GRID_ORTHOGONAL_TRANSFORMS[7],
    up_left: GRID_ORTHOGONAL_TRANSFORMS[7],
    north: GRID_ORTHOGONAL_TRANSFORMS[0],
    north_east: GRID_ORTHOGONAL_TRANSFORMS[1],
    east: GRID_ORTHOGONAL_TRANSFORMS[2],
    south_east: GRID_ORTHOGONAL_TRANSFORMS[3],
    south: GRID_ORTHOGONAL_TRANSFORMS[4],
    south_west: GRID_ORTHOGONAL_TRANSFORMS[5],
    west: GRID_ORTHOGONAL_TRANSFORMS[6],
    north_west: GRID_ORTHOGONAL_TRANSFORMS[7]
}

export const DIR_MATRIX = [
    ['up_left', 'up', 'up_right'],
    ['left', null, 'right'],
    ['down_left', 'down', 'down_right']
];

export const constructGridFromInput = (input, splitOn = '', mapFunction = x => x, options = {}) => {
    const rows = getLinesFromInput(input).map((row) => row.split(splitOn).map(mapFunction));

    const height = rows.length;
    const width = rows[0].length;

    if(!rows.every((row) => row.length === width)) {
        throw new Error(`Not all rows are the same length!`);
    }

    const grid = new Grid(width, height, undefined, options);

    for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
            grid.setCell([x, y], rows[y][x]);
        }
    }

    return grid;
}

export class Grid {
    constructor(width, height, initialValue, options) {
        this.width = width + (options?.baseOne ? 1 : 0);
        this.height = height + (options?.baseOne ? 1 : 0);

        this.offsetX = options?.offsetX ?? 0;
        this.offsetY = options?.offsetY ?? 0;

        this.initialValue = initialValue;

        this.grid = new Array(this.height)
            .fill(undefined)
            .map(() => new Array(this.width).fill(this.initialValue));

        if(typeof this.initialValue === 'function') {
            for(let y = 0; y < this.height; y++) {
                for(let x = 0; x < this.width; x++) {
                    this.grid[ y ][ x ] = this.initialValue(this.getOffsetCoordinates([x, y]));
                }
            }
        }
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
    }

    addRow(y, value = this.initialValue) {
        const newRow = new Array(this.width).fill(null).map((_value, x) => typeof value === 'function' ? value(this.getOffsetCoordinates([x, y])) : value);

        this.grid.splice(y, 0, newRow);
        ++this.height;
    }

    addColumn(x, value = this.initialValue) {
        this.grid.forEach((row, y) => {
            row.splice(x, 0, typeof value === 'function' ? value(this.getOffsetCoordinates([x, y])) : value);
        });

        ++this.width;
    }

    validDimensions() {
        return `[${this.offsetX} <= X <= ${this.width - 1 + this.offsetX}] | [${this.offsetY} <= Y <= ${this.height - 1 + this.offsetY}]`;
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

    findCellCoordinates(predicate) {
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                if(predicate(this.grid[y][x])) {
                    return this.getOffsetCoordinates([x,y]);
                }
            }
        }

        return null;
    }

    // It is not recommended to call this directly!
    _setCell(coordinates, value, overwriteNonInitialValue = true) {
        const [x, y] = this.getOffsetCoordinates(coordinates);

        if(overwriteNonInitialValue || this.grid[y][x] === this.initialValue) {
            this.grid[y][x] = typeof value === 'function' ? value(this.grid[y][x]) : value;
        }
    }

    setCell(coordinates, value, overwriteNonInitialValue = true) {
        if(!this.isValidCell(coordinates)) {
            throw new Error(`Cell coordinates [${coordinates.join(', ')}] are invalid! ${this.validDimensions()}`);
        }

        this._setCell(coordinates, value, overwriteNonInitialValue);
    }

    // Range coordinates are inclusive!
    setRange(from, to, value, overwriteNonInitialValue = true) {
        if(!this.isValidCell(from)) {
            throw new Error(`"from" coordinates [${from.join(', ')}] are invalid! ${this.validDimensions()}`);
        }

        if(!this.isValidCell(to)) {
            throw new Error(`"to" coordinates [${to.join(', ')}] are invalid! ${this.validDimensions()}`);
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

    setLine(from, to, value, overwriteNonInitialValue = true) {
        if(from[0] === to[0] || from[1] === to[1]) {
            this.setRange(from, to, value, overwriteNonInitialValue);
        } else if(Math.abs(from[0] - to[0]) === Math.abs(from[1] - to[1])) {
            const xCoordinates = Range(from[0], to[0]);
            const yCoordinates = Range(from[1], to[1]);

            for(let i = 0; i < xCoordinates.length; i++) {
                this.setCell([xCoordinates[i], yCoordinates[i]], value, overwriteNonInitialValue);
            }
        } else {
            throw new Error(`Line defined by "from -> to" must either be vertical, horizontal, or diagonal`);
        }
    }

    setManhattanRadius(center, radius, value, overwriteNonInitialValue = true) {
        const { coordinates, boundaries } = Grid.GetManhattanBoundary(center, radius);

        coordinates.forEach((coordinate, i) => {
            if(!this.isValidCell(coordinate)) {
                throw new Error(`${GRID_CARDINAL_COORDINATES[i]}-most coordinate [${coordinate.join(', ')}] is invalid! ${this.validDimensions()}`);
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
                throw new Error(`Shape coordinate [${coordinate.join(', ')}] is invalid! ${this.validDimensions()}`);
            }
        });

        shapeCoordinates.forEach(coordinates => {
            this._setCell(coordinates, value, overwriteNonInitialValue);
        });
    }

    getRow(y) {
        const offsetY = y - this.offsetY;

        if(offsetY < 0 || offsetY >= this.height) {
            throw new Error(`Row at ${y} is out of bounds! ${this.validDimensions()}`);
        }

        return this.grid[offsetY];
    }

    getColumn(x) {
        const offsetX = x - this.offsetX;

        if(offsetX < 0 || offsetX >= this.width) {
            throw new Error(`Column at ${x} is out of bounds! ${this.validDimensions()}`);
        }

        return this.grid.map(row => row[offsetX]);
    }

    // shapeOrigin is the top left coordinate
    isValidMove(shapeOrigin, hitbox, transform = [0,0]) {
        return Grid.GetShapeCoordinates(shapeOrigin, hitbox, transform).every(nextPosition => {
            return this.isValidCell(nextPosition) && !this.getCell(nextPosition);
        });
    }

    // Only checks the destination cell for valid movement
    moveCell(coordinates, transform = [0,0]) {

        const nextCoordinates = Grid.Transform2DCoordinate(coordinates, transform);

        if(this.isValidCell(nextCoordinates) && this.getCell(nextCoordinates) === this.initialValue) {
            this.setCell(nextCoordinates, this.getCell(coordinates));
            this.setCell(coordinates, this.initialValue);

            return nextCoordinates;
        }

        return false;

    }

    findPopulatedRowBoundary() {
        const minPopulatedRow = this.grid.findIndex(row => row.some(cell => cell !== this.initialValue));
        const maxPopulatedRow = this.grid.findLastIndex(row => row.some(cell => cell !== this.initialValue));

        return {
            minPopulatedRow,
            maxPopulatedRow
        };
    }

    findPopulatedColumnBoundary() {
        return this.grid.reduce((boundaries, row) => {
            const min = row.findIndex(cell => cell !== this.initialValue);
            
            // If this row doesn't have any non-initial values, bail out
            if(min === -1) {
                return boundaries;
            }
            
            const max = row.findLastIndex(cell => cell !== this.initialValue);

            return {
                minPopulatedColumn: boundaries.minPopulatedColumn === -1 ? min : Math.min(min, boundaries.minPopulatedColumn),
                maxPopulatedColumn: boundaries.maxPopulatedColumn === -1 ? max : Math.max(max, boundaries.maxPopulatedColumn)
            }
        }, { minPopulatedColumn: -1, maxPopulatedColumn: -1});
    }

    reduce(callback, initialValue) {

        let accum = CloneDeep(initialValue);

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                const outerCoordinates = Grid.Transform2DCoordinate([x,y], [this.offsetX, this.offsetY]);

                accum = callback(accum, this.grid[y][x], outerCoordinates, this);
            }
        }

        return accum;
    }

    forEach(callback) {

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                const outerCoordinates = Grid.Transform2DCoordinate([x,y], [this.offsetX, this.offsetY]);

                callback(this.grid[y][x], outerCoordinates, this);
            }
        }

        return this;

    }

    clone(deep = false) {

        const clone = new Grid(this.width, this.height, this.initialValue, {
            offsetX: this.offsetX,
            offsetY: this.offsetY
        });

        if(deep) {
            for(let i = 0; i < this.grid.length; i++) {
                clone.grid[i] = CloneDeep(this.grid[i]);
            }
        } else {
            for(let i = 0; i < this.grid.length; i++) {
                clone.grid[i] = [ ...this.grid[i] ];
            }
        }

        return clone;
        
    }

    print(options) {

        options = {
            emptyCellValue: '.',
            trimY: false,
            trimYFrom: 0,
            mapValue: x => x,
            ...options
        };

        const fives = this.grid[0].reduce((accum, value, i) => {
            const x = Math.abs(i + this.offsetX);
            return x % 5 === 0 ? accum + (x % 10).toString() : accum + ' '
        }, '');

        const tens = this.grid[0].reduce((accum, value, i) => {
            const x = Math.abs(i + this.offsetX);
            return Math.abs(x) >= 10 && x % 5 === 0 ? accum +( Math.floor(x / 10) % 10).toString() : accum + ' '
        }, '');

        
        const rowNumbersLength = `${this.height + this.offsetY}`.length + (this.offsetY < 0 ? 1 : 0);

        console.log(''.padEnd(rowNumbersLength), tens);
        console.log(''.padEnd(rowNumbersLength), fives);

        let trimYFrom = options.trimYFrom;
        let trimYTo = options.trimYTo;

        if(options.trimY) {
            const { minPopulatedRow, maxPopulatedRow } = this.findPopulatedRowBoundary();

            if(minPopulatedRow > -1 && maxPopulatedRow > -1) {
                trimYFrom = minPopulatedRow;
                trimYTo = maxPopulatedRow + 1;
            }
        }
        
        this.grid.slice(trimYFrom, trimYTo).forEach((row, i) => {
            const columnNumber = (i + trimYFrom + this.offsetY).toString().padStart(rowNumbersLength);
            console.log(columnNumber, row.map(cell => options.mapValue(cell ?? options.emptyCellValue)).join(''));
        });
    }

    static GetBoundingBoxForCoordinatePair([ x1, y1 ], [ x2, y2 ]) {
        const top = Math.min(y1, y2);
        const left = Math.min(x1, x2);

        const right = Math.max(x1, x2);
        const bottom = Math.max(y1, y2);

        return {
            topLeft: [ left, top ],
            bottomRight: [ right, bottom ]
        };
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
        }, [ ...coordinate ]);
    }

    static TransformAndWrap2DCoordinate(coordinate, width, height, ...transforms) {
        const [ x, y ] = transforms.reduce((coordinate, transform) => {
            return [coordinate[0] + transform[0], coordinate[1] + transform[1]];
        }, [ ...coordinate ]);

        return [ Math.abs(x % width), Math.abs(y % height) ];
    }

    static Multiply2DCoordinate(coordinate, factor) {
        return [ coordinate[0] * factor, coordinate[1] * factor ];
    }

    static GetShapeCoordinates(shapeOrigin, shapeLayout, ...transforms) {
        return shapeLayout.reduce((coordinates, row, y) => {
            const rowCoordinates = row.map(x => Grid.Transform2DCoordinate(shapeOrigin, [x,y], ...transforms));
            return [...coordinates, ...rowCoordinates];
        }, []);
    }

    static ParseCoordinateString(coordinateString) {
        const coordinates = coordinateString.split(',').map(coordinate => parseInt(coordinate));

        if(coordinates.length !== 2 || coordinates.some(isNaN)) {
            throw new Error(`Invalid coordinate String input: "${coordinateString}"`);
        }

        return coordinates;
    }

    static CalculateGridSize(coordinates) {
        const boundary = coordinates.reduce((accum, [x, y]) => {

            return {
                minX: Math.min(accum.minX, x), 
                minY: Math.min(accum.minY, y), 
                maxX: Math.max(accum.maxX, x), 
                maxY: Math.max(accum.maxY, y)
            };
    
        }, {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity});

        return {
            width: boundary.maxX - boundary.minX + 1,
            height: boundary.maxY - boundary.minY + 1,
            offsetX: boundary.minX,
            offsetY: boundary.minY
        };
    }

    static IsCoordinateInBox(coordinate, topLeft, bottomRight, edgeInclusive = false) {
        if(edgeInclusive) {
            return coordinate[0] >= topLeft[0] &&
                   coordinate[0] <= bottomRight[0] &&
                   coordinate[1] >= topLeft[1] &&
                   coordinate[1] <= bottomRight[1];
        } else {
            return coordinate[0] > topLeft[0] &&
                   coordinate[0] < bottomRight[0] &&
                   coordinate[1] > topLeft[1] &&
                   coordinate[1] < bottomRight[1];
        }
    }

    static GetPathRotationDirection(path) {

        const moveDirections = [];

        const skipLastStep = Grid.AreCoordinatesEqual(path[ 0 ], path[ path.length - 1 ]);

        for(let i = 0; i < path.length - skipLastStep; i++) {
            const from = path[ i ];
            const to = path[ (i + 1) % path.length ];

            moveDirections.push(Grid.GetStepDirection(from, to));
        }

        const rotation = moveDirections.reduce((direction, currentMoveDirection, i, moveDirections) => {
            const nextMoveDirection = moveDirections[ ( i + 1 ) % moveDirections.length ];

            const rotationDirection = Grid.DetectTurnDirection(currentMoveDirection, nextMoveDirection);

            if(rotationDirection === 'clockwise') {
                return direction + 1;
            }

            if(rotationDirection === 'counterclockwise') {
                return direction - 1;
            }

            return direction;
        }, 0);

        return rotation > 0 ? 'clockwise' : 'counterclockwise';

    }

    static GetStepDirection([ fromX, fromY ], [ toX, toY ]) {

        const identX = identity(toX - fromX);
        const identY = identity(toY - fromY);

        return DIR_MATRIX[identY + 1][identX + 1];

    }

    static DetectTurnDirection(firstMoveDirection, secondMoveDirection) {
        const Turns = {
            up: {
                right: 'clockwise',
                left: 'counterclockwise'
            },
            right: {
                up: 'counterclockwise',
                down: 'clockwise'
            },
            down: {
                right: 'counterclockwise',
                left: 'clockwise'
            },
            left: {
                up: 'clockwise',
                down: 'counterclockwise'
            }
        };

        return Turns[firstMoveDirection][secondMoveDirection] ?? 'straight';
    }

    static CalculatePathArea(path) {
        const rotation = Grid.GetPathRotationDirection(path);

        if(rotation === 'counterclockwise') {
            path.reverse();
        }

        const area = path.reduce((area, [ xa, ya ], i, path) => {
            if(i === path.length - 1) {
                return area;
            }

            const [ xb, yb ] = path[ i + 1 ];

            return area + (xa * yb) - (xb * ya) + Math.abs(xa - xb + ya - yb);
        }, 0);

        return area / 2 + 1;
    }
}

export default Grid;