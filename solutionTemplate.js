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

    const tests = [
        
    ];

    const failed = [];

    for(let i = 0; i < tests.length; i++) {
        const [ expected, input, ...params ] = tests[ i ];

        const { answer } = await secondPuzzle(input, ...params);

        if(answer !== expected) {
            failed.push(`Test ${i}: expected ${expected} - got ${answer}`);
        }
    }

    return { passed: failed.length === 0, extraInfo: failed.length === 0 ? `Passed ${tests.length} tests` : `Failed ${failed.length} tests:\n${failed.join('\n')}` };

}
