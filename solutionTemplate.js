import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    // ...todo

    return { answer: null, extraInfo: undefined };

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

    const firstExpectedAnswer = null;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = null;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
