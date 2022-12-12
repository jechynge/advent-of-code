import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';

const LOWEST_ELEVATION = 'a'.charCodeAt(0);
const HIGHEST_ELEVATION = 'z'.charCodeAt(0);


////////////
// Part 1 //
////////////


class Grid {
    constructor(width, height, initialValue) {
        this.width = width;
        this.height = height;

        this.grid = new Array(height).fill(undefined).map(() => new Array(width).fill(typeof initialValue === 'function' ? initialValue() : initialValue));
    }

    isValidCell([x, y]) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getCell([x, y]) {
        if(!this.isValidCell([x, y])) {
            return null;
        }

        return this.grid[y][x];
    }

    setCell([x, y], value) {
        if(!this.isValidCell([x, y])) {
            throw new Error(`Cell coordinates [${x}, ${y}] are invalid!`);
        }

        this.grid[y][x] = value;
    }

    getRow(y) {
        return this.grid[y];
    }

    getColumn(x) {
        return this.grid.map(row => row[x]);
    }

    static GetManhattanDistance(start, end) {
        return Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1]);
    }

    static AreCoordinatesEqual(coord1, coord2) {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }
}

class HeightMap extends Grid {
    constructor(layoutString) {
        let start = null;
        let destination = null;

        const grid = getLinesFromInput(layoutString).map((row, y) => row.split('').map((cellValue, x) => {
            if(cellValue === 'S') {
                start = [x, y];
                return LOWEST_ELEVATION;
            } else if(cellValue === 'E') {
                destination = [x, y];
                return HIGHEST_ELEVATION;
            } else {
                return cellValue.charCodeAt(0);
            }
        }));

        super(grid[0].length, grid.length);

        this.start = start;
        this.destination = destination;
        this.grid = grid;
    }

    getNextCardinalSteps([x, y]) {
        const currentHeight = this.getCell([x, y]);

        return [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1]
        ]
        .filter(coordinates => this.isValidCell(coordinates));
    }
}

