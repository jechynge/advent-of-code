import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import Grid from '../utils/Grid.js';


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


////////////
// Part 1 //
////////////


function clamp(i, min, max) {
    return Math.min(Math.max(i, max), min);
}

// shapeOrigin is the top left coordinate
function isValidMove(shapeOrigin, hitbox, grid, transform = [0,0]) {

    if(isNaN(parseInt(transform[0])) || isNaN(parseInt(transform[1]))) {
        throw new Error(`Invalid transform [${transform}]`);
    }

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

            const horizontalHitbox = jet === '<' ? shape.leftHitbox : shape.rightHitbox;
            const transform = jet === '<' ? [-1,0] : [1,0];
            
            if(isValidMove(shapeOrigin, horizontalHitbox, grid, transform)) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, transform);
            }

            // If we can move down further, move the shape origin down 1 step
            if(isValidMove(shapeOrigin, shape.bottomHitbox, grid, [0,1])) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [0,1]);
            } else {
                // Otherwise, add the shape to the grid and update our highest layer
                grid.setShape(shapeOrigin, shape.layout, 'o');
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

    const timer = new PerformanceTimer('Puzzle 2');

    let grid = new Grid(7, 500);
    const jets = steamJetGenerator(input);

    let highestLayer = 0;

    for(let i = 0; i < 1000000000000; i++) {
        if(i % Math.floor(1000000000000 / 100) === 0) {
            console.log(Math.round(i / 1000000000000 * 100) + '% filtered...');
        }

        const shape = shapes[i % shapes.length];

        // top left coordinate
        let shapeOrigin = [ 2, grid.height + grid.offsetY - highestLayer - 1 - 3 - shape.height + 1 ];

        while(true) {
            // deal with the steam jet first
            const { value: jet } = jets.next();

            const horizontalHitbox = jet === '<' ? shape.leftHitbox : shape.rightHitbox;
            const transform = jet === '<' ? [-1,0] : [1,0];
            
            if(isValidMove(shapeOrigin, horizontalHitbox, grid, transform)) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, transform);
            }

            // If we can move down further, move the shape origin down 1 step
            if(isValidMove(shapeOrigin, shape.bottomHitbox, grid, [0,1])) {
                shapeOrigin = Grid.Transform2DCoordinate(shapeOrigin, [0,1]);
            } else {
                // Otherwise, add the shape to the grid and update our highest layer
                grid.setShape(shapeOrigin, shape.layout, 'o');
                highestLayer = Math.max(grid.height - shapeOrigin[1] + grid.offsetY, highestLayer);
                break;
            }
        }

        const solidRowIndex = grid.grid.findIndex(row => row.every(cell => !!cell));

        if(solidRowIndex === -1) {
            continue;
        }

        let newGrid = new Grid(7, 500, undefined, {
            offsetY: 500 - solidRowIndex + grid.offsetY
        });

        newGrid.grid = [...newGrid.grid.slice(0, 500 - solidRowIndex), ...grid.grid.slice(0, solidRowIndex)];
        // grid.print();
        grid = newGrid;
        // grid.print();
        console.log('replaced grid');
    }

    const highestShapeLayer = grid.grid.findIndex(row => row.some(cell => !!cell));

    timer.stop();

    printResult(`Part 2 Result`, grid.height - highestShapeLayer + grid.offsetY - 2, timer);
}
