import { detectNewline } from 'detect-newline';

export function getLinesFromInput(input) {
    if(typeof input !== 'string') {
        throw new Error(`Invalid type for param "input" - expected string but got [${typeof text}]`);
    }

    return input.split(detectNewline(input));
}

export function splitByDoubleNewline(input) {
    if(typeof input !== 'string') {
        throw new Error(`Invalid type for param "input" - expected string but got [${typeof text}]`);
    }

    const newlineCharacter = detectNewline(input);

    return input.split(`${newlineCharacter}${newlineCharacter}`);
}

export function removeBlankLines(input) {
    if(typeof input !== 'string') {
        throw new Error(`Invalid type for param "input" - expected string but got [${typeof text}]`);
    }

    const newlineCharacter = detectNewline(input);

    const blankLineRegex = new RegExp(`${newlineCharacter}+`, 'g')

    return input.replaceAll(blankLineRegex, `${newlineCharacter}`);
}