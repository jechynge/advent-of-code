import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import Grid, { GRID_CARDINAL_MOVEMENT } from '../utils/Grid.js';


const GRID_WIDTH = 7;

const shapes = [
    {
        width: 4,
        height: 1,
        layout: [
            [ 0, 1, 2, 3 ]
        ],
        bottomHitbox: [
            [ 0, 1, 2, 3 ]
        ],
        leftHitbox: [
            [ 0 ] 
        ],
        rightHitbox: [
            [ 3 ]
        ]
    },
    {
        width: 3,
        height: 3,
        layout: [
               [ 1 ],
            [ 0, 1, 2 ],
               [ 1 ]
        ],
        bottomHitbox: [
               [   ],
            [ 0,    2 ],
               [ 1 ]
        ],
        leftHitbox: [
               [ 1 ],
            [ 0       ],
               [ 1 ]
        ],
        rightHitbox: [
               [ 1 ],
            [       2 ],
               [ 1 ]
        ]
    },
    {
        width: 3,
        height: 3,
        layout: [
                  [ 2 ],
                  [ 2 ],
            [ 0, 1, 2 ]
        ],
        bottomHitbox: [
                  [   ],
                  [   ],
            [ 0, 1, 2 ]
        ],
        leftHitbox: [
                  [ 2 ],
                  [ 2 ],
            [ 0       ]

        ],
        rightHitbox: [
                  [ 2 ],
                  [ 2 ],
            [       2 ]
        ]
    },
    {
        width: 1,
        height: 4,
        layout: [
            [ 0 ],
            [ 0 ],
            [ 0 ],
            [ 0 ]
        ],
        bottomHitbox: [
            [   ],
            [   ],
            [   ],
            [ 0 ]
        ],
        leftHitbox: [
            [ 0 ],
            [ 0 ],
            [ 0 ],
            [ 0 ]
        ],
        rightHitbox: [
            [ 0 ],
            [ 0 ],
            [ 0 ],
            [ 0 ]
        ]
    },
    {
        width: 2,
        height: 2,
        layout: [
            [ 0, 1 ],
            [ 0, 1 ]
        ],
        bottomHitbox: [
            [      ],
            [ 0, 1 ]
        ],
        leftHitbox: [
            [ 0    ],
            [ 0    ]
        ],
        rightHitbox: [
            [    1 ],
            [    1 ]
        ]
    }
];

shapes.forEach(shape => {
    shape.startingXPositions = [
        '<<<<',
    
        '<<<>',
        '<<><',
        '<><<',
        '><<<',
    
        '>>>>',
    
        '>>><',
        '>><>',
        '><>>',
        '<>>>',
    
        '>><<',
        '<<>>',
        '><><',
        '<><>',
    
        '<>><',
        '><<>'
    ].reduce((startingXPositions, startingWindPattern) => {
        const startingXPosition = startingWindPattern.split('').reduce((xPosition, jet) => {
            if(jet === '<') {
                if(xPosition > 0) {
                    return xPosition - 1;
                }
            } else {
                if(xPosition + shape.width < GRID_WIDTH) {
                    return xPosition + 1;
                }
            }

            return xPosition;
        }, 2);

        return {
            [startingWindPattern]: startingXPosition,
            ...startingXPositions
        };
    }, {});
})

function* steamJetGenerator(input) {
    let i = 0;
    const jets = input.split('');

    while(true) {
        yield jets[i];

        i++;

        if(i === jets.length) {
            i = 0;
        }
    }
}


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const TOTAL_ROCKS = 2022;
    const GRID_HEIGHT = TOTAL_ROCKS * 2;

    let grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
    const jets = steamJetGenerator(input);

    let highestShapeOriginY = grid.height;

    for(let i = 0; i < TOTAL_ROCKS; i++) {
        const shape = shapes[i % shapes.length];

        // Whatever shape spawns, it's guaranteed to not collide with anything other than the walls for the first four jets, so we can spawn it right above the tallest point of the tower
        const initialJetPattern = `${jets.next().value}${jets.next().value}${jets.next().value}${jets.next().value}`;

        // top left coordinate
        let shapeOrigin = [ shape.startingXPositions[initialJetPattern], highestShapeOriginY - shape.height ];
        
        while(true) {
            if(grid.isValidMove(shapeOrigin, shape.bottomHitbox, GRID_CARDINAL_MOVEMENT.down)) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, GRID_CARDINAL_MOVEMENT.down);
            } else {
                // Otherwise, add the shape to the grid and update our highest layer
                grid.setShape(shapeOrigin, shape.layout, '#');
                highestShapeOriginY = Math.min(shapeOrigin[1], highestShapeOriginY);
                break;
            }

            if(jets.next().value === '<') {
                if(shapeOrigin[0] > 0 && grid.isValidMove(shapeOrigin, shape.leftHitbox, GRID_CARDINAL_MOVEMENT.left)) {
                    shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, GRID_CARDINAL_MOVEMENT.left);
                }
            } else {
                if(shapeOrigin[0] + shape.width < grid.width && grid.isValidMove(shapeOrigin, shape.rightHitbox, GRID_CARDINAL_MOVEMENT.right)) {
                    shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, GRID_CARDINAL_MOVEMENT.right);
                }
            }
        }
    }

    timer.stop();

    printResult(`Part 1 Result`, grid.height - highestShapeOriginY, timer);
}


