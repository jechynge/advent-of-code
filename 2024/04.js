import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput, GRID_ORTHOGONAL_TRANSFORMS, GRID_CARDINAL_MOVEMENT, GRID_ORTHOGONAL_MOVEMENT } from '../utils/Grid.js';


const MAS = ['M', 'A', 'S'];


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const wordSearch = constructGridFromInput(input, '');

    const total = wordSearch.reduce((count, cell, originCoordinates) => {
        if(cell !== 'X') {
            return count;
        }

        let found = 0;

        for(const transform of GRID_ORTHOGONAL_TRANSFORMS) {

            let currentCoordinates = [ ...originCoordinates ];

            const isXmas = MAS.every((seekChar) => {
                currentCoordinates = Grid.Transform2DCoordinate(currentCoordinates, transform);
                return seekChar === wordSearch.getCell(currentCoordinates);
            });

            if(isXmas) {
                ++found;
            }
        }

        return count + found;

    }, 0);

    return { answer: total, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const cornerSum = 'M'.charCodeAt(0) + 'S'.charCodeAt(0);

    const wordSearch = constructGridFromInput(input, '');

    const total = wordSearch.reduce((count, cell, originCoordinates) => {
        if(cell !== 'A') {
            return count;
        }

        const topLeft = wordSearch.getCell(Grid.Transform2DCoordinate(originCoordinates, GRID_ORTHOGONAL_MOVEMENT.up_left))?.charCodeAt(0) ?? NaN;
        const topRight = wordSearch.getCell(Grid.Transform2DCoordinate(originCoordinates, GRID_ORTHOGONAL_MOVEMENT.up_right))?.charCodeAt(0) ?? NaN;
        const bottomLeft = wordSearch.getCell(Grid.Transform2DCoordinate(originCoordinates, GRID_ORTHOGONAL_MOVEMENT.down_left))?.charCodeAt(0) ?? NaN;
        const bottomRight = wordSearch.getCell(Grid.Transform2DCoordinate(originCoordinates, GRID_ORTHOGONAL_MOVEMENT.down_right))?.charCodeAt(0) ?? NaN;

        return topLeft + bottomRight === cornerSum && topRight + bottomLeft === cornerSum ? count + 1 : count;

    }, 0);

    return { answer: total, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 18;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 9;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
