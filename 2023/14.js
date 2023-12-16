import { GRID_CARDINAL_MOVEMENT, constructGridFromInput } from '../utils/Grid.js';
import Range from '../utils/Range.js';


const getGridLoad = (total, cell, [, y], grid) => {
    if(cell !== 'O') {
        return total;
    }

    return total + grid.height - y;
};

const detectCycle = (items, minLength = 2) => {
    let cycleLength = minLength;

    while(cycleLength < items.length) {
        const a = items[0];
        const b = items[0 + cycleLength];

        if(a === b) {
            let isCycle = true;

            for(let i = 0; i < cycleLength; i++) {
                isCycle = items[i] === items[i + cycleLength] && items[i + cycleLength] === items[i + cycleLength * 2];

                if(!isCycle) {
                    break;
                }
            }

            if(isCycle) {
                return cycleLength;
            }
        }

        ++cycleLength;
    };

    return -1;
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const grid = constructGridFromInput(input, '', (x) => x === '.' ? undefined : x);

    const load = grid.forEach((cell, coordinates) => {
        if(cell !== 'O') {
            return;
        }

        let boulderCoordinates = [...coordinates];

        while(boulderCoordinates) {
            boulderCoordinates = grid.moveCell(boulderCoordinates, GRID_CARDINAL_MOVEMENT.north);
        }
    }).reduce(getGridLoad, 0);

    

    return { answer: load, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const grid = constructGridFromInput(input, '', (x) => x === '.' ? undefined : x);

    const loads = [];

    const SPIN_CYCLES = [
        GRID_CARDINAL_MOVEMENT.north,
        GRID_CARDINAL_MOVEMENT.west,
        GRID_CARDINAL_MOVEMENT.south,
        GRID_CARDINAL_MOVEMENT.east
    ];

    const ITERATION = [
        [ Range(0, grid.width), Range(0, grid.height) ],
        [ Range(grid.width, 0), Range(grid.height, 0) ]
    ];

    const CYCLE_COUNT = 1000000000;

    for(let i = 0; i < 1000; i++) {
        const cycleStage = i % SPIN_CYCLES.length;
        const transform = SPIN_CYCLES[cycleStage];
        const iterators = ITERATION[Math.floor(cycleStage / 2)];
        

        for(const x of iterators[0]) {
            for(const y of iterators[1]) {
                const cell = grid.getCell([x,y]);

                if(cell !== 'O') {
                    continue;
                }
        
                let boulderCoordinates = [x,y];
        
                while(boulderCoordinates) {
                    boulderCoordinates = grid.moveCell(boulderCoordinates, transform);
                }
            }
        }

        if(cycleStage === SPIN_CYCLES.length - 1) {
            const load = grid.reduce(getGridLoad, 0);
    
            loads.push(load);
        }
        
    }

    const reversed = [...loads].reverse();

    const cycleLength = detectCycle(reversed);

    if(cycleLength === -1) {
        throw new Error(`Cycle not found!`);
    }

    const cycles = loads.slice(-cycleLength);

    const cycleIndex = (CYCLE_COUNT - loads.length - 1) % cycleLength;

    return { answer: cycles[cycleIndex], extraInfo: undefined };

}
