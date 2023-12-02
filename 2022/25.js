import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


function fromSNAFU(sNum) {
    const lookup = {
        0: 0,
        1: 1,
        2: 2,
        '-': -1,
        '=': -2
    };

    return sNum.split('').reverse().reduce((dNum, sDig, i) => {
        const digit = lookup[sDig] * (5 ** i);

        return dNum + digit;
    }, 0);
}

function toSNAFU(dNum) {
    const lookup = ['0', '1', '2', '=', '-'];

    let sNum = '';
    let i = 0;

    while(dNum > 0) {
        const mod = 5 ** (i + 1);
        const div = 5 ** i;

        const num = (dNum % mod) / div;

        dNum -= (num * div);

        if(num > 2) {
            dNum += mod;
        }

        sNum = `${lookup[num]}${sNum}`;

        i++;
    }

    return sNum;
}

export async function firstPuzzle(input) {

    const sum = getLinesFromInput(input).map(fromSNAFU).reduce((sum, num) => sum + num, 0);

    return { answer: toSNAFU(sum) };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    return { answer: null };
    
}
