import { getLinesFromInput } from '../utils/Input.js';
import { Grid, GRID_CARDINAL_MOVEMENT_NAMES, constructGridFromInput, GRID_CARDINAL_TRANSFORMS } from '../utils/Grid.js';
import CloneDeep from 'lodash.clonedeep';


const DIRECTION_SYMBOLS = ['^', '>', 'v', '<'];

const Step = (prevCoord, currentCoord, directionIndex, momentum, knownCost, estimatedCost) => ({
    prevCoord,
    currentCoord,
    directionIndex,
    momentum,
    knownCost,
    estimatedCost
});


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const MAX_MOMENTUM = 3;

    const cellInfo = new Array(GRID_CARDINAL_MOVEMENT_NAMES.length).fill(null).map(() => {
        return new Array(MAX_MOMENTUM).fill(null).map(() => ({
            knownCost: Infinity,
            estimatedCost: Infinity,
            previousCoordinates: null,
            previousDirectionIndex: null,
            previousMomentum: null
        }));
    });
    
    const generateCellInfo = (costString) => {
        const cell = CloneDeep(cellInfo);
    
        cell.cost = parseInt(costString);
        cell.symbol = null;
    
        return cell;
    }

    const grid = constructGridFromInput(input, '', (x) => generateCellInfo(x));

    const START_COORDINATES = [0, 0];
    const DESTINATION_COORDINATES = [ grid.width - 1, grid.height - 1 ];

    const steps = [Step(null, START_COORDINATES, null, 0, 0, Grid.GetManhattanDistance(START_COORDINATES, DESTINATION_COORDINATES))];

    let lastStep;

    while(steps.length > 0) {
        const step = steps.shift();

        if(Grid.AreCoordinatesEqual(step.currentCoord, DESTINATION_COORDINATES)) {
            lastStep = step;
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

            const nextCoord = Grid.Transform2DCoordinate(step.currentCoord, GRID_CARDINAL_TRANSFORMS[i]);

            const nextCell = grid.getCell(nextCoord);

            // If the next coordinates aren't in the grid
            if(nextCell === null) {
                continue;
            }

            const momentum = step.directionIndex === i ? step.momentum + 1 : 1;

            const knownCost = step.knownCost + nextCell.cost;
            const estimatedCost = Grid.GetManhattanDistance(nextCoord, DESTINATION_COORDINATES);

            const currentBestInfo = nextCell[i][momentum - 1];

            // If we've visited this cell from this direction and with the
            // same momentum and this path isn't better, continue.
            if(currentBestInfo.knownCost + currentBestInfo.estimatedCost <= knownCost + estimatedCost) {
                continue;
            }

            currentBestInfo.knownCost = knownCost;
            currentBestInfo.estimatedCost = estimatedCost;
            currentBestInfo.previousCoordinates = [...step.currentCoord];
            currentBestInfo.previousMomentum = step.momentum;
            currentBestInfo.previousDirectionIndex = step.directionIndex;

            const nextStep = Step(step.currentCoord, nextCoord, i, momentum, knownCost, estimatedCost);

            const insertAt = steps.findIndex((step) => knownCost + estimatedCost < step.knownCost + step.estimatedCost);

            if(insertAt === -1) {
                steps.push(nextStep);
            } else {
                steps.splice(insertAt, 0, nextStep);
            }
        }
    }

    // let coord = lastStep.currentCoord;
    // let directionIndex = lastStep.directionIndex;
    // let momentum = lastStep.momentum;

    // while(coord) {
    //     const c = grid.getCell(coord);

    //     c.symbol = DIRECTION_SYMBOLS[directionIndex];

    //     const prevCellInfo = c?.[directionIndex]?.[momentum - 1];

    //     if(!prevCellInfo) {
    //         break;
    //     }

    //     coord = prevCellInfo.previousCoordinates;
    //     directionIndex = prevCellInfo.previousDirectionIndex;
    //     momentum = prevCellInfo.previousMomentum;
    // }

    // grid.print({
    //     mapValue: x => x.symbol ?? ' '
    // });

    return { answer: lastStep.knownCost, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const MAX_MOMENTUM = 7;

    const cellInfo = new Array(GRID_CARDINAL_MOVEMENT_NAMES.length).fill(null).map(() => {
        return new Array(MAX_MOMENTUM).fill(null).map(() => ({
            knownCost: Infinity,
            estimatedCost: Infinity,
            previousCoordinates: null,
            previousDirectionIndex: null,
            previousMomentum: null
        }));
    });
    
    const generateCellInfo = (costString) => {
        const cell = CloneDeep(cellInfo);
    
        cell.cost = parseInt(costString);
        cell.symbol = null;
    
        return cell;
    }

    const grid = constructGridFromInput(input, '', (x) => generateCellInfo(x));

    const START_COORDINATES = [0, 0];
    const DESTINATION_COORDINATES = [ grid.width - 1, grid.height - 1 ];

    const steps = [Step(null, START_COORDINATES, null, 0, 0, Grid.GetManhattanDistance(START_COORDINATES, DESTINATION_COORDINATES))];

    let lastStep;

    while(steps.length > 0) {
        const step = steps.shift();

        if(Grid.AreCoordinatesEqual(step.currentCoord, DESTINATION_COORDINATES)) {
            lastStep = step;
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

            let nextCoord = [...step.currentCoord], nextCell, moveCost = 0;

            const requiredSteps = (step.directionIndex === i && step.momentum > 0) ? 1 : 4;

            // If we're turning, we need to move 4 spaces in the new direction
            for(let j = 0; j < requiredSteps; j++) {
                nextCoord = Grid.Transform2DCoordinate(nextCoord, GRID_CARDINAL_TRANSFORMS[i]);

                nextCell = grid.getCell(nextCoord);

                moveCost += nextCell?.cost ?? 0;
            }

            // If the next coordinates aren't in the grid
            if(nextCell === null) {
                continue;
            }

            const momentum = step.directionIndex === i ? step.momentum + 1 : 1;

            const knownCost = step.knownCost + moveCost;
            const estimatedCost = Grid.GetManhattanDistance(nextCoord, DESTINATION_COORDINATES);

            const currentBestInfo = nextCell[i][momentum - 1];

            // If we've visited this cell from this direction and with the
            // same momentum and this path isn't better, continue.
            if(currentBestInfo.knownCost + currentBestInfo.estimatedCost <= knownCost + estimatedCost) {
                continue;
            }

            currentBestInfo.knownCost = knownCost;
            currentBestInfo.estimatedCost = estimatedCost;
            currentBestInfo.previousCoordinates = [...step.currentCoord];
            currentBestInfo.previousMomentum = step.momentum;
            currentBestInfo.previousDirectionIndex = step.directionIndex;

            const nextStep = Step(step.currentCoord, nextCoord, i, momentum, knownCost, estimatedCost);

            const insertAt = steps.findIndex((step) => knownCost + estimatedCost < step.knownCost + step.estimatedCost);

            if(insertAt === -1) {
                steps.push(nextStep);
            } else {
                steps.splice(insertAt, 0, nextStep);
            }
        }
    }

    // let coord = lastStep.currentCoord;
    // let directionIndex = lastStep.directionIndex;
    // let momentum = lastStep.momentum;

    // while(coord) {
    //     const c = grid.getCell(coord);

    //     c.symbol = DIRECTION_SYMBOLS[directionIndex];

    //     const prevCellInfo = c?.[directionIndex]?.[momentum - 1];

    //     if(!prevCellInfo) {
    //         break;
    //     }

    //     coord = prevCellInfo.previousCoordinates;
    //     directionIndex = prevCellInfo.previousDirectionIndex;
    //     momentum = prevCellInfo.previousMomentum;
    // }

    // grid.print({
    //     mapValue: x => x.symbol ?? ' '
    // });

    return { answer: lastStep.knownCost, extraInfo: undefined };

}
