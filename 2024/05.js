import { getLinesFromInput, splitAndParseIntsFromLine, splitByDoubleNewline } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';


const parseInput = (input) => {
    const [ ruleInput, updateInput ] = splitByDoubleNewline(input);

    const rules = getLinesFromInput(ruleInput)
        .map((line) => line.split('|')
        .map((x) => parseInt(x)));

    
    const updates = getLinesFromInput(updateInput).map((line) => splitAndParseIntsFromLine(line, ','));
    
    const size = rules.reduce((max, [ a, b ]) => {
        return Math.max(max, a, b);
    }, -1);

    const ruleGrid = new Grid(size, size, 0, { baseOne: true });

    rules.forEach(([ before, after ]) => {
        ruleGrid.setCell([ before, after ], -1);
        ruleGrid.setCell([ after, before ], 1);
    });

    return [ ruleGrid, updates ];
}

const isUpdateValid = (update, ruleGrid) => {

    for(let i = 0; i < update.length - 1; i++) {
        const before = update[ i ];
        
        for(let j = i + 1; j < update.length; j++) {
            const after = update[ j ];

            if(ruleGrid.getCell([ after, before ]) === -1) {
                return false;
            }
        }
    }

    return true;

}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const [ ruleGrid, updates ] = parseInput(input);

    const pageSum = updates.reduce((pageSum, update) => {

        return isUpdateValid(update, ruleGrid) ? pageSum + update[ update.length >>> 1 ] : pageSum;

    }, 0);

    return { answer: pageSum, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const [ ruleGrid, updates ] = parseInput(input);

    const pageSum = updates.reduce((pageSum, update) => {

        if(isUpdateValid(update, ruleGrid)) {
            return pageSum;
        }

        update.sort((before, after) => {
            return ruleGrid.getCell([ after, before ], 0);
        });

        return pageSum + update[ update.length >>> 1 ];

    }, 0);

    return { answer: pageSum, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 143;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 123;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
