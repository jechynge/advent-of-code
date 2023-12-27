import { getLinesFromInput } from '../utils/Input.js';
import { constructGridFromInput, GRID_CARDINAL_TRANSFORMS, Grid } from '../utils/Grid.js';

const MAX_STEPS = 64;


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const grid = constructGridFromInput(input, '', (symbol) => ({
        symbol,
        visited: false,
        seen: false,
        steps: -1
    }));

    const startCoordinates = grid.findCellCoordinates((cell) => cell.symbol === 'S');
    const startCell = grid.getCell(startCoordinates);

    grid.setCell(startCoordinates, {
        ...startCell,
        steps: 0
    });

    const queue = [ startCoordinates ];

    while(queue.length > 0) {

        const currentCoordinates = queue.shift();
        const currentCell = grid.getCell(currentCoordinates);

        const currentSteps = currentCell.steps;

        currentCell.visited = true;

        if(currentSteps === MAX_STEPS) {
            continue;
        }

        for(const transform of GRID_CARDINAL_TRANSFORMS) {
            const nextCoordinates = Grid.Transform2DCoordinate(currentCoordinates, transform);

            const nextCell = grid.getCell(nextCoordinates);

            if(!nextCell || nextCell.symbol === '#' || nextCell.seen || nextCell.visited) {
                continue;
            }

            queue.push(nextCoordinates);

            nextCell.steps = currentSteps + 1;
            nextCell.seen = true;
        }

    }

    const visitedCount = grid.reduce((count, cell) => count + (cell.steps % 2 === 0), 0);

    return { answer: visitedCount, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    // ...todo

    return { answer: null, extraInfo: undefined };

}
