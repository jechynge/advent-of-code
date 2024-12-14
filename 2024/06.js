import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput, GRID_CARDINAL_MOVEMENT, GRID_CARDINAL_ROTATION_CW } from '../utils/Grid.js';

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    let guardPosition;

    const map = constructGridFromInput(input, '', (char, coordinates) => {
        if(char === '^' || char === '>' || char === 'v' || char === '<') {
            guardPosition = [ ...coordinates ];
        }

        return char;
    });

    while(true) {
        const guardDirection = map.getCell(guardPosition);
        const nextCoordinates = Grid.Transform2DCoordinate(guardPosition, GRID_CARDINAL_MOVEMENT[ guardDirection ]);
        const nextCell = map.getCell(nextCoordinates);

        if(nextCell === null) {
            break;
        }

        if(nextCell === '#') {
            map.setCell(guardPosition, GRID_CARDINAL_ROTATION_CW[ guardDirection ]);
            continue;
        }

        guardPosition = [ ...nextCoordinates ];
        map.setCell(guardPosition, guardDirection);
    }

    const pathLength = map.reduce((count, char, coord) => {
        if(char === '^' || char === '>' || char === 'v' || char === '<') {
            return count + 1;
        }

        return count;
    }, 0);

    return { answer: pathLength, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    let guardPosition;
    let guardDirection;

    const map = constructGridFromInput(input, '', (char, coordinates) => {
        if(char === '^' || char === '>' || char === 'v' || char === '<') {
            guardPosition = [ ...coordinates ];
            guardDirection = char;
        }

        return char;
    });

    let anomalyPositions = {};

    while(true) {
        
        const nextCoordinates = Grid.Transform2DCoordinate(guardPosition, GRID_CARDINAL_MOVEMENT[ guardDirection ]);
        const nextCell = map.getCell(nextCoordinates);

        if(nextCell === null) {
            break;
        }

        const currentCell = map.getCell(guardPosition) ?? '';

        if(nextCell === '#') {
            guardDirection = GRID_CARDINAL_ROTATION_CW[ guardDirection ];
            map.setCell(guardPosition, `${currentCell}${guardDirection}`);
            continue;
        }

        // Only consider placing an obstacle if we haven't already deemed this
        // a valid position AND we haven't crossed through it yet
        if(!anomalyPositions[ nextCoordinates.join(',') ] && nextCell === '.') {

            const testObstaclePosition = [ ...nextCoordinates ];

            let testGuardPosition = [ ...guardPosition ];
            let testGuardDirection = GRID_CARDINAL_ROTATION_CW[ guardDirection ];

            const testPath = {};

            while(true) {

                const nextTestGuardPosition = Grid.Transform2DCoordinate(testGuardPosition, GRID_CARDINAL_MOVEMENT[ testGuardDirection ]);
                const nextTestCell = map.getCell(nextTestGuardPosition);

                if(nextTestCell === null) {
                    break;
                }

                // Check if we've run into a permanent obstacle or our proposed
                // obstacle
                if(nextTestCell === '#' || Grid.AreCoordinatesEqual(nextTestGuardPosition, testObstaclePosition)) {

                    // Check the permanent path if we've traversed this cell in 
                    // this direction
                    const currentTestCell = map.getCell(testGuardPosition);

                    if(currentTestCell.indexOf(testGuardDirection) > -1) {
                        anomalyPositions[testObstaclePosition.join(',')] = 'p';
                        break;
                    }

                    // Check the new path we've created by placing an obstacle to
                    // see if we've traversed in this direction
                    const vk = testGuardPosition.join(',');
                    const vr = testPath[vk] ?? '';

                    if(vr.indexOf(testGuardDirection) > -1) {
                        anomalyPositions[testObstaclePosition.join(',')] = 'n';
                        break;
                    }

                    // Mark the test path with our current direction
                    testPath[vk] = `${vr}${testGuardDirection}`;

                    testGuardDirection = GRID_CARDINAL_ROTATION_CW[ testGuardDirection ];
                    continue;
                    
                }

                // Otherwise, keep moving our test guard
                testGuardPosition = [ ...nextTestGuardPosition ];
            }
            
        }

        guardPosition = [ ...nextCoordinates ];
        map.setCell(guardPosition, `${nextCell}${guardDirection}`);
    }

    return { answer: Object.keys(anomalyPositions).length, extraInfo: null };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 41;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 6;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
