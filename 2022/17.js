import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import Grid from '../utils/Grid.js';


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


////////////
// Part 1 //
////////////


function clamp(i, min, max) {
    return Math.min(Math.max(i, max), min);
}

// shapeOrigin is the top left coordinate
function isValidMove(shapeOrigin, hitbox, grid, transform = [0,0]) {
    return Grid.GetShapeCoordinates(shapeOrigin, hitbox, transform).every(nextPosition => {
        return grid.isValidCell(nextPosition) && !grid.getCell(nextPosition);
    });
}

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

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const grid = new Grid(7, 5000);
    const jets = steamJetGenerator(input);

    let highestLayer = 0;

    for(let i = 0; i < 2022; i++) {
        const shape = shapes[i % shapes.length];

        // top left coordinate
        let shapeOrigin = [ 2, grid.height - highestLayer - 1 - 3 - shape.height + 1 ];

        while(true) {
            // deal with the steam jet first
            const { value: jet } = jets.next();

            if(jet === '<') {
                if(shapeOrigin[0] > 0) {
                    if(isValidMove(shapeOrigin, shape.leftHitbox, grid, [-1,0])) {
                        shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [-1,0]);
                    }
                }
            } else {
                if(shapeOrigin[0] + shape.width < grid.width) {
                    if(isValidMove(shapeOrigin, shape.rightHitbox, grid, [1,0])) {
                        shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [1,0]);
                    }
                }
            }

            // If we can move down further, move the shape origin down 1 step
            if(isValidMove(shapeOrigin, shape.bottomHitbox, grid, [0,1])) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [0,1]);
            } else {
                // Otherwise, add the shape to the grid and update our highest layer
                grid.setShape(shapeOrigin, shape.layout, '#');
                highestLayer = Math.max(grid.height - shapeOrigin[1], highestLayer);
                break;
            }
        }
    }

    timer.stop();

    printResult(`Part 1 Result`, highestLayer, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {

    const TOTAL_ROCKS = 1000000;


    const timer = new PerformanceTimer('Puzzle 2');
    const replaceTimer = new PerformanceTimer('Grid Replacements', { delayStart: true });
    const collisionTimer = new PerformanceTimer('Collision Calculations', { delayStart: true });


    const GRID_HEIGHT = 1000;
    
    const TRIM_HEIGHT = GRID_HEIGHT - 20;

    let grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
    const jets = steamJetGenerator(input);

    let highestShapeOriginY = grid.height;

    let gridReplacements = 0;
    let closestIndex = Infinity;

    for(let i = 0; i < TOTAL_ROCKS; i++) {
        // if(i % Math.floor(TOTAL_ROCKS / 1000) === 0) {
        //     console.log((i / TOTAL_ROCKS * 100).toFixed(1) + '% of rocks simulated...');
        // }

        const shape = shapes[i % shapes.length];

        const initialJetPattern = `${jets.next().value}${jets.next().value}${jets.next().value}${jets.next().value}`;

        // top left coordinate
        let shapeOrigin = [ shape.startingXPositions[initialJetPattern], highestShapeOriginY - shape.height ];

        // grid.setShape(shapeOrigin, shape.layout, '@');

        // grid.print('.', TRIM_HEIGHT);

        // grid.setShape(shapeOrigin, shape.layout, undefined);


        
        while(true) {
            if(isValidMove(shapeOrigin, shape.bottomHitbox, grid, [0,1])) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [0,1]);

                // grid.setShape(shapeOrigin, shape.layout, '@');

                // grid.print('.', TRIM_HEIGHT);

                // grid.setShape(shapeOrigin, shape.layout, undefined);
            } else {
                // Otherwise, add the shape to the grid and update our highest layer
                grid.setShape(shapeOrigin, shape.layout, '#');
                highestShapeOriginY = Math.min(shapeOrigin[1], highestShapeOriginY);
                break;
            }
            collisionTimer.start();

            const { value: jet } = jets.next();

            if(jet === '<') {
                if(shapeOrigin[0] > 0) {
                    if(isValidMove(shapeOrigin, shape.leftHitbox, grid, [-1,0])) {
                        shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [-1,0]);
                    }
                }
            } else {
                if(shapeOrigin[0] + shape.width < grid.width) {
                    if(isValidMove(shapeOrigin, shape.rightHitbox, grid, [1,0])) {
                        shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [1,0]);
                    }
                }
            }
            
        collisionTimer.stop();

            // grid.setShape(shapeOrigin, shape.layout, '@');

            // grid.print('.', TRIM_HEIGHT);

            // grid.setShape(shapeOrigin, shape.layout, undefined);

            // If we can move down further, move the shape origin down 1 step
            
        }

        // grid.print('.', TRIM_HEIGHT);
        replaceTimer.start();

        if(highestShapeOriginY - grid.offsetY > 25) {
            replaceTimer.stop();
            continue;
        }

        const solidRowIndex = grid.grid.findIndex(row => row.every(cell => !!cell));

        if(solidRowIndex === -1) {
            replaceTimer.stop();
            continue;
        }

        closestIndex = Math.min(closestIndex, solidRowIndex);
        gridReplacements++;


        // console.log(`Found solid row at index ${solidRowIndex}`);
        grid.translateY(-(grid.height - solidRowIndex));

        replaceTimer.stop();
    }

    timer.stop();

    printResult(`Part 2 Result`, Math.abs(highestShapeOriginY - grid.height), timer, `Grid changed ${gridReplacements} times - smallest index was ${closestIndex}`, replaceTimer.toString(true), collisionTimer.toString(true));
}
