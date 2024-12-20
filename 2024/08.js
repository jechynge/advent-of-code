import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const nodeLocations = {};

    const nodeMap = constructGridFromInput(input, '', (x, coordinates) => {
        if(x !== '.') {
            nodeLocations[ x ] ??= [ ];

            nodeLocations[ x ].push(coordinates);
        }

        return x;
    });

    Object.entries(nodeLocations).forEach(([ , coordinateList ]) => {

        for(let i = 0; i < coordinateList.length - 1; i++) {
            const c1 = coordinateList[ i ];

            for(let j = i + 1; j < coordinateList.length; j++) {
                const c2 = coordinateList[ j ];
                
                const dx = Math.abs(c1[ 0 ] - c2[ 0 ]);
                const dy = Math.abs(c1[ 1 ] - c2[ 1 ]);

                const a1 = [
                    c1[ 0 ] < c2[ 0 ] ? c1[ 0 ] - dx : c1[ 0 ] + dx,
                    c1[ 1 ] < c2[ 1 ] ? c1[ 1 ] - dy : c1[ 1 ] + dy
                ];

                const a2 = [
                    c2[ 0 ] < c1[ 0 ] ? c2[ 0 ] - dx : c2[ 0 ] + dx,
                    c2[ 1 ] < c1[ 1 ] ? c2[ 1 ] - dy : c2[ 1 ] + dy
                ];

                if(nodeMap.isValidCell(a1)) {
                    nodeMap.setCell(a1, '#');
                }

                if(nodeMap.isValidCell(a2)) {
                    nodeMap.setCell(a2, '#');
                }
            }
        }
    }, 0);

    const antiNodeCount = nodeMap.reduce((count, node) => {
        return node === '#' ? count + 1 : count;
    }, 0);

    return { answer: antiNodeCount, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const nodeLocations = {};

    const nodeMap = constructGridFromInput(input, '', (x, coordinates) => {
        if(x !== '.') {
            nodeLocations[ x ] ??= [ ];

            nodeLocations[ x ].push(coordinates);
        }

        return x;
    });

    const markNodes = (coordinate, transform, nodeMap) => {

        let c = [ ...coordinate ];

        while(true) {

            if(!nodeMap.isValidCell(c)) {
                break;
            }

            nodeMap.setCell(c, '#');

            c = Grid.Transform2DCoordinate(c, transform);

        }

    };

    Object.entries(nodeLocations).forEach(([ , coordinateList ]) => {

        for(let i = 0; i < coordinateList.length - 1; i++) {
            const c1 = coordinateList[ i ];

            for(let j = i + 1; j < coordinateList.length; j++) {
                const c2 = coordinateList[ j ];

                const dx = Math.abs(c1[ 0 ] - c2[ 0 ]);
                const dy = Math.abs(c1[ 1 ] - c2[ 1 ]);

                const c1d = [
                    c1[ 0 ] < c2[ 0 ] ? -dx : dx,
                    c1[ 1 ] < c2[ 1 ] ? -dy : dy
                ];


                markNodes(c1, c1d, nodeMap);
                markNodes(c2, [ -c1d[ 0 ], -c1d[ 1 ] ], nodeMap);
            }
        }
    }, 0);

    const antiNodeCount = nodeMap.reduce((count, node) => {
        return node === '#' ? count + 1 : count;
    }, 0);

    return { answer: antiNodeCount, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 14;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 34;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