////////////
// Part 2 //
////////////


function areStatesEqual(a,b) {
    return !!a && !!b && ['shapeIndex', 'jets', 'transformX', 'transformY'].every(key => a[key] === b[key]);
}

export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const TOTAL_ROCKS = 1000000000000;

    const INPUT_LENGTH = input.split('').length;
    const CYCLE_DETECTION_START = INPUT_LENGTH;
    const MAX_SIMULATED_ROCKS = CYCLE_DETECTION_START + (INPUT_LENGTH * 2);
    const GRID_HEIGHT = MAX_SIMULATED_ROCKS * 2;
    const MINIMUM_OVERLAP = INPUT_LENGTH;

    let grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
    const jets = steamJetGenerator(input);

    let highestShapeOriginY = grid.height;

    const states = [];

    let cycleLength = -1;
    let overlapLength = 0;

    for(let i = 0; i < MAX_SIMULATED_ROCKS; i++) {
        const shape = shapes[i % shapes.length];

        // Whatever shape spawns, it's guaranteed to not collide with anything other than the walls for the first four jets, so we can spawn it right above the tallest point of the tower
        const initialJetPattern = `${jets.next().value}${jets.next().value}${jets.next().value}${jets.next().value}`;

        // top left coordinate
        let shapeOrigin = [ shape.startingXPositions[initialJetPattern], highestShapeOriginY - shape.height ];

        const state = {
            i,
            shapeIndex: i % shapes.length,
            jets: initialJetPattern,
            transformX: shapeOrigin[0] - 2,
            transformY: 0
        };
        
        while(true) {
            if(grid.isValidMove(shapeOrigin, shape.bottomHitbox, GRID_CARDINAL_MOVEMENT.down)) {
                state.transformY++;
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, GRID_CARDINAL_MOVEMENT.down);
            } else {
                // Otherwise, add the shape to the grid and update our highest layer
                grid.setShape(shapeOrigin, shape.layout, '#');
                highestShapeOriginY = Math.min(shapeOrigin[1], highestShapeOriginY);
                break;
            }

            const jet = jets.next().value;

            if(jet === '<') {
                if(shapeOrigin[0] > 0 && grid.isValidMove(shapeOrigin, shape.leftHitbox, GRID_CARDINAL_MOVEMENT.left)) {
                    state.transformX--;
                    shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, GRID_CARDINAL_MOVEMENT.left);
                }
            } else {
                if(shapeOrigin[0] + shape.width < grid.width && grid.isValidMove(shapeOrigin, shape.rightHitbox, GRID_CARDINAL_MOVEMENT.right)) {
                    state.transformX++;
                    shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, GRID_CARDINAL_MOVEMENT.right);
                }
            }
        }

        state.highestShapeOriginY = highestShapeOriginY;

        if(i >= CYCLE_DETECTION_START) {

            if(areStatesEqual(states[CYCLE_DETECTION_START + overlapLength], state)) {
                if(overlapLength === MINIMUM_OVERLAP) {
                    cycleLength = states.length - overlapLength - CYCLE_DETECTION_START;
                    break;
                }

                overlapLength++;
            } else {
                overlapLength = 0;
            } 
        }
        
        states.push(state);
    }

    const startIndex = ((TOTAL_ROCKS) % cycleLength) + cycleLength;

    const heightAtCycleStart = grid.height - states[startIndex - 1].highestShapeOriginY;
    const heightAtCycleEnd = grid.height - states[startIndex - 1 + cycleLength].highestShapeOriginY;
    const heightAddedPerCycle = heightAtCycleEnd - heightAtCycleStart;
    const projectedCycleCount = Math.floor((TOTAL_ROCKS - startIndex) / cycleLength);
    const projectedHeight = heightAtCycleStart + (heightAddedPerCycle * projectedCycleCount);

    timer.stop();

    printResult(`Part 2 Result`, projectedHeight, timer);
}
