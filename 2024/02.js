import { getLinesFromInput, splitAndParseIntsFromLine } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';
import { identity } from '../utils/Math.js';

////////////
// Part 1 //
////////////

const isSafe = (report) => {
    const diffs = report.slice(0, -1).map((x, i) => x - report[i + 1]);
    const ident = Math.abs(diffs.map(identity).reduce((sum, x) => sum + x, 0));

    return ident === diffs.length && diffs.every(d => Math.abs(d) > 0 && Math.abs(d) < 4);
}

const findUnsafeLevels = (report) => {
    let unsafe = -1;

    let prevIdent = identity(report[ 0 ] - report[ 1 ]);

    for(let i = 1; i < report.length; i++) {
        const lvOne = report[ i - 1 ];
        const lvTwo = report[ i ];

        if(lvOne === lvTwo) {
            return [ i, i - 1 ];
        }

        const ident = identity(lvOne - lvTwo);

        if(ident !== prevIdent) {
            return [ i, i - 1, i - 2 ];
        }

        prevIdent = ident;

        const diff = Math.abs(lvOne - lvTwo);

        if(diff < 1 || diff > 3) {
            return [ i, i - 1 ];
        }
    }

    return unsafe;
}


export async function firstPuzzle(input) {

    const reports = getLinesFromInput(input).map(line => splitAndParseIntsFromLine(line));

    const safeCount = reports.reduce((safeCount, report) => {

        return isSafe(report) ? safeCount + 1 : safeCount;

    }, 0);

    return { answer: safeCount, extraInfo: `${safeCount} reports safe out of ${reports.length} total` };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const reports = getLinesFromInput(input).map(line => splitAndParseIntsFromLine(line));

    let additionalFixed = 0;

    const safeCount = reports.reduce((safeCount, report, ri) => {

        if(isSafe(report)) {
            return safeCount + 1;
        }

        const tryWithout = findUnsafeLevels(report);

        const nowSafe = tryWithout.some(unsafeIndex => {
            const modifiedReport = [ ...report ];

            modifiedReport.splice(unsafeIndex, 1);
    
            return isSafe(modifiedReport);
        });

        // fallback testing

        // for(let i = 0; i < report.length; i++) {
        //     const modifiedReport = [ ...report ];

        //     modifiedReport.splice(i, 1);
    
        //     if(isSafe(modifiedReport) && !nowSafe) {
        //         console.log('missed report', report.join(' '), `thought ${unsafeIndex} or prev was bad`);
        //     }
        // }

        if(nowSafe) {
            ++additionalFixed;

            return safeCount + 1;
        }

        return safeCount;

    }, 0);

    return { answer: safeCount, extraInfo: `Fixed an additional ${additionalFixed} reports` };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 2;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 4;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
