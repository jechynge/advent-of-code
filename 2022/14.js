import { getLinesFromInput } from '../utils/Input.js';
import Grid from '../utils/Grid.js';


////////////
// Part 1 //
////////////


const WALL = '#';
const SAND = 'o';
const SAND_ORIGIN = '+';

const SAND_ORIGIN_COORDINATES = [500, 0];

// Looks below a given point for the first non-undefined cell
function scanBelow(grid, [ originX, originY ]) {
    let x = originX;

    for(let y = originY; y < grid.height; y++) {
        const nextY = y + 1;

        if(nextY === grid.height) {
            return null;
        }

        if(grid.getCell([x, nextY]) === undefined) {
            continue;
        }

        if(grid.getCell([x - 1, nextY]) === undefined) {
            x--;
            continue;
        }

        if(grid.getCell([x + 1, nextY]) === undefined) {
            x++;
            continue;
        }

        // If all cells below us are non-undefined, we've come to rest
        return [x, y];
    }
}


export async function firstPuzzle(input) {
    
    const minDim = [ Infinity, 0 ]
    const maxDim = [ -Infinity, -Infinity ];

    const layout = getLinesFromInput(input).map(line => {
        return line.split(' -> ').map(x => x.split(',').map((x, i) => {
            const coord = parseInt(x);

            if(coord < minDim[i]) {
                minDim[i] = coord;
            }

            if(coord > maxDim[i]) {
                maxDim[i] = coord;
            }

            return coord;
        }));
    });

    minDim[0] -= 5;
    maxDim[0] += 5;

    const width = maxDim[0] - minDim[0] + 1;
    const height = maxDim[1] - minDim[1] + 1;
    const gridOptions = {
        offsetX: minDim[0]
    };

    const grid = new Grid(width, height, undefined, gridOptions);

    grid.setCell(SAND_ORIGIN_COORDINATES, SAND_ORIGIN);

    layout.forEach(wall => {
        for(let i = 0; i < wall.length - 1; i++) {
            const from = wall[i];
            const to = wall[i + 1];

            grid.setRange(from, to, WALL);
        }
    });

    let sandCount = 0;

    let minX = Infinity;
    let maxX = -Infinity;

    while(true) {
        const sandRestingCoordinates = scanBelow(grid, [...SAND_ORIGIN_COORDINATES]);
        
        if(sandRestingCoordinates === null) {
            break;
        }

        maxX = Math.max(sandRestingCoordinates[0], maxX);
        minX = Math.min(sandRestingCoordinates[0], minX);

        grid.setCell(sandRestingCoordinates, SAND);

        sandCount++;
    }

    return { answer: sandCount, extraInfo: `Sand is resting between ${minX} and ${maxX}` };
}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const minDim = [ Infinity, 0 ]
    const maxDim = [ -Infinity, -Infinity ];

    const layout = getLinesFromInput(input).map(line => {
        return line.split(' -> ').map(x => x.split(',').map((x, i) => {
            const coord = parseInt(x);

            if(coord < minDim[i]) {
                minDim[i] = coord;
            }

            if(coord > maxDim[i]) {
                maxDim[i] = coord;
            }

            return coord;
        }));
    });

    minDim[0] -= 150;
    maxDim[0] += 150;

    maxDim[1] += 2;

    layout.push([[minDim[0], maxDim[1]], [maxDim[0], maxDim[1]]]);

    const width = maxDim[0] - minDim[0] + 1;
    const height = maxDim[1] - minDim[1] + 1;
    const gridOptions = {
        offsetX: minDim[0]
    };

    const grid = new Grid(width, height, undefined, gridOptions);

    grid.setCell(SAND_ORIGIN_COORDINATES, SAND_ORIGIN);

    layout.forEach(wall => {
        for(let i = 0; i < wall.length - 1; i++) {
            grid.setRange(wall[i], wall[i + 1], WALL);
        }
    });

    let sandCount = 0;

    let minX = Infinity;
    let maxX = -Infinity;

    while(true) {
        const sandRestingCoordinates = scanBelow(grid, [...SAND_ORIGIN_COORDINATES]);

        maxX = Math.max(sandRestingCoordinates[0], maxX);
        minX = Math.min(sandRestingCoordinates[0], minX);

        grid.setCell(sandRestingCoordinates, SAND);

        sandCount++;

        if(Grid.AreCoordinatesEqual(sandRestingCoordinates, SAND_ORIGIN_COORDINATES)) {
            break;
        }
    }

    return { answer: sandCount, extraInfo: `Sand is resting between ${minX} and ${maxX}` };
    
}
