import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';
import Grid, { GRID_ORTHOGONAL_MOVEMENT, GRID_ORTHOGONAL_TRANSFORMS } from '../utils/Grid.js';


////////////
// Part 1 //
////////////


const CONSIDER = [
    {
        check: [7,0,1],
        // [
        //     GRID_ORTHOGONAL_MOVEMENT.north_west, 
        //     GRID_ORTHOGONAL_MOVEMENT.north, 
        //     GRID_ORTHOGONAL_MOVEMENT.north_east
        // ],
        move: GRID_ORTHOGONAL_MOVEMENT.north
    },
    {
        check: [3,4,5],
        // [
        //     GRID_ORTHOGONAL_MOVEMENT.south_west, 
        //     GRID_ORTHOGONAL_MOVEMENT.south, 
        //     GRID_ORTHOGONAL_MOVEMENT.south_east
        // ],
        move: GRID_ORTHOGONAL_MOVEMENT.south
    },
    {
        check: [5,6,7],
        // [
        //     GRID_ORTHOGONAL_MOVEMENT.north_west, 
        //     GRID_ORTHOGONAL_MOVEMENT.west, 
        //     GRID_ORTHOGONAL_MOVEMENT.south_west
        // ],
        move: GRID_ORTHOGONAL_MOVEMENT.west
    },
    {
        check: [1,2,3],
        // [
        //     GRID_ORTHOGONAL_MOVEMENT.north_east, 
        //     GRID_ORTHOGONAL_MOVEMENT.east, 
        //     GRID_ORTHOGONAL_MOVEMENT.south_east
        // ],
        move: GRID_ORTHOGONAL_MOVEMENT.east
    }
];

const toKey = (coordinates) => `${coordinates[0]},${coordinates[1]}`;
const fromKey = (coordinateString) => coordinateString.split(',').map(i => parseInt(i));

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const layoutInput = getLinesFromInput(input).map(line => line.split(''));

    const MAX_ROUNDS = 10000;
    const width = layoutInput[0].length + MAX_ROUNDS * 2;
    const height = layoutInput.length + MAX_ROUNDS * 2;

    const pad = MAX_ROUNDS;

    const grove = new Grid(width, height);
    const elves = new Set();

    layoutInput.forEach((row, y) => {
        row.forEach((cell, x) => {
            if(cell === '#') {
                const coordinates = [x + pad, y + pad];
                grove.setCell(coordinates, '#');
                elves.add(toKey(coordinates));
            }
        });
    });

    let totalRounds;

    for(let round = 0; round < MAX_ROUNDS; round++) {
        // A dictionary of elf coordinates and validity indexed by their proposed destination coordinates
        const proposedMoves = {};

        for(const elf of elves) {
            const elfCoordinates = fromKey(elf);

            let noNeighbors = true;
            const openSurroundingCells = GRID_ORTHOGONAL_TRANSFORMS.map((transform) => {
                const isOpen = !grove.getCell(Grid.Transform2DCoordinate(elfCoordinates, transform));
                
                noNeighbors = isOpen && noNeighbors;

                return isOpen;
            });

            // If there are no elves around this one, they won't move
            if(noNeighbors) {
                continue;
            }

            for(let i = 0; i < CONSIDER.length; i++) {
                const consideredMove = CONSIDER[(round + i) % CONSIDER.length];

                if(!consideredMove.check.every(index => openSurroundingCells[index])) {
                    continue;
                }

                const proposedMove = Grid.Transform2DCoordinate(elfCoordinates, consideredMove.move);
                const key = toKey(proposedMove);

                if(proposedMoves[key] === undefined) {
                    proposedMoves[key] = {
                        from: [...elfCoordinates],
                        valid: true
                    };
                } else {
                    proposedMoves[key].valid = false;
                }

                break;
            }
        }

        const moveEntries = Object.entries(proposedMoves);

        if(moveEntries.length === 0) {
            totalRounds = round + 1;

            break;
        }

        moveEntries.forEach(([moveToKey, { from: moveFromCoordinate, valid }]) => {
            if(!valid) return;

            grove.setCell(moveFromCoordinate, undefined);
            grove.setCell(fromKey(moveToKey), '#');
            elves.delete(toKey(moveFromCoordinate));
            elves.add(moveToKey);
        });

        // grove.print({trimY: true});
    }

    const { minPopulatedRow, maxPopulatedRow } = grove.findPopulatedRowBoundary();
    const { minPopulatedColumn, maxPopulatedColumn } = grove.findPopulatedColumnBoundary();

    const populatedWidth = maxPopulatedColumn - minPopulatedColumn + 1;
    const populatedHeight = maxPopulatedRow - minPopulatedRow + 1;

    timer.stop();

    printResult(`Part 1 Result`, (populatedHeight * populatedWidth) - elves.size, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    // ...todo

    timer.stop();

    printResult(`Part 2 Result`, null, timer);
}
