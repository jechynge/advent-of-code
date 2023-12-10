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
        throw new Error(`Invalid type for param "input" - expected string but got [${typeof input}]`);
    }

    const newlineCharacter = detectNewline(input);

    const blankLineRegex = new RegExp(`${newlineCharacter}+`, 'g')

    return input.replaceAll(blankLineRegex, `${newlineCharacter}`);
}

export function getFixedWidthDataFromLine(line, width) {
    if(typeof line !== 'string') {
        throw new Error(`Invalid type for param "line" - expected string but got [${typeof line}]`);
    }

    if(typeof width !== 'number') {
        throw new Error(`Invalid type for param "width" - expected number but got [${typeof width}]`);
    }

    if(width < 0) {
        throw new Error(`Invalid value for param "width" - must be a positive integer`);
    }

    const data = [];

    for(let i = 0; i < line.length; i += width) {
        data.push(line.substring(i, i + width).trim());
    }

    return data;
}

export function parseSpacedDataFromLine(line, delimiter = ' ') {
    if(typeof line !== 'string') {
        throw new Error(`Invalid type for param "line" - expected string but got [${typeof line}]`);
    }

    if(typeof delimiter !== 'string') {
        throw new Error(`Invalid type for param "delimiter" - expected string but got [${typeof delimiter}]`);
    }

    if(delimiter.length !== 1) {
        throw new Error(`Invalid type value param "delimiter" - must be a single character.`);
    }

    const data = [];

    line = line.trim();

    for(let i = 0; i < line.length; i++) {
        let j = i;
        let currentValue = '';

        while(j < line.length && line[j] !== delimiter) {
            currentValue = `${currentValue}${line[j]}`;

            j++;
        }

        i = j;

        if(currentValue.trim() !== '') {
            data.push(currentValue.trim());
        }
    }

    return data;
}