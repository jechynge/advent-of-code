import { getLinesFromInput, splitAndParseIntsFromLine } from '../utils/Input.js';
import { sum as calculateSum } from '../utils/Math.js';


const getIncrements = (sequence) => {
    const increments = [];

    for(let i = 0; i < sequence.length - 1; i++) {
        increments.push(sequence[i + 1] - sequence[i]);
    }

    return increments;
}

const getNextValue = (sequence) => {
    const increments = getIncrements(sequence);

    const isZeroes = increments.every(increment => increment === 0);

    if(isZeroes) {
        return sequence[sequence.length - 1];
    } else {
        return sequence[sequence.length - 1] + getNextValue(increments);
    }
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const sequences = getLinesFromInput(input).map((line) => splitAndParseIntsFromLine(line));

    let sums = [];

    for(const sequence of sequences) {

        sums.push(getNextValue(sequence));
        
    }

    const sum = sums.reduce(calculateSum);

    return { answer: sum, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const sequences = getLinesFromInput(input).map((line) => splitAndParseIntsFromLine(line));

    let sums = [];

    for(const sequence of sequences) {

        sums.push(getNextValue(sequence.reverse()));
        
    }

    const sum = sums.reduce(calculateSum);

    return { answer: sum, extraInfo: undefined };

}
