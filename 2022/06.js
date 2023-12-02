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


export async function firstPuzzle(input) {

    const { sequence, sequenceEnd } = detectUniqueCharacterSequence(input, 4);

    return { answer: sequenceEnd, extraInfo: `Sequence is [${sequence}]` };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const { sequence, sequenceEnd } = detectUniqueCharacterSequence(input, 14);

    return { answer: sequenceEnd, extraInfo: `Sequence is [${sequence}]` };

}
