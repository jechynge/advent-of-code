import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
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

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const sum = getLinesFromInput(input).map(fromSNAFU).reduce((sum, num) => sum + num, 0);

    timer.stop();

    printResult(`Part 1 Result`, toSNAFU(sum), timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    // ...todo

    timer.stop();

    printResult(`Part 2 Result`, null, timer);
}
