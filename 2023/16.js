import { Grid, GRID_CARDINAL_MOVEMENT, constructGridFromInput, GRID_CARDINAL_MOVEMENT_NAMES } from '../utils/Grid.js';
import Range from '../utils/Range.js';


const movementBitmap = GRID_CARDINAL_MOVEMENT_NAMES.reduce((map, name, i) => {
    return {
        ...map,
        [name]: 1 << i
    }
}, {});

const movementSymbols = ['.', '|', '-', '/', '\\'];

const moves = [
    ,
    {
        right: ['up', 'down'],
        left: ['up', 'down']
    },
    {
        up: ['left', 'right'],
        down: ['left', 'right']
    },
    {
        up: ['right'],
        right: ['up'],
        down: ['left'],
        left: ['down']
    },
    {
        up: ['left'],
        right: ['down'],
        down: ['right'],
        left: ['up']
    }
];

const energizeGrid = (grid, startCoordinates, startDirection) => {
    const beams = [ {
        coordinates: startCoordinates,
        direction: startDirection
    } ];

    while(beams.length) {
        const { coordinates, direction } = beams.pop();

        const cell = grid.getCell(coordinates);
        const moveBit = movementBitmap[direction];

        if(cell === null || cell & moveBit) {
            continue;
        }

        grid.setCell(coordinates, cell + moveBit);

        const symbolIndex = cell >> 4;

        const [ newDirection, splitDirection ] = moves[symbolIndex]?.[direction] ?? [ direction ];

        beams.push({
            direction: newDirection,
            coordinates: Grid.Transform2DCoordinate(coordinates, GRID_CARDINAL_MOVEMENT[newDirection])
        });

        if(splitDirection) {
            beams.push({
                direction: splitDirection,
                coordinates: Grid.Transform2DCoordinate(coordinates, GRID_CARDINAL_MOVEMENT[splitDirection])
            });
        }
    }
}

const resetGrid = (grid) => {
    for(let x = 0; x < grid.width; x++) {
        for(let y = 0; y < grid.height; y++) {
            grid.grid[y][x] = (grid.grid[y][x] >> 4) << 4;
        }
    }
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const grid = constructGridFromInput(input, '', symbol => movementSymbols.indexOf(symbol) << 4);

    energizeGrid(grid, [ 0, 0 ], 'right');

    const energizedCells = grid.reduce((total, cell) => (cell & 0b1111) > 0 ? total + 1 : total, 0);

    return { answer: energizedCells, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const grid = constructGridFromInput(input, '', symbol => movementSymbols.indexOf(symbol) << 4);

    const startCoordinatesForDirection = {
        down: Range(0, grid.width).map(x => ([x, 0])),
        left: Range(0, grid.height).map(y => ([ grid.width - 1, y])),
        up: Range(0, grid.width).map(x => ([x, grid.height - 1])),
        right: Range(0, grid.height).map(y => ([ 0, y]))
    }

    let max = 0;

    for(const startDirection of GRID_CARDINAL_MOVEMENT_NAMES) {
        for(const startCoordinates of startCoordinatesForDirection[startDirection]) {

            energizeGrid(grid, startCoordinates, startDirection);

            const energizedCells = grid.reduce((total, cell) => (cell & 0b1111) > 0 ? total + 1 : total, 0);

            max = Math.max(max, energizedCells);

            resetGrid(grid);

        }
    }

    return { answer: max, extraInfo: undefined };

}
