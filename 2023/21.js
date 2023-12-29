import { getLinesFromInput } from '../utils/Input.js';
import { constructGridFromInput, GRID_CARDINAL_TRANSFORMS, Grid } from '../utils/Grid.js';
import { sum as calcSum } from '../utils/Math.js';

const floodGrid = (grid, startCoordinates, maxSteps = Infinity) => {

    const flooded = new Grid(grid.width, grid.height, () => ({
        visited: false,
        seen: false,
        steps: -1
    }));

    if(!grid.getCell(startCoordinates)) {
        return flooded;
    }

    const queue = [ [ 0, ...startCoordinates ] ];

    while(queue.length > 0) {

        const [ currentSteps, ...currentCoordinates ] = queue.shift();
        const currentCell = flooded.getCell(currentCoordinates);

        currentCell.steps = currentSteps;
        currentCell.visited = true;

        if(currentSteps === maxSteps) {
            continue;
        }

        for(const transform of GRID_CARDINAL_TRANSFORMS) {
            const nextCoordinates = Grid.Transform2DCoordinate(currentCoordinates, transform);

            const isPassable = grid.getCell(nextCoordinates);
            const nextCell = flooded.getCell(nextCoordinates);

            if(!isPassable || nextCell.visited) {
                continue;
            }

            const nextSteps = currentSteps + 1;

            const seenIndex = nextCell.seen ? queue.findIndex(([ steps, ...coordinates ]) => Grid.AreCoordinatesEqual(nextCoordinates, coordinates)) : -1;
            
            if(seenIndex > -1) {

                const [ seenSteps ] = queue[ seenIndex ];

                if(nextSteps >= seenSteps) {
                    continue;
                }

                queue.splice(seenIndex, 1);
            }

            const insertAt = queue.findIndex(([ steps ]) => currentSteps < steps);

            if(insertAt === -1) {
                queue.push([ nextSteps, ...nextCoordinates ]);
            } else {
                queue.splice(insertAt, 0, [ nextSteps, ...nextCoordinates ]);
            }

            nextCell.seen = true;
        }

    }

    return flooded;

};


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const MAX_STEPS = 64;

    const grid = constructGridFromInput(input);

    const startCoordinates = grid.findCellCoordinates((cell) => cell === 'S');
    const passableTiles = constructGridFromInput(input, '', (symbol) => symbol !== '#');

    const flooded = floodGrid(passableTiles, startCoordinates, MAX_STEPS);

    const visitedCount = flooded.reduce((count, cell) => count + (cell.steps % 2 === MAX_STEPS % 2), 0);

    return { answer: visitedCount, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input, maxSteps = 26501365) {

    const passableTiles = constructGridFromInput(input, '', (symbol) => symbol !== '#');

    const evenOdd = maxSteps % 2;

    const edgeLength = passableTiles.width;

    const center = (edgeLength - 1) / 2;

    const blockRadius = (maxSteps - center) / edgeLength;

    const ABGrid = floodGrid(passableTiles, [ center, center ]).forEach(({ steps }, coordinates, grid) => {
        if(steps === -1) {
            grid.setCell(coordinates, null);
        } else {
            grid.setCell(coordinates, steps % 2 === evenOdd ? 'A' : 'B');
        }
    });

    const cornerCoordinates = [ 0, edgeLength - 1 ];

    const cornerFloods = [];

    for(let i = 0; i < cornerCoordinates.length; i++) {
        for(let j = 0; j < cornerCoordinates.length; j++) {
            const flooded = floodGrid(passableTiles, [ cornerCoordinates[ i ], cornerCoordinates[ j ] ]);
            
            cornerFloods.push(flooded);
        }
    }
    
    const edgeCoordinates = [ 
        [ 0, center ], 
        [ center, 0 ], 
        [ edgeLength - 1, center ],
        [ center, edgeLength - 1 ]
    ];

    const edgeFloods = [];

    for(let i = 0; i < edgeCoordinates.length; i++) {
        const flooded = floodGrid(passableTiles, edgeCoordinates[ i ]);
        
        edgeFloods.push(flooded);
    }

    // Count the interior gardens that get fully explored

    const [ fullStepCountA, fullStepCountB ] = ABGrid.reduce((count, AB) => {
        if(!AB) {
            return count;
        }

        count[ AB.charCodeAt() - 65 ]++;

        return count;
    }, [ 0, 0 ]);


    const blockRadiusSquares = [ Math.pow(blockRadius, 2), Math.pow(blockRadius - 1, 2) ];
    
    const fullyExploredA = fullStepCountA * blockRadiusSquares[ (blockRadius + 1) % 2 ];
    const fullyExploredB = fullStepCountB * blockRadiusSquares[ blockRadius % 2 ];

    // Count the points of the diamond

    const pointsAB = blockRadius % 2 === 0 ? 'A' : 'B';

    const pointCounts = edgeFloods.reduce((count, floodMap) => {
        return count + floodMap.reduce((count, { steps }, coordinates) => {
            if(steps === -1 || steps >= edgeLength || ABGrid.getCell(coordinates) !== pointsAB) {
                return count;
            }
    
            return count + 1;
        }, 0);
    }, 0);

    // Count the diagonal edges

    const exteriorDiagonalEdgeLength = blockRadius;
    const interiorDiagonalEdgeLength = blockRadius - 1;

    const exteriorDiagonalAB = blockRadius % 2 === 0 ? 'B' : 'A';
    const interiorDiagonalAB = blockRadius % 2 === 0 ? 'A' : 'B';

    const exteriorDiagonalEdgeCounts = cornerFloods.map((floodMap) => {
        const exteriorEdgeCount = exteriorDiagonalEdgeLength * floodMap.reduce((count, { steps }, coordinates) => {
            if(steps === -1 || steps >= center || ABGrid.getCell(coordinates) !== exteriorDiagonalAB) {
                return count;
            }
    
            return count + 1;
        }, 0);

        return exteriorEdgeCount;
    });

    const interiorDiagonalEdgeCounts = cornerFloods.map((floodMap) => {
        const interiorEdgeCount = interiorDiagonalEdgeLength * floodMap.reduce((count, { steps }, coordinates) => {
            if(steps === -1 || steps >= edgeLength + center || ABGrid.getCell(coordinates) !== interiorDiagonalAB) {
                return count;
            }
    
            return count + 1;
        }, 0);

        return interiorEdgeCount;
    });

    const diagonals = exteriorDiagonalEdgeCounts.reduce(calcSum, 0) + interiorDiagonalEdgeCounts.reduce(calcSum, 0);

    return { answer: fullyExploredA + fullyExploredB + pointCounts + diagonals, extraInfo: undefined };

}


export async function test(input) {

    const threeSq = '...\n...\n...';
    const fiveSq = '.....\n.....\n.....\n.....\n.....';
    const fiveSqBlocked = '.....\n...#.\n.....\n.#...\n.....';
    const sevenSq = '.......\n.......\n.......\n.......\n.......\n.......\n.......';

    const tests = [
        [ 616583483179597, input, undefined ],
        [ 25, threeSq, 4 ],
        [ 64, threeSq, 7 ],
        [ 64, fiveSq, 7 ],
        [ 169, fiveSq, 12 ],
        [ 151, fiveSqBlocked, 12 ]
    ];

    const failed = [];

    for(let i = 0; i < tests.length; i++) {
        const [ expected, input, ...params ] = tests[ i ];

        const { answer } = await secondPuzzle(input, ...params);

        if(answer !== expected) {
            failed.push(`Test ${i}: expected ${expected} - got ${answer}`);
        }
    }

    return { passed: failed.length === 0, extraInfo: failed.length === 0 ? `Passed ${tests.length} tests` : `Failed ${failed.length} tests:\n${failed.join('\n')}` };

}