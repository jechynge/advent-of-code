import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';

////////////
// Part 1 //
////////////

const validMul = /^mul\((\d{1,3}),(\d{1,3})\)/;
const maxMulLen = 12;

export async function firstPuzzle(input) {

    const jumble = getLinesFromInput(input).join('');

    let sum = 0;
    let matches = 0;

    for(let i = 0; i < jumble.length; i++) {
        const char = jumble[ i ];

        if(char !== 'm') {
            continue;
        }

        const match = validMul.exec(jumble.substring(i, i + 12));

        if(match === null || match.length < 2) {
            continue;
        }

        const [ , dig1, dig2 ] = match;

        ++matches;
        sum += parseInt(dig1) * parseInt(dig2);
    }

    return { answer: sum, extraInfo: `Found ${matches} valid mul instructions` };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const jumble = getLinesFromInput(input).join('');

    let sum = 0;
    let matches = 0;
    let enabled = true;

    for(let i = 0; i < jumble.length; i++) {
        const char = jumble[ i ];

        if(char === 'm') {
            if(!enabled) {
                continue;
            }

            const match = validMul.exec(jumble.substring(i, i + 12));

            if(match === null || match.length < 2) {
                continue;
            }
    
            const [ , dig1, dig2 ] = match;
    
            ++matches;
            sum += parseInt(dig1) * parseInt(dig2);

        } else if(char === 'd') {

            const instr = jumble.substring(i, i + 7);

            if(instr.startsWith(`do()`)) {
                enabled = true;
            }

            if(instr.startsWith(`don't()`)) {
                enabled = false;
            }

        }

        
    }

    return { answer: sum, extraInfo: `Found ${matches} valid mul instructions` };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 161;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 48;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
