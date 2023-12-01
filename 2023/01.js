import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const sum = getLinesFromInput(input).reduce((sum, calibrationValues) => {
        const digits = [ ...calibrationValues.matchAll(/\d/g) ];

        const num = parseInt(`${digits[0]}${digits[digits.length - 1]}`);

        return sum + num;

    }, 0);

    timer.stop();

    printResult(`Part 1 Result`, sum, timer);
}


////////////
// Part 2 //
////////////

const numberStrings = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine'
]


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const sum = getLinesFromInput(input).reduce((sum, calibrationValues) => {
        let firstDigit, lastDigit;

        for(let i = 0; i < calibrationValues.length; i++) {
            if(/\d/.test(calibrationValues[i])) {
                firstDigit = calibrationValues[i];
                break;
            }

            const numberStringIndex = numberStrings.findIndex((numberString) => {
                return calibrationValues.indexOf(numberString, i) === i;
            });

            if(numberStringIndex > -1) {
                firstDigit = numberStringIndex + 1;
                i += numberStrings[numberStringIndex].length;
                break;
            }
        }

        for(let j = calibrationValues.length - 1; j > -1; j--) {
            if(/\d/.test(calibrationValues[j])) {
                lastDigit = calibrationValues[j];
                break;
            }

            const numberStringIndex = numberStrings.findIndex((numberString) => {
                return calibrationValues.lastIndexOf(numberString, j) === j;
            });

            if(numberStringIndex > -1) {
                lastDigit = numberStringIndex + 1;
                break;
            }
        }

        const num = parseInt(`${firstDigit ?? ''}${lastDigit ?? ''}`) || 0;

        return sum + num;

    }, 0);

    timer.stop();

    printResult(`Part 2 Result`, sum, timer);
}