const Step = (currentSteps, possibleRemainingSteps, previousCoordinates) => ({
    currentSteps,
    possibleRemainingSteps,
    estimatedSteps: currentSteps + possibleRemainingSteps,
    previousCoordinates
});

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const heightMap = new HeightMap(input);
    const cellDetails = new Grid(heightMap.width, heightMap.height);

    cellDetails.setCell(heightMap.start, Step(0, 0, null));

    const checkedCoordinates = [];

    // Stays sorted in ascending order based on estimatedSteps
    const uncheckedCoordinates = [heightMap.start];

    let currentCoordinates = uncheckedCoordinates.shift();

    while(currentCoordinates && !Grid.AreCoordinatesEqual(currentCoordinates, heightMap.destination)) {

        const currentStep = cellDetails.getCell(currentCoordinates);
        const nextSteps = heightMap.getNextCardinalSteps(currentCoordinates).map(coordinates => {
            const currentHeight = heightMap.getCell(currentCoordinates);
            const height = heightMap.getCell(coordinates);

            if(height - currentHeight > 1) {
                return null;
            }

            const estimatedCost = Grid.GetManhattanDistance(coordinates, heightMap.destination);

            return {
                coordinates,
                estimatedCost
            };
        }).filter(nextStep => !!nextStep);

        for(let i = 0; i < nextSteps.length; i++) {

            const nextStep = nextSteps[i];
            const step = Step(currentStep.currentSteps + 1, nextStep.estimatedCost, currentCoordinates);

            if(Grid.AreCoordinatesEqual(nextStep.coordinates, heightMap.destination)) {
                cellDetails.setCell(nextStep.coordinates, step);
                uncheckedCoordinates.unshift(nextStep.coordinates);
                break;
            }

            const existingUncheckedIndex = uncheckedCoordinates.findIndex(uncheckedCoordinates => Grid.AreCoordinatesEqual(uncheckedCoordinates, nextStep.coordinates));
            
            // See if we're already planning on checking this possible step from a better position
            if(existingUncheckedIndex > -1) {
                const waitingToCheckStep = cellDetails.getCell(uncheckedCoordinates[existingUncheckedIndex]);

                // We've found this possible step from a better position - skip it
                if(waitingToCheckStep.estimatedSteps <= step.estimatedSteps) {
                    continue;
                }
            }

            const existingCheckedIndex = checkedCoordinates.findIndex(checkedCoordinates => Grid.AreCoordinatesEqual(checkedCoordinates, nextStep.coordinates));

            // See if we've already visited this step from a shorter path
            if(existingCheckedIndex > -1) {
                const checkedStep = cellDetails.getCell(checkedCoordinates[existingCheckedIndex]);

                // We've already visited this step from a shorter path - skip it
                if(checkedStep.estimatedSteps <= step.estimatedSteps) {
                    continue;
                }
            }

            cellDetails.setCell(nextStep.coordinates, step);

            const insertAt = uncheckedCoordinates.findIndex(uncheckedCoordinates => {
                const uncheckedCoordinateStep = cellDetails.getCell(uncheckedCoordinates);

                return step.estimatedSteps < uncheckedCoordinateStep.estimatedSteps;
            });

            if(insertAt === -1) {
                uncheckedCoordinates.push(nextStep.coordinates);
            } else {
                uncheckedCoordinates.splice(insertAt, 0, nextStep.coordinates)
            }
        }

        checkedCoordinates.push(currentCoordinates);
        currentCoordinates = uncheckedCoordinates.shift();
    }

    timer.stop();

    const finalRoute = cellDetails.getCell(heightMap.destination);

    printResult(`Part 1 Result`, finalRoute.currentSteps, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const heightMap = new HeightMap(input);
    const cellDetails = new Grid(heightMap.width, heightMap.height);

    cellDetails.setCell(heightMap.destination, Step(0, 0, null));

    const checkedCoordinates = [];

    // Stays sorted in ascending order based on estimatedSteps
    const uncheckedCoordinates = [heightMap.destination];

    let currentCoordinates = uncheckedCoordinates.shift();

    while(currentCoordinates && heightMap.getCell(currentCoordinates) !== LOWEST_ELEVATION) {

        const currentStep = cellDetails.getCell(currentCoordinates);
        const nextSteps = heightMap.getNextCardinalSteps(currentCoordinates).map(coordinates => {
            const currentHeight = heightMap.getCell(currentCoordinates);
            const height = heightMap.getCell(coordinates);

            if(currentHeight - height > 1) {
                return null;
            }

            return {
                coordinates,
                estimatedCost: 0
            };
        }).filter(nextStep => !!nextStep);;

        for(let i = 0; i < nextSteps.length; i++) {

            const nextStep = nextSteps[i];
            const step = Step(currentStep.currentSteps + 1, nextStep.estimatedCost, currentCoordinates);

            if(heightMap.getCell(nextStep.coordinates) === LOWEST_ELEVATION) {
                cellDetails.setCell(nextStep.coordinates, step);
                uncheckedCoordinates.unshift(nextStep.coordinates);
                break;
            }

            const existingUncheckedIndex = uncheckedCoordinates.findIndex(uncheckedCoordinates => Grid.AreCoordinatesEqual(uncheckedCoordinates, nextStep.coordinates));
            
            // See if we're already planning on checking this possible step from a better position
            if(existingUncheckedIndex > -1) {
                const waitingToCheckStep = cellDetails.getCell(uncheckedCoordinates[existingUncheckedIndex]);

                // We've found this possible step from a better position - skip it
                if(waitingToCheckStep.estimatedSteps <= step.estimatedSteps) {
                    continue;
                }
            }

            const existingCheckedIndex = checkedCoordinates.findIndex(checkedCoordinates => Grid.AreCoordinatesEqual(checkedCoordinates, nextStep.coordinates));

            // See if we've already visited this step from a shorter path
            if(existingCheckedIndex > -1) {
                const checkedStep = cellDetails.getCell(checkedCoordinates[existingCheckedIndex]);

                // We've already visited this step from a shorter path - skip it
                if(checkedStep.estimatedSteps <= step.estimatedSteps) {
                    continue;
                }
            }

            cellDetails.setCell(nextStep.coordinates, step);

            const insertAt = uncheckedCoordinates.findIndex(uncheckedCoordinates => {
                const uncheckedCoordinateStep = cellDetails.getCell(uncheckedCoordinates);

                return step.estimatedSteps < uncheckedCoordinateStep.estimatedSteps;
            });

            if(insertAt === -1) {
                uncheckedCoordinates.push(nextStep.coordinates);
            } else {
                uncheckedCoordinates.splice(insertAt, 0, nextStep.coordinates)
            }
        }

        checkedCoordinates.push(currentCoordinates);
        currentCoordinates = uncheckedCoordinates.shift();
    }

    timer.stop();

    const finalRoute = cellDetails.getCell(currentCoordinates);

    printResult(`Part 2 Result`, finalRoute.currentSteps, timer);
}
