import Grid, { constructGridFromInput } from '../utils/Grid.js';
import { getLinesFromInput } from '../utils/Input.js';


const numberRegex = new RegExp(/\d+/g);


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const grid = constructGridFromInput(input);

    const isSymbolRegex = new RegExp(/[^0-9.]/);

    const symbolPositions = grid.reduce(( symbolPositions, cellValue, [ x, y ]) => {
        if(!isSymbolRegex.test(cellValue)) {
            return symbolPositions;
        }

        if(!Array.isArray(symbolPositions[y])) {
            symbolPositions[y] = [];
        }

        symbolPositions[y].push(x);

        return symbolPositions;
    }, { });

    const sum = getLinesFromInput(input).reduce((sum, line, numberPositionY) => {
        const numberMatches = line.matchAll(numberRegex);

        for (const numberMatch of numberMatches) {

            const topLeftNumberBoundary = [Math.max(numberMatch.index - 1, 0), Math.max(numberPositionY - 1, 0)];
            const bottomRightNumberBoundary = [numberMatch.index + numberMatch[0].length, numberPositionY + 1];

            for(let yOffset = -1; yOffset < 2; yOffset++) {
                const symbolPositionY = numberPositionY - yOffset;

                const hasAdjacentSymbol = symbolPositions[symbolPositionY]?.some((symbolPositionX) => 
                    Grid.IsCoordinateInBox([symbolPositionX, symbolPositionY], topLeftNumberBoundary, bottomRightNumberBoundary, true));

                if(hasAdjacentSymbol) {
                    sum += parseInt(numberMatch[0]);
                    break;
                }
            }
        }

        return sum;
    }, 0);

    return { answer: sum, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const grid = constructGridFromInput(input);

    const possibleGearPositions = grid.reduce(( symbolPositions, cellValue, [ x, y ]) => {
        if(cellValue !== '*') {
            return symbolPositions;
        }

        if(!symbolPositions[y]) {
            symbolPositions[y] = {};
        }

        symbolPositions[y][x] = [];

        return symbolPositions;
    }, { });

    getLinesFromInput(input).forEach((line, numberPositionY) => {
        const numberMatches = line.matchAll(numberRegex);

        for (const numberMatch of numberMatches) {

            const topLeftNumberBoundary = [Math.max(numberMatch.index - 1, 0), Math.max(numberPositionY - 1, 0)];
            const bottomRightNumberBoundary = [numberMatch.index + numberMatch[0].length, numberPositionY + 1];

            for(let yOffset = -1; yOffset < 2; yOffset++) {
                const gearPositionY = numberPositionY - yOffset;

                Object.entries(possibleGearPositions[gearPositionY] ?? {})?.forEach(([gearPositionX, partNumbers]) => {
                    const isAdjacent = Grid.IsCoordinateInBox([gearPositionX, gearPositionY], topLeftNumberBoundary, bottomRightNumberBoundary, true);

                    if(isAdjacent) {
                        partNumbers.push(parseInt(numberMatch[0]));
                    }
                });
            }
        }

    });

    const sum = Object.entries(possibleGearPositions).reduce((sum, [, possibleGearPositions]) => {
        return sum + Object.entries(possibleGearPositions).reduce((sum, [, partNumbers]) => {
            if(partNumbers.length !== 2) {
                return sum;
            }

            return sum + (partNumbers[0] * partNumbers[1]);
        }, 0);
    }, 0);

    return { answer: sum, extraInfo: undefined };

}
