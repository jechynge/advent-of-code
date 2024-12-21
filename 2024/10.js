import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput, GRID_CARDINAL_TRANSFORMS } from '../utils/Grid.js';
import { parseSingleDigitInt } from '../utils/Math.js';

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const trailheads = [];

    const trails = constructGridFromInput(input, '', (x, coordinates) => {
        const digit = parseSingleDigitInt(x);

        if(digit === 0) {
            trailheads.push(coordinates);
        }

        return digit;
    });

    const trailscores = new Array(trailheads.length).fill(0);


    for(let i = 0; i < trailheads.length; i++) {

        const trailhead = trailheads[ i ];

        const seen = [];

        const queue = [ trailhead ];

        while(queue.length > 0) {
            const position = queue.pop();
            const elevation = trails.getCell(position);

            if(elevation === 9 && !seen.some((seen) => Grid.AreCoordinatesEqual(seen, position))) {
                ++trailscores[ i ];
            }

            seen.push(position);

            for(let transform of GRID_CARDINAL_TRANSFORMS) {
                const adjacentCoordinate = Grid.Transform2DCoordinate(position, transform);

                const adjacentElevation = trails.getCell(adjacentCoordinate);

                if(adjacentElevation === null) {
                    continue;
                }

                if(adjacentElevation - elevation === 1) {
                    if(seen.some((seen) => Grid.AreCoordinatesEqual(seen, adjacentCoordinate))) {
                        continue;
                    }

                    queue.push(adjacentCoordinate);
                }
            }
        }
    }

    const score = trailscores.reduce((sum, score) => sum + score, 0);

    return { answer: score, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    // ...todo

    return { answer: null, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 36;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = null;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
