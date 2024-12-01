import { getLinesFromInput, splitAndParseIntsFromLine} from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const col1 = [];
    const col2 = [];

    getLinesFromInput(input).map(line => splitAndParseIntsFromLine(line, '   ')).forEach(([l, r]) => {

        col1.push(l);
        col2.push(r);

    });

    col1.sort((a, b) => a - b);
    col2.sort((a, b) => a - b);

    const diff = col1.reduce((d, l, i) => {
        return d + Math.abs(l - col2[ i ]);
    }, 0);

    return { answer: diff };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const col1 = [];
    const col2 = [];

    getLinesFromInput(input).map(line => splitAndParseIntsFromLine(line, '   ')).forEach(([l, r]) => {

        col1.push(l);
        col2.push(r);

    });

    const counts = {};
    
    col2.forEach((digit) => {
        if(!counts[ digit ]) {
            counts[ digit ] = 1;
        } else {
            ++counts[ digit ];
        }
    });

    const score = col1.reduce((score, digit) => {
        return score + digit * ( counts[ digit ] ?? 0 );
    }, 0);

    return { answer: score, extraInfo: undefined };

}
