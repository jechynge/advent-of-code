import { getLinesFromInput } from '../utils/Input.js';
import Grid, { GRID_CARDINAL_MOVEMENT, GRID_CARDINAL_MOVEMENT_NAMES } from '../utils/Grid.js';

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const instructions = getLinesFromInput(input).map(line => line.split(' ')).map(([ dir, steps, colour ]) => [ dir, parseInt(steps), colour.substring(1, colour.length - 1) ]);

    const diggerPath = [[ 0, 0 ]];

    for(let i = 0; i < instructions.length; i++) {
        const [ direction, steps ] = instructions[ i ];

        const currentCoordinates = diggerPath[ i ];

        const transform = GRID_CARDINAL_MOVEMENT[ direction ];

        const translateBy = Grid.Multiply2DCoordinate(transform, steps);

        diggerPath.push(Grid.Transform2DCoordinate(currentCoordinates, translateBy));
    }

    const area = Grid.CalculatePathArea(diggerPath);

    return { answer: area, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const instructions = getLinesFromInput(input).map(line => line.split(' ')).map(([ , , colour ]) => {
        const theirDirectionIndex = parseInt(colour.substring(colour.length - 2, colour.length - 1));
        const myDirectionIndex = (theirDirectionIndex + 5) % GRID_CARDINAL_MOVEMENT_NAMES.length;
        const stepsString = colour.substring(2, colour.length - 2);

        return [ GRID_CARDINAL_MOVEMENT_NAMES[myDirectionIndex], parseInt(stepsString, 16) ];

    });

    const diggerPath = [[ 0, 0 ]];

    for(let i = 0; i < instructions.length; i++) {
        const [ direction, steps ] = instructions[ i ];

        const currentCoordinates = diggerPath[ i ];

        const transform = GRID_CARDINAL_MOVEMENT[ direction ];

        const translateBy = Grid.Multiply2DCoordinate(transform, steps);

        diggerPath.push(Grid.Transform2DCoordinate(currentCoordinates, translateBy));
    }

    const area = Grid.CalculatePathArea(diggerPath);

    return { answer: area, extraInfo: undefined };

}
