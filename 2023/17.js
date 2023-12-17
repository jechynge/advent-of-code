import { getLinesFromInput } from '../utils/Input.js';
import { Grid, GRID_CARDINAL_MOVEMENT_NAMES, constructGridFromInput, GRID_CARDINAL_TRANSFORMS } from '../utils/Grid.js';
import CloneDeep from 'lodash.clonedeep';


const MAX_MOMENTUM = 3;

const Step = (from, to, directionIndex, momentum, cost) => ({
    from,
    to,
    directionIndex,
    momentum,
    cost
});

const cellInfo = new Array(GRID_CARDINAL_MOVEMENT_NAMES.length).fill(null).map(() => {
    return new Array(MAX_MOMENTUM).fill(null).map(() => ({
        knownCost: Infinity,
        estimatedCost: Infinity,
        previousCoordinates: null
    }));
});

const generateCellInfo = (costString) => {
    const cell = CloneDeep(cellInfo);

    cell.cost = parseInt(costString);

    return cell;
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const grid = constructGridFromInput(input, '', (x) => generateCellInfo(x));

    const START_COORDINATES = [0, 0];
    const DESTINATION_COORDINATES = [ grid.width - 1, grid.height - 1 ];

    const steps = [Step(null, START_COORDINATES, null, 0, Grid.GetManhattanDistance(START_COORDINATES, DESTINATION_COORDINATES))];

    while(steps.length > 0) {
        const step = steps.shift();

        if(Grid.AreCoordinatesEqual(step.to, DESTINATION_COORDINATES)) {
            break;
        }

        for(let i = 0; i < GRID_CARDINAL_MOVEMENT_NAMES.length; i++) {
            // We can't reverse direction.
            if(Math.abs(step.directionIndex - i) === 2) {
                continue;
            }

            // If we've gone in the same direction too many times, we can't go
            // that direction next.
            if(step.momentum === MAX_MOMENTUM && step.directionIndex === i) {
                continue;
            }

            const to = Grid.Transform2DCoordinate(step.to, GRID_CARDINAL_TRANSFORMS[i]);

            const cell = grid.getCell(to);

            // If the next coordinates aren't in the grid
            if(cell === null) {
                continue;
            }

            const cost = step.cost + cell.cost;
            const estimatedCost = Grid.GetManhattanDistance(to, DESTINATION_COORDINATES);

            
        }
    }



    return { answer: null, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    // ...todo

    return { answer: null, extraInfo: undefined };

}
