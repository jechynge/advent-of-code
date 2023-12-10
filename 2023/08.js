import { getCharacterGenerator } from '../utils/Generators.js';
import { getLinesFromInput } from '../utils/Input.js';
import { lowestCommonMultiple } from '../utils/Math.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const [ directionSequence, , ...lines ] = getLinesFromInput(input);

    const nodes = lines.reduce((nodes, line) => {
        const thisNode = line.substring(0, 3);
        const leftNode = line.substring(7, 10);
        const rightNode = line.substring(12, 15);

        nodes[thisNode] = [ leftNode, rightNode ];

        return nodes;
    }, {});

    const directions = getCharacterGenerator(directionSequence);

    let currentNode = 'AAA';
    let steps = 0;

    while(currentNode !== 'ZZZ') {
        const { value: direction } = directions.next();

        currentNode = nodes[currentNode][direction === 'L' ? 0 : 1];

        ++steps;
    }

    return { answer: steps, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const [ directionSequence, , ...lines ] = getLinesFromInput(input);

    const paths = [];

    const nodes = lines.reduce((nodes, line) => {
        const thisNode = line.substring(0, 3);
        const leftNode = line.substring(7, 10);
        const rightNode = line.substring(12, 15);

        nodes[thisNode] = [ leftNode, rightNode ];

        if(thisNode[2] === 'A') {
            paths.push([ thisNode, 0 ]);
        }

        return nodes;
    }, {});

    const directions = getCharacterGenerator(directionSequence);
    let done = false;

    for(let steps = 1; !done; steps++) {

        let finished = 0;

        const { value: direction } = directions.next();

        for(const path of paths) {
            
            if(path[0][2] === 'Z') {
                ++finished;
                continue;
            }

            path[0] = nodes[path[0]][direction === 'L' ? 0 : 1];
            ++path[1];
        }

        done = finished === paths.length;
    }

    const requiredSteps = paths.map(([, steps]) => steps).reduce(lowestCommonMultiple);

    return { answer: requiredSteps, extraInfo: undefined };

}
