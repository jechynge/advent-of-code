import _ from 'lodash';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, exit } from 'process';

const readline = createInterface({
    input: stdin,
    output: stdout
});

const COMBINATION_LENGTH = 5;
const ALLOWED_GUESSES = 5;

const combination = [];

for(let i = 0; i < COMBINATION_LENGTH; i++) {
    combination.push(_.random(0, 9, false));
}

let guesses = ALLOWED_GUESSES;
let correctCount;

do {

    let d = false;
    let s = false;

    const guessString = await readline.question(`Enter guess\n>`);

    const guessDigits = guessString.split('').map((digit) => parseInt(digit));

    const outputChars = {
        correct: new Array(COMBINATION_LENGTH).fill(' '),
        sum: new Array(COMBINATION_LENGTH).fill(' '),
        difference: new Array(COMBINATION_LENGTH).fill(' ')
    };

    correctCount = 0;

    for(let i = 0; i < COMBINATION_LENGTH; i++) {
        if(guessDigits[ i ] === combination[ i ]) {
            outputChars.correct[ i ] = 'Y';
            ++correctCount;
        }
    }

    if(correctCount === COMBINATION_LENGTH) {
        break;
    }

    for(let i = 0; i < COMBINATION_LENGTH; i++) {
        for(let j = i + 1; j < COMBINATION_LENGTH; j++) {
            if(guessDigits[ i ] === combination[ i ] && guessDigits[ j ] === combination[ j ]) {
                continue;
            }
            
            const correctSum = combination[ i ] + combination[ j ];
            const correctDifference = Math.abs(combination[ i ] - combination[ j ]);

            const guessSum = guessDigits[ i ] + guessDigits[ j ];
            const guessDifference = Math.abs(guessDigits[ i ] - guessDigits[ j ]);

            let clueFound = false;

            if(correctSum === guessSum) {
                outputChars.sum[ i ] = j;
                outputChars.sum[ j ] = i;

                clueFound = true;
            }
            
            if(correctDifference === guessDifference) {
                outputChars.difference[ i ] = j;
                outputChars.difference[ j ] = i;
                clueFound = true;
            }

            if(clueFound) {
                break;
            }
        }
    }

    

    console.log('c' + outputChars.correct.join(''));
    console.log('s' + outputChars.sum.join(''));
    console.log('d' + outputChars.difference.join(''));

    console.log('');

    --guesses;
} while(guesses > 0);


if(correctCount === COMBINATION_LENGTH) {
    console.log('Success!');
} else {
    console.log(`Combination was ${combination.join('')}`);
}

exit(0);