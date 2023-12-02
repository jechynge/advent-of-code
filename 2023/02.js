import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const maxCubes = {
        red: 12,
        green: 13,
        blue: 14
    };

    const total = getLinesFromInput(input).reduce((sum, game, i) => {
        const reveals = game.split(': ')[1].split('; ').map((revealedHand) => revealedHand.split(', ').map((cubeCount) => cubeCount.split(' '))).flat(1).map(([ number, color ]) => [ parseInt(number), color ]);

        const possible = reveals.every(([ number, color ]) => number <= maxCubes[color]);

        return possible ? sum + i + 1 : sum;
    }, 0);

    return { answer: total, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const total = getLinesFromInput(input).reduce((sum, game, i) => {
        const reveals = game.split(': ')[1].split('; ').map((revealedHand) => revealedHand.split(', ').map((cubeCount) => cubeCount.split(' '))).flat(1).map(([ number, color ]) => [ parseInt(number), color ]);

        const minimumCubeSet = reveals.reduce((powers, [ number, color ]) => {
            return {
                ...powers,
                [color]: Math.max(powers[color], number)
            };
        }, {
            red: 0,
            green: 0,
            blue: 0
        });

        const setPower = Object.values(minimumCubeSet).reduce((power, number) => power * number, 1);

        return sum + setPower;
    }, 0);

    return { answer: total, extraInfo: undefined };

}
