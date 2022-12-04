export function generateLine(length, character = '-') {
    if(typeof length !== 'number') {
        throw new Error(`Invalid type for param "length" - expected number but got [${typeof length}]`);
    }

    if(length < 1) {
        throw new Error(`Invalid value for param "length" - expected an integer greater than 0 but got [${length}]`);
    }

    if(typeof character !== 'string') {
        throw new Error(`Invalid type for param "character" - expected string but got [${typeof character}]`);
    }

    if(character.length !== 1) {
        throw new Error(`Invalid value for param "character" - expected a single character but got [${character}]`);
    }

    return ''.padEnd(length, character);
}

export function padString(text, pad = 1) {
    if(typeof text !== 'string') {
        throw new Error(`Invalid type for param "text" - expected string but got [${typeof text}]`);
    }

    if(pad < 1) {
        return text;
    }

    const padding = ''.padEnd(pad);

    return `${padding}${text}${padding}`;
}

export function printTitle(text) {
    const titleText = padString(text, 2);
    const line = generateLine(titleText.length, '=');

    console.log('');
    console.log(line);
    console.log(titleText);
    console.log(line);
}

export function printSubtitle(text) {
    const line = generateLine(text.length);

    console.log('');
    console.log(text);
    console.log(line);
}

export function printResult(heading, answer, performanceTimer, ...extraInfo) {
    const resultLineParts = [ `Answer is: [${answer}]` ];

    if(performanceTimer) {
        resultLineParts.push(`(took ${performanceTimer.toString()})`);
    }

    const resultLine = resultLineParts.join(' ');

    printSubtitle(heading.padEnd(resultLine.length));
    console.log(resultLine);

    if(extraInfo.length > 0) {
        console.log(extraInfo.join('\n'));
    }
}
