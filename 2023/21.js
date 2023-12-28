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

    const edgeLength = passableTiles.width;
    
    const cornerCoordinates = [ 0, edgeLength - 1 ];

    const cornerFloods = [];

    for(let i = 0; i < cornerCoordinates.length; i++) {
        for(let j = 0; j < cornerCoordinates.length; j++) {
            const flooded = floodGrid(passableTiles, [ cornerCoordinates[ i ], cornerCoordinates[ j ] ]);
            
            cornerFloods.push(flooded);
        }
    }

    const center = (edgeLength - 1) / 2;
    
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

    const fullyVisitedStepCounts = cornerFloods[0].reduce((count, { steps }) => {
        if(steps === -1) {
            return count;
        }

        count[ steps % 2 ]++;

        return count;
    }, [ 0, 0 ]);

    const fullGridCountA = (maxSteps - center) / edgeLength;
    const fullGridCountB = fullGridCountA - 1;

    const evenGardensSteps = fullyVisitedStepCounts[ (fullGridCountA + 1) % 2 ] * fullGridCountA * fullGridCountA;
    const oddGardensSteps = fullyVisitedStepCounts[ (fullGridCountB + 1) % 2 ] * fullGridCountB * fullGridCountB;

    // Count the points of the diamond

    const evenOrOddPoints = (edgeLength - center) % 2;

    const pointCounts = edgeFloods.reduce((count, floodMap) => {
        return count + floodMap.reduce((count, { steps }) => {
            if(steps === -1 || steps > edgeLength || steps % 2 !== evenOrOddPoints) {
                return count;
            }
    
            return count + 1;
        }, 0);
    }, 0);

    // Count the diagonal edges

    const evenOrOddExteriorDiagonal = (edgeLength - center) % 2;

    const interiorDiagonalEdgeCounts = cornerFloods.map((floodMap) => {
        const interiorEdgeCount = fullGridCountB * floodMap.reduce((count, { steps }) => {
            if(steps === -1 || steps > edgeLength + center || steps % 2 === evenOrOddExteriorDiagonal) {
                return count;
            }
    
            return count + 1;
        }, 0);

        return interiorEdgeCount;
    });

    const exteriorDiagonalEdgeCounts = cornerFloods.map((floodMap) => {
        const interiorEdgeCount = fullGridCountA * floodMap.reduce((count, { steps }) => {
            if(steps === -1 || steps > center || steps % 2 !== evenOrOddExteriorDiagonal) {
                return count;
            }
    
            return count + 1;
        }, 0);

        return interiorEdgeCount;
    });

    const diagonals = exteriorDiagonalEdgeCounts.reduce(calcSum, 0) + interiorDiagonalEdgeCounts.reduce(calcSum, 0);

    return { answer: evenGardensSteps + oddGardensSteps + pointCounts + diagonals, extraInfo: undefined };

}

// 606188475096422 (wrong - too high)
// 606188475096440 (wrong - also too high)
// 606188475096806
// 606188400246061
// 606188400245695

export async function test(input) {

    const EXPECTED = 25;
    const { answer } = await secondPuzzle(input, 4);

    return { passed: answer === EXPECTED, extraInfo: `Expected ${EXPECTED}, got ${answer}` };

    // const EXPECTED = 55;
    // const { answer } = await secondPuzzle(input, 7);

    // return { passed: answer === EXPECTED, extraInfo: `Expected ${EXPECTED}, got ${answer}` };

    // const EXPECTED = 151;
    // const { answer } = await secondPuzzle(input, 12);

    // return { passed: answer === EXPECTED, extraInfo: `Expected ${EXPECTED}, got ${answer}` };

    // const EXPECTED = 287;
    // const { answer } = await secondPuzzle(input, 17);

    // return { passed: answer === EXPECTED, extraInfo: `Expected ${EXPECTED}, got ${answer}` };

}