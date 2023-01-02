import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput, splitByDoubleNewline } from '../utils/Input.js';
import Grid, { GRID_CARDINAL_TRANSFORMS } from '../utils/Grid.js';


////////////
// Part 1 //
////////////


const arrows = ['^', '>', 'v', '<'];

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const [layoutInput, directionInput] = splitByDoubleNewline(input).map(getLinesFromInput);

    const width = layoutInput.reduce((maxWidth, row) => Math.max(maxWidth, row.length), 0);

    const map = new Grid(width, layoutInput.length);

    let startCoordinates;

    layoutInput.forEach((row, y) => {
        row.split('').forEach((cell, x) => {
            map.setCell([x, y], cell === ' ' ? undefined : cell);

            if(!startCoordinates && cell === '.') {
                startCoordinates = [x,y];
            }
        });
    });

    let i = 0;
    let transformIndex = 1;
    let coordinates = [...startCoordinates];

    const directions = directionInput[0];

    while(i < directions.length) {
        const leftTurnIndex = !~directions.indexOf('L', i) ? Infinity : directions.indexOf('L', i);
        const rightTurnIndex = !~directions.indexOf('R', i) ? Infinity : directions.indexOf('R', i);
        const turnIndex = Math.min(leftTurnIndex, rightTurnIndex);

        const steps = parseInt(directions.substring(i, turnIndex));
        const turn = directions.substring(turnIndex, turnIndex + 1);

        for(let step = 0; step < steps; step++) {
            let nextCoordinates = Grid.Transform2DCoordinate(coordinates, GRID_CARDINAL_TRANSFORMS[transformIndex]);

            let nextCell = map.getCell(nextCoordinates);

            if(!nextCell) {
                if(transformIndex % 2 === 0) {
                    const column = map.getColumn(nextCoordinates[0]);
    
                    const nextY = transformIndex === 0 ?
                        column.findLastIndex(cell => !!cell) :
                        column.findIndex(cell => !!cell);
                    
                    nextCoordinates = [nextCoordinates[0], nextY];
                } else {
                    const row = map.getRow(nextCoordinates[1]);
    
                    const nextX = transformIndex === 3 ?
                        row.findLastIndex(cell => !!cell) :
                        row.findIndex(cell => !!cell);
    
                    nextCoordinates = [nextX, nextCoordinates[1]];
                }
            }

            nextCell = map.getCell(nextCoordinates);

            if(nextCell === '#') {
                break;
            }

            coordinates = [...nextCoordinates];

            // map.setCell(coordinates, arrows[transformIndex]);
            // map.print({emptyCellValue: ' '});
            // map.setCell(coordinates, '.');
        }

        if(turn) {
            transformIndex = (transformIndex + (turn === 'R' ? 1 : 3)) % GRID_CARDINAL_TRANSFORMS.length;
        }

        i = turnIndex + 1;
    }

    const column = coordinates[0] + 1;
    const row = coordinates[1] + 1;
    const facing = (transformIndex + 3) % 4;

    const answer = (1000 * row) + (4 * column) + facing;

    timer.stop();

    printResult(`Part 1 Result`, answer, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const [layoutInput, directionInput] = splitByDoubleNewline(input).map(getLinesFromInput);

    const width = layoutInput.reduce((maxWidth, row) => Math.max(maxWidth, row.length), 0);
    const height = layoutInput.length;

    const map = new Grid(width, height);

    let startCoordinates;

    layoutInput.forEach((row, y) => {
        row.split('').forEach((cell, x) => {
            map.setCell([x, y], cell === ' ' ? undefined : cell);

            if(!startCoordinates && cell === '.') {
                startCoordinates = [x,y];
            }
        });
    });

    let i = 0;
    let transformIndex = 1;
    let coordinates = [...startCoordinates];

    const directions = directionInput[0];

    while(i < directions.length) {
        const leftTurnIndex = !~directions.indexOf('L', i) ? Infinity : directions.indexOf('L', i);
        const rightTurnIndex = !~directions.indexOf('R', i) ? Infinity : directions.indexOf('R', i);
        const turnIndex = Math.min(leftTurnIndex, rightTurnIndex);

        const steps = parseInt(directions.substring(i, turnIndex));
        const turn = directions.substring(turnIndex, turnIndex + 1);

        for(let step = 0; step < steps; step++) {
            let nextCoordinates = Grid.Transform2DCoordinate(coordinates, GRID_CARDINAL_TRANSFORMS[transformIndex]);

            let nextCell = map.getCell(nextCoordinates);
            let edgeTransformIndex;

            if(!nextCell) {
                if(transformIndex % 2 === 0) {
                    // Moving up/down
                    const horizontalSector = Math.floor(nextCoordinates[0] / 50);
                    const horizontalSectorPosition = nextCoordinates[0] % 50;

                    if(horizontalSector === 0) {
                        if(transformIndex === 0) {
                            // Moving up
                            nextCoordinates = [50, 50 + horizontalSectorPosition];
                            edgeTransformIndex = 1; // now moving right
                        } else {
                            // Moving down
                            nextCoordinates = [100 + horizontalSectorPosition, 0];
                            edgeTransformIndex = 2; // still moving down
                        }
                    } else if(horizontalSector === 1) {
                        if(transformIndex === 0) {
                            // Moving up
                            nextCoordinates = [0, 150 + horizontalSectorPosition];
                            edgeTransformIndex = 1; // now moving right
                        } else {
                            // Moving down
                            nextCoordinates = [49, 150 + horizontalSectorPosition];
                            edgeTransformIndex = 3; // now moving left
                        }
                    } else if(horizontalSector === 2) {
                        if(transformIndex === 0) {
                            // Moving up
                            nextCoordinates = [horizontalSectorPosition, 199];
                            edgeTransformIndex = 0; // still moving up
                        } else {
                            // Moving down
                            nextCoordinates = [99, 50 + horizontalSectorPosition];
                            edgeTransformIndex = 3; // now moving left
                        }
                    }
                } else {
                    // Moving left/right
                    const verticalSector = Math.floor(nextCoordinates[1] / 50);
                    const verticalSectorPosition = nextCoordinates[1] % 50;

                    if(verticalSector === 0) {
                        if(transformIndex === 3) {
                            // Moving left
                            nextCoordinates = [0, 149 - verticalSectorPosition];
                            edgeTransformIndex = 1; // now moving right
                        } else {
                            // Moving right
                            nextCoordinates = [99, 149 - verticalSectorPosition];
                            edgeTransformIndex = 3; // now moving left
                        }
                    } else if(verticalSector === 1) {
                        if(transformIndex === 3) {
                            // Moving left
                            nextCoordinates = [verticalSectorPosition, 100];
                            edgeTransformIndex = 2; // now moving down
                        } else {
                            // Moving right
                            nextCoordinates = [100 + verticalSectorPosition, 49];
                            edgeTransformIndex = 0; // now moving up
                        }
                    } else if(verticalSector === 2) {
                        if(transformIndex === 3) {
                            // Moving left
                            nextCoordinates = [50, 49 - verticalSectorPosition];
                            edgeTransformIndex = 1; // now moving right
                        } else {
                            // Moving right
                            nextCoordinates = [149, 49 - verticalSectorPosition];
                            edgeTransformIndex = 3; // now moving left
                        }
                    } else if(verticalSector === 3) {
                        if(transformIndex === 3) {
                            // Moving left
                            nextCoordinates = [50 + verticalSectorPosition, 0];
                            edgeTransformIndex = 2; // now moving down
                        } else {
                            // Moving right
                            nextCoordinates = [50 + verticalSectorPosition, 149];
                            edgeTransformIndex = 0; // now moving up
                        }
                    }
                }
            }

            nextCell = map.getCell(nextCoordinates);

            if(nextCell === '#') {
                break;
            }

            coordinates = [...nextCoordinates];
            transformIndex = edgeTransformIndex ?? transformIndex;
        }

        if(turn) {
            transformIndex = (transformIndex + (turn === 'R' ? 1 : 3)) % GRID_CARDINAL_TRANSFORMS.length;
        }

        i = turnIndex + 1;
    }

    const column = coordinates[0] + 1;
    const row = coordinates[1] + 1;
    const facing = (transformIndex + 3) % 4;

    const answer = (1000 * row) + (4 * column) + facing;

    timer.stop();

    printResult(`Part 2 Result`, answer, timer);
}
