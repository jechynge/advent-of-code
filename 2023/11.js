import { constructGridFromInput, Grid } from '../utils/Grid.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const starMap = constructGridFromInput(input);
    starMap.initialValue = '.';

    for(let x = starMap.width - 1; x > -1; x--) {

        let columnHasGalaxy = false;

        for(let y = 0; y < starMap.height; y++) {
            const cell = starMap.getCell([ x, y ]);

            if(cell !== starMap.initialValue) {
                columnHasGalaxy = true;
                break;
            }
        }

        if(!columnHasGalaxy) {
            starMap.addColumn(x);
        }

    }

    for(let y = starMap.height - 1; y > -1; y--) {

        let rowHasGalaxy = false;

        for(let x = 0; x < starMap.width; x++) {
            const cell = starMap.getCell([ x, y ]);

            if(cell !== starMap.initialValue) {
                rowHasGalaxy = true;
                break;
            }
        }

        if(!rowHasGalaxy) {
            starMap.addRow(y);
        }
    }

    const galaxyPositions = starMap.reduce((galaxyPositions, cell, coordinates) => {
        if(cell !== starMap.initialValue) {
            galaxyPositions.push(coordinates);
        }

        return galaxyPositions;
    }, []);

    let distance = 0;

    for(let i = 0; i < galaxyPositions.length; i++) {
        const from = galaxyPositions[ i ];

        for(let j = i + 1; j < galaxyPositions.length; j++) {
            const to = galaxyPositions[ j ];

            distance += Grid.GetManhattanDistance(from, to);
        }
    }

    return { answer: distance, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const starMap = constructGridFromInput(input);
    starMap.initialValue = '.';

    const emptyColumns = [];

    for(let x = starMap.width - 1; x > -1; x--) {

        let columnHasGalaxy = false;

        for(let y = 0; y < starMap.height; y++) {
            const cell = starMap.getCell([ x, y ]);

            if(cell !== starMap.initialValue) {
                columnHasGalaxy = true;
                break;
            }
        }

        if(!columnHasGalaxy) {
            emptyColumns.push(x);
        }

    }

    const emptyRows = [];

    for(let y = starMap.height - 1; y > -1; y--) {

        let rowHasGalaxy = false;

        for(let x = 0; x < starMap.width; x++) {
            const cell = starMap.getCell([ x, y ]);

            if(cell !== starMap.initialValue) {
                rowHasGalaxy = true;
                break;
            }
        }

        if(!rowHasGalaxy) {
            emptyRows.push(y);
        }
    }

    const galaxyPositions = starMap.reduce((galaxyPositions, cell, coordinates) => {
        if(cell !== starMap.initialValue) {
            galaxyPositions.push(coordinates);
        }

        return galaxyPositions;
    }, []);

    let distance = 0;

    for(let i = 0; i < galaxyPositions.length; i++) {
        const from = galaxyPositions[ i ];

        for(let j = i + 1; j < galaxyPositions.length; j++) {
            const to = galaxyPositions[ j ];

            const { topLeft, bottomRight } = Grid.GetBoundingBoxForCoordinatePair(from, to);

            const gridDistance = Grid.GetManhattanDistance(from, to);

            const expansionDistanceX = emptyColumns.reduce((count, x) => {
                return topLeft[0] < x && x < bottomRight[0] ? count + 1 : count;
            }, 0) * 999999;

            const expansionDistanceY = emptyRows.reduce((count, y) => {
                return topLeft[1] < y && y < bottomRight[1] ? count + 1 : count;
            }, 0) * 999999;

            distance += gridDistance + expansionDistanceX + expansionDistanceY;
        }
    }

    return { answer: distance, extraInfo: undefined };

}
