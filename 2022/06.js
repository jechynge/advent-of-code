import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';


function detectUniqueCharacterSequence(input, sequenceLength) {
    let sequenceEnd = 0;
    let sequence = '';

    while(sequence.length < sequenceLength && sequenceEnd < input.length) {
        const nextCharacter = input[sequenceEnd];
        const existingIndex = sequence.indexOf(nextCharacter);

        if(existingIndex > -1) {
            sequence = sequence.substring(existingIndex + 1);
        }

        sequence += nextCharacter;

        ++sequenceEnd;
    }

    if(sequence.length < sequenceLength) {
        throw new Error(`Non-repeating sequence of ${sequenceLength} was not found!`);
    }

    return {
        sequence,
        sequenceEnd
    };
}


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const { sequence, sequenceEnd } = detectUniqueCharacterSequence(input, 4);

    timer.stop();

    printResult(`Part 1 Result`, sequenceEnd, timer, `Sequence is [${sequence}]`);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const { sequence, sequenceEnd } = detectUniqueCharacterSequence(input, 14);

    timer.stop();

    printResult(`Part 2 Result`, sequenceEnd, timer, `Sequence is [${sequence}]`);
}
