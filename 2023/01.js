import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const answer = getLinesFromInput(input).reduce((sum, calibrationValues) => {
        const digits = [ ...calibrationValues.matchAll(/\d/g) ];

        const num = parseInt(`${digits[0]}${digits[digits.length - 1]}`);

        return sum + num;

    }, 0);

    return { answer };
    
}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const numberStrings = [
        'zero',
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine'
    ];

    const answer = getLinesFromInput(input).reduce((sum, calibrationValues) => {
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
                firstDigit = numberStringIndex;
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
                lastDigit = numberStringIndex;
                break;
            }
        }

        const num = parseInt(`${firstDigit ?? ''}${lastDigit ?? ''}`) || 0;

        return sum + num;

    }, 0);
    
    return { answer };
}
