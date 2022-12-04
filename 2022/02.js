import { printResult } from '../utils/PrettyPrint.js';
import { getLinesFromInput } from '../utils/Input.js';


const playPoints = {
    X: 1,
    Y: 2,
    Z: 3
};

const resolutionModifierMatrix = {
    // They pick rock...
    A: {
        // ...and I pick rock
        X: 1,
        // ...and I pick paper
        Y: 2,
        // ...and I pick scissors
        Z: 0
    },
    // They pick paper...
    B: {
        // ...and I pick rock
        X: 0,
        // ...and I pick paper
        Y: 1,
        // ...and I pick scissors
        Z: 2
    },
    // They pick scissors...
    C: {
        // ...and I pick rock
        X: 2,
        // ...and I pick paper
        Y: 0,
        // ...and I pick scissors
        Z: 1
    }
};

const playPickerMatrix = {
    // They pick rock...
    A: {
        // ...and I need to lose, so I pick scissors
        X: 'Z',
        // ...and I need to draw, so I pick rock
        Y: 'X',
        // ...and I need to win, so I pick paper
        Z: 'Y'
    },
    // They pick paper...
    B: {
        // ...and I need to lose, so I pick rock
        X: 'X',
        // ...and I need to draw, so I pick paper
        Y: 'Y',
        // ...and I need to win, so I pick scissors
        Z: 'Z'
    },
    // They pick scissors...
    C: {
        // ...and I need to lose, so I pick paper
        X: 'Y',
        // ...and I need to draw, so I pick scissors
        Y: 'Z',
        // ...and I need to win, so I pick rock
        Z: 'X'
    }
};


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const partOneResults = [ 0, 0, 0 ];

    const partOnePoints = getLinesFromInput(input).reduce((accum, play) => {
        const [ theirPlay, myPlay ] = play.split(' ');

        const resolutionModifier = resolutionModifierMatrix[theirPlay][myPlay];

        partOneResults[resolutionModifier]++;

        return accum + playPoints[myPlay] + (3 * resolutionModifier);
    }, 0);

    printResult('Part 1', partOnePoints, null, `Wins: ${partOneResults[2]} | Draws: ${partOneResults[1]} | Losses: ${partOneResults[0]}`);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {

    const partTwoResults = [ 0, 0, 0 ];

    const partTwoPoints = getLinesFromInput(input).reduce((accum, play) => {
        const [ theirPlay, myOutcome ] = play.split(' ');
    
        const myPlay = playPickerMatrix[theirPlay][myOutcome];
    
        const resolutionModifier = resolutionModifierMatrix[theirPlay][myPlay];
    
        partTwoResults[resolutionModifier]++;
    
        return accum + playPoints[myPlay] + (3 * resolutionModifier);
    }, 0);
    
    printResult('Part 2', partTwoPoints, null, `Wins: ${partTwoResults[2]} | Draws: ${partTwoResults[1]} | Losses: ${partTwoResults[0]}`);
}
