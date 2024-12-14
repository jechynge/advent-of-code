import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';

////////////
// Part 1 //
////////////


const tryAddMul = (ops, target) => {

    if(ops.length === 1) {
        return ops[ 0 ] === target;
    }

    const op1 = ops.shift();
    const op2 = ops.shift();

    const mul = op1 * op2;
    const add = op1 + op2;

    const mulValid = mul <= target ? tryAddMul([ mul, ...ops ], target) : false;
    
    const addValid = add <= target ? tryAddMul([ add, ...ops ], target) : false;

    return mulValid || addValid;
    
}


export async function firstPuzzle(input) {

    const opSum = getLinesFromInput(input).map((line) => {
        const [ result, opsStr ] = line.split(': ');

        const ops = opsStr.split(' ').map((x) => parseInt(x));

        return [ parseInt(result), ops ];
    }).reduce((sum, [ target, ops ]) => {
        return tryAddMul(ops, target) ? sum + target : sum;
    }, 0);  

    return { answer: opSum, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


const tryAddMulConcat = (ops, target) => {

    if(ops.length === 1) {
        return ops[ 0 ] === target;
    }

    const op1 = ops.shift();
    const op2 = ops.shift();

    const mul = op1 * op2;
    const add = op1 + op2;
    const concat = parseInt(`${op1}${op2}`);

    const mulValid = mul <= target ? tryAddMulConcat([ mul, ...ops ], target) : false;
    
    const addValid = add <= target ? tryAddMulConcat([ add, ...ops ], target) : false;

    const concatValid = concat <= target ? tryAddMulConcat([ concat, ...ops ], target) : false;

    return mulValid || addValid || concatValid;
    
}


export async function secondPuzzle(input) {

    const opSum = getLinesFromInput(input).map((line) => {
        const [ result, opsStr ] = line.split(': ');

        const ops = opsStr.split(' ').map((x) => parseInt(x));

        return [ parseInt(result), ops ];
    }).reduce((sum, [ target, ops ]) => {
        return tryAddMulConcat(ops, target) ? sum + target : sum;
    }, 0);  

    return { answer: opSum, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 3749;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 11387;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
